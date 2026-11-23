import { test, expect, startPlayground, loginAsAdmin, PlaygroundSite } from '../../fixtures/playground';
import type { Browser, Page } from '@playwright/test';
import fs from 'node:fs';

/**
 * Content Transfer between two sites.
 *
 * The source site has the tutorial content; the target site starts with
 * the plugin and theme only. Everything goes through the Content Transfer
 * screen as a user would use it, and the sites' data is read with PHP.
 *
 *   1. Every edit-screen field is in the transfer registry (or is
 *      deliberately left out), so new fields are not silently dropped.
 *   2. Whole Instances (with pages and About) exported from the source
 *      import into the target: links point at the new posts, nothing is
 *      held, and every published Figure gets its standalone HTML.
 *   3. Exporting the same content from the target gives the same package
 *      as the source's, apart from IDs and addresses.
 *   4. A package from a newer version imports with a warning naming the
 *      fields it skips, and one with an unknown content type is refused.
 *   5. A spreadsheet (TSV) bulk import with bar and line charts gets the
 *      saved chart data built in the browser, then the HTML.
 *   6. Instances exported as spreadsheets, edited and bulk imported into
 *      the target come back with the source's fields, links and data.
 */

test.describe.configure({ mode: 'serial' });

let source: PlaygroundSite;
let target: PlaygroundSite;
let sourcePackage: string;

test.beforeAll(async () => {
    test.setTimeout(400_000);
    [source, target] = await Promise.all([
        startPlayground(),
        startPlayground({ tutorialContent: false }),
    ]);
});

test.afterAll(async () => {
    await Promise.all([source?.close(), target?.close()]);
});

/** Run PHP on a site with WordPress loaded and return what it echoes as JSON. */
async function php(site: PlaygroundSite, code: string): Promise<any> {
    const response = await site.playground.run({
        code: `<?php require '/wordpress/wp-load.php'; require_once ABSPATH . 'wp-admin/includes/admin.php'; ${code}`,
    });
    const text: string = response.text;
    try {
        return JSON.parse(text);
    } catch {
        throw new Error(`PHP did not return JSON:\n${text.slice(0, 3000)}`);
    }
}

/** Read manifest.json and content.json from a package on the host. */
async function readPackage(site: PlaygroundSite, file: string) {
    await site.playground.writeFile('/tmp/package.zip', new Uint8Array(fs.readFileSync(file)));
    return php(
        site,
        `$zip = new ZipArchive(); $zip->open('/tmp/package.zip');
        echo wp_json_encode(array(
            'manifest' => json_decode($zip->getFromName('manifest.json'), true),
            'content'  => json_decode($zip->getFromName('content.json'), true),
        ));`,
    );
}

/** Number of posts of each type, attachments and Instance Types on a site. */
async function countContent(site: PlaygroundSite): Promise<Record<string, any>> {
    return php(
        site,
        `$out = array();
        foreach (array('instance', 'scene', 'modal', 'figure', 'about', 'page', 'attachment') as $type) {
            $out[$type] = count(get_posts(array('post_type' => $type, 'post_status' => 'any', 'numberposts' => -1, 'fields' => 'ids')));
        }
        $out['instance_type'] = count(get_terms(array('taxonomy' => 'instance_type', 'hide_empty' => false)));
        $out['slugs'] = array();
        foreach (Graphic_Data_Transfer_Schema::get_post_types() as $type) {
            foreach (get_posts(array('post_type' => $type, 'post_status' => 'any', 'numberposts' => -1)) as $post) {
                $out['slugs'][] = $type . ':' . $post->post_name;
            }
        }
        $out['instance_type_slugs'] = get_terms(array('taxonomy' => 'instance_type', 'hide_empty' => false, 'fields' => 'slugs'));
        echo wp_json_encode($out);`,
    );
}

/** A logged-in page on a site, recording uncaught script errors. */
async function openAdmin(browser: Browser, site: PlaygroundSite) {
    const context = await browser.newContext({ baseURL: site.serverUrl });
    const page = await context.newPage();
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await loginAsAdmin(page, site.serverUrl);
    await page.goto('/wp-admin/admin.php?page=graphic-data-content-transfer');
    return { page, errors, close: () => context.close() };
}

/** IDs of a site's Instances that match a meta query. */
async function instanceIds(site: PlaygroundSite, metaQuery: string): Promise<number[]> {
    return php(
        site,
        `echo wp_json_encode(get_posts(array('post_type' => 'instance', 'post_status' => 'any', 'numberposts' => -1, 'fields' => 'ids', 'meta_query' => array(${metaQuery}))));`,
    );
}

/** Download Instances, with their pages and the About content. */
async function exportInstances(page: Page, file: string, ids: number[]) {
    expect(ids.length).toBeGreaterThan(0);
    for (const id of ids) {
        await page.locator(`input[name="instance_ids[]"][value="${id}"]`).check();
    }
    await page.locator('input[name="include_pages"]').check();
    await page.locator('input[name="include_about"]').check();
    const [download] = await Promise.all([
        page.waitForEvent('download'),
        page.locator('#graphic-data-transfer-export-form button[type="submit"]').click(),
    ]);
    await download.saveAs(file);
}

/** Upload a package and wait for the dry run (or the error). */
async function checkPackage(page: Page, file: string | { name: string; mimeType: string; buffer: Buffer }) {
    await page.setInputFiles('#graphic-data-transfer-import-file', file);
    await page.click('#graphic-data-transfer-import-check');
    const output = page.locator('#graphic-data-transfer-import-output');
    await output
        .locator('button.button-primary, .notice-error')
        .first()
        .waitFor({ timeout: 120_000 });
    return output;
}

/** Run the checked import and wait for the standalone HTML build. */
async function runImport(page: Page) {
    const output = page.locator('#graphic-data-transfer-import-output');
    await output.locator('button.button-primary').click();
    await output.locator('.notice-success').first().waitFor({ timeout: 300_000 });
    await expect(output.getByText(/Standalone HTML built for \d+ Figures?\./)).toBeVisible({ timeout: 300_000 });
    await expect(output.getByText(/could not be built/)).toHaveCount(0);
    return output;
}

/**
 * A package's content with everything that differs between sites (IDs,
 * addresses, server paths) replaced by names, so packages from two sites
 * can be compared.
 */
function canonical({ manifest, content }: any) {
    const labels = new Map<number, string>();
    const counts: Record<string, number> = {};
    for (const post of content.posts) {
        const base = `${post.post_type}:${post.post_title}`;
        counts[base] = (counts[base] ?? 0) + 1;
        labels.set(post.source_id, `${base}#${counts[base]}`);
    }
    const terms = new Map(content.terms.map((term: any) => [String(term.source_id), `term:${term.slug}`]));
    const urls: Array<[string, string]> = [];
    for (const media of content.media) {
        for (const [url, size] of Object.entries(media.source_urls)) {
            urls.push([url, `media:${media.file.split('/').pop()}:${size}`]);
        }
    }
    // Longest first, so an image's address is replaced before its size variants'.
    urls.sort((a, b) => b[0].length - a[0].length);
    const site = manifest.source.site_url;

    const text = (value: string) => {
        for (const [url, name] of urls) value = value.split(url).join(name);
        value = value.replace(/\/[^"']*?\/wp-content\/data\/figure_(\d+)\//g, (_, id) => `DATA(${labels.get(Number(id)) ?? id})/`);
        value = value.replace(/("figureId":\s*"?)(\d+)/g, (_, key, id) => key + (labels.get(Number(id)) ?? id));
        return value.split(site).join('SITE');
    };
    const clean = (value: any): any => {
        if (typeof value === 'string') return text(value);
        if (Array.isArray(value)) return value.map(clean);
        if (value && typeof value === 'object') {
            return Object.fromEntries(Object.entries(value).map(([key, inner]) => [key, clean(inner)]));
        }
        return value;
    };

    const references = new Map<string, string>();
    for (const ref of content.references) {
        if (ref.location === 'meta' && ref.in_package) {
            references.set(`${ref.post}:${ref.key}`, labels.get(ref.target_id) ?? `outside:${ref.target_title}`);
        }
    }
    const posts: Record<string, any> = {};
    for (const post of content.posts) {
        const meta: Record<string, any> = {};
        for (const [key, value] of Object.entries(post.meta)) {
            const link = references.get(`${post.source_id}:${key}`);
            meta[key] = link ?? (key === 'instance_type' && terms.has(String(value)) ? terms.get(String(value)) : clean(value));
        }
        const { source_id, meta: _meta, ...fields } = post;
        posts[labels.get(source_id)!] = { ...clean(fields), meta };
    }
    const checksum = (file: string) => manifest.checksums[file];
    return {
        posts,
        terms: content.terms.map(({ source_id, ...term }: any) => term),
        media: content.media
            .map((media: any) => ({
                file: media.file.split('/').pop(),
                checksum: checksum(media.file),
                mime: media.mime,
                title: media.title,
                alt: media.alt,
                caption: media.caption,
                description: media.description,
            }))
            .sort((a: any, b: any) => a.file.localeCompare(b.file)),
        data_files: content.data_files
            .map((data: any) => ({
                post: labels.get(data.post),
                field: data.field,
                file: data.file.split('/').pop(),
                checksum: checksum(data.file),
            }))
            .sort((a: any, b: any) => `${a.post}${a.field}`.localeCompare(`${b.post}${b.field}`)),
        counts: manifest.counts,
    };
}

test('every edit-screen field is transferred or deliberately left out', async () => {
    const result = await php(
        source,
        `require_once WP_CONTENT_DIR . '/plugins/graphic_data_plugin/admin/class-transfer-tsv.php';
        $fields = new ReflectionMethod('Graphic_Data_Transfer_Tsv', 'get_fields');
        $fields->setAccessible(true);
        $missing = array();
        foreach (array('instance', 'scene', 'modal', 'figure') as $type) {
            foreach ($fields->invoke(null, $type) as $field) {
                if (!empty($field['id']) && !in_array($field['id'], Graphic_Data_Transfer_Schema::get_meta_keys($type), true)) {
                    $missing[] = $field['id'];
                }
            }
        }
        echo wp_json_encode($missing);`,
    );
    // Preview buttons and the settings control store nothing; the iframe
    // code is rebuilt on import (Graphic_Data_Transfer_Schema::get_rebuilt_keys()).
    // A field missing here must be added to Graphic_Data_Transfer_Schema::get_meta_keys().
    expect(result.sort()).toEqual(
        [
            'figure_iframe_code',
            'figure_interactive_settings',
            'figure_preview',
            'figure_preview_mobile',
            'modal_preview',
            'modal_preview_mobile',
            'scene_preview',
            'scene_preview_mobile',
        ].sort(),
    );
});

test('whole Instances move from one site to another', async ({ browser }, testInfo) => {
    test.setTimeout(600_000);
    sourcePackage = testInfo.outputPath('source.zip');
    // The plugin's placeholder content is left out: each site has its own.
    const from = await openAdmin(browser, source);
    await exportInstances(
        from.page,
        sourcePackage,
        await instanceIds(source, `array('key' => 'graphic_data_placeholder_id', 'compare' => 'NOT EXISTS')`),
    );
    await from.close();

    // The new site already has the plugin's placeholder content.
    const existing = await countContent(target);
    const to = await openAdmin(browser, target);
    const output = await checkPackage(to.page, sourcePackage);
    await expect(output.locator('.notice-error')).toHaveCount(0);
    await runImport(to.page);
    expect(to.errors).toEqual([]);
    await to.close();

    const { manifest, content } = await readPackage(source, sourcePackage);
    const sourceCounts = manifest.counts;
    const state = await php(
        target,
        `$out = array('broken' => array(), 'held' => array(), 'no_html' => array(), 'no_render' => array());
        foreach (array('instance', 'scene', 'modal', 'figure', 'about', 'page') as $type) {
            // Only the posts this import created.
            $ids = get_posts(array('post_type' => $type, 'post_status' => 'any', 'numberposts' => -1, 'fields' => 'ids', 'meta_key' => Graphic_Data_Transfer_Schema::BATCH_META_KEY));
            foreach ($ids as $id) {
                foreach (Graphic_Data_Transfer_Schema::get_post_references($type) as $key => $target_type) {
                    $value = get_post_meta($id, $key, true);
                    if ('' !== $value && get_post_type((int) $value) !== $target_type) {
                        $out['broken'][] = "$type $id $key=$value";
                    }
                }
                $status_key = Graphic_Data_Transfer_Schema::get_publication_meta_key($type);
                if ($status_key && in_array(get_post_meta($id, $status_key, true), array('draft', 'Draft'), true)) {
                    $out['held'][] = get_the_title($id);
                }
                if ('figure' === $type && 'published' === get_post_meta($id, 'figure_published', true)) {
                    $html = get_post_meta($id, 'uploaded_path_html', true);
                    if (!$html || !file_exists($html)) {
                        $out['no_html'][] = get_the_title($id);
                    }
                    if ('Interactive' === get_post_meta($id, 'figure_path', true) && !json_decode((string) get_post_meta($id, 'figure_interactive_args_rendered', true))) {
                        $out['no_render'][] = get_the_title($id);
                    }
                }
            }
        }
        $out['queue'] = count(Graphic_Data_Figure_Html_Rebuild::get_queue());
        echo wp_json_encode($out);`,
    );

    const after = await countContent(target);
    const added: Record<string, number> = {};
    for (const type of ['instance', 'scene', 'modal', 'figure', 'page', 'attachment', 'instance_type']) {
        added[type] = after[type] - existing[type];
    }
    expect(added).toEqual({
        instance: sourceCounts.instance,
        scene: sourceCounts.scene,
        modal: sourceCounts.modal,
        figure: sourceCounts.figure,
        page: sourceCounts.page,
        attachment: sourceCounts.media,
        // Instance Types with an existing slug are reused.
        instance_type: content.terms.filter((term: any) => !existing.instance_type_slugs.includes(term.slug)).length,
    });
    // The package's About post replaces the site's, if it has one.
    expect(after.about).toBe(1);
    expect(state.broken).toEqual([]);
    // Only content that already existed here comes in as held copies.
    const copies = content.posts
        .filter((post: any) => post.post_type !== 'about' && existing.slugs.includes(`${post.post_type}:${post.post_name}`))
        .map((post: any) => post.post_title);
    expect(state.held.sort()).toEqual(copies.sort());
    expect(state.no_html).toEqual([]);
    expect(state.no_render).toEqual([]);
    expect(state.queue).toBe(0);
});

test('the target exports the same package as the source', async ({ browser }, testInfo) => {
    test.setTimeout(300_000);
    const targetPackage = testInfo.outputPath('target.zip');
    const to = await openAdmin(browser, target);
    await exportInstances(
        to.page,
        targetPackage,
        await instanceIds(target, `array('key' => Graphic_Data_Transfer_Schema::BATCH_META_KEY, 'compare' => 'EXISTS')`),
    );
    await to.close();

    const before = canonical(await readPackage(source, sourcePackage));
    const after = canonical(await readPackage(target, targetPackage));
    const packaged = ['instance', 'scene', 'modal', 'figure', 'about', 'page'].reduce((sum, type) => sum + before.counts[type], 0);
    expect(Object.keys(before.posts)).toHaveLength(packaged);
    expect(Object.keys(after.posts).sort()).toEqual(Object.keys(before.posts).sort());
    for (const label of Object.keys(before.posts)) {
        expect(after.posts[label], label).toEqual(before.posts[label]);
    }
    expect(after.terms).toEqual(before.terms);
    expect(after.media).toEqual(before.media);
    expect(after.data_files).toEqual(before.data_files);
    expect(after.counts).toEqual(before.counts);
});

test('a package from a newer version imports with a warning; an unknown type is refused', async ({ browser }) => {
    test.setTimeout(300_000);
    await target.playground.writeFile('/tmp/package.zip', new Uint8Array(fs.readFileSync(sourcePackage)));
    // Rewrite content.json and its checksum, as a newer exporter would write them.
    const edit = (change: string) =>
        php(
            target,
            `copy('/tmp/package.zip', '/tmp/edited.zip');
            $zip = new ZipArchive(); $zip->open('/tmp/edited.zip');
            $manifest = json_decode($zip->getFromName('manifest.json'), true);
            $content = json_decode($zip->getFromName('content.json'), true);
            $manifest['schema_version'] = Graphic_Data_Transfer_Schema::SCHEMA_VERSION + 1;
            $manifest['plugin_version'] = '99.0.0';
            ${change}
            $json = wp_json_encode($content);
            $manifest['checksums']['content.json'] = hash('sha256', $json);
            $zip->addFromString('content.json', $json);
            $zip->addFromString('manifest.json', wp_json_encode($manifest));
            $zip->close();
            echo wp_json_encode(base64_encode(file_get_contents('/tmp/edited.zip')));`,
        ).then((data: string) => ({ name: 'newer.zip', mimeType: 'application/zip', buffer: Buffer.from(data, 'base64') }));

    const newer = await edit(
        `foreach ($content['posts'] as &$post) { if ('figure' === $post['post_type']) { $post['meta']['figure_future_field'] = 'x'; } } unset($post);
        $content['terms'][0]['meta']['instance_future_option'] = 'y';`,
    );
    const to = await openAdmin(browser, target);
    let output = await checkPackage(to.page, newer);
    await expect(output.locator('.notice-error')).toHaveCount(0);
    await expect(output).toContainText('This package was made by a newer version of Graphic Data (99.0.0).');
    await expect(output).toContainText('Figure: figure_future_field; Instance Type: instance_future_option');

    const unknownType = await edit(
        `$content['posts'][] = array('source_id' => 999999, 'post_type' => 'storymap', 'post_title' => 'From the future', 'meta' => array());`,
    );
    await to.page.goto('/wp-admin/admin.php?page=graphic-data-content-transfer');
    output = await checkPackage(to.page, unknownType);
    await expect(output.locator('.notice-error')).toContainText('made by a newer version (99.0.0); update Graphic Data on this site');
    expect(to.errors).toEqual([]);
    await to.close();
});

test('a spreadsheet bulk import builds bar and line charts', async ({ browser }) => {
    test.setTimeout(400_000);
    // Rows built from the source site's tutorial bar and line figures: their
    // data files, settings, Scene artwork and Modal icon.
    const zip: string = await php(
        source,
        `$figure = function ($type) {
            foreach (get_posts(array('post_type' => 'figure', 'numberposts' => -1)) as $post) {
                $args = (string) get_post_meta($post->ID, 'figure_interactive_arguments', true);
                if (false !== strpos($args, $type) && get_post_meta($post->ID, 'uploaded_path_csv', true)) {
                    return $post->ID;
                }
            }
        };
        $bar = $figure('Plotly bar graph');
        $line = $figure('Plotly line graph (time series)');
        $modal = (int) get_post_meta($bar, 'figure_modal', true);
        $scene = (int) get_post_meta($modal, 'modal_scene', true);
        $uploads = wp_get_upload_dir();
        $svg = str_replace($uploads['baseurl'], $uploads['basedir'], get_post_meta($scene, 'scene_infographic', true));
        $tsv = function ($rows) {
            return implode("\\n", array_map(function ($row) {
                return implode("\\t", array_map(function ($cell) {
                    return preg_match('/[\\t\\n"]/', $cell) ? '"' . str_replace('"', '""', $cell) . '"' : $cell;
                }, $row));
            }, $rows)) . "\\n";
        };
        $row = function ($title, $id, $file) {
            return array('ref:inst', 'ref:scene', 'ref:modal', $title, 'published', 'Interactive', 'data/' . $file, (string) get_post_meta($id, 'figure_interactive_arguments', true));
        };
        $zip = new ZipArchive();
        $zip->open('/tmp/bulk.zip', ZipArchive::CREATE | ZipArchive::OVERWRITE);
        $zip->addFromString('instance_types.tsv', $tsv(array(array('ref', 'name', 'slug'), array('type', 'Bulk Type', 'bulk-type'))));
        $zip->addFromString('instances.tsv', $tsv(array(
            array('ref', 'post_title', 'instance_short_title', 'instance_slug', 'instance_type', 'instance_overview_scene', 'instance_status'),
            array('inst', 'Bulk Instance', 'Bulk', 'bulk-instance', 'ref:type', 'ref:scene', 'Published'),
        )));
        $zip->addFromString('scenes.tsv', $tsv(array(
            array('ref', 'post_title', 'scene_published', 'scene_location', 'scene_infographic'),
            array('scene', 'Bulk Scene', 'published', 'ref:inst', 'media/scene.svg'),
        )));
        $zip->addFromString('modals.tsv', $tsv(array(
            array('ref', 'post_title', 'modal_published', 'modal_location', 'modal_scene', 'modal_icons', 'icon_function', 'modal_tab_number', 'modal_tab_title1'),
            array('modal', 'Bulk Modal', 'published', 'ref:inst', 'ref:scene', (string) get_post_meta($modal, 'modal_icons', true), 'Modal', '1', 'Charts'),
        )));
        $zip->addFromString('figures.tsv', $tsv(array(
            array('location', 'figure_scene', 'figure_modal', 'post_title', 'figure_published', 'figure_path', 'figure_upload_file', 'figure_interactive_arguments'),
            $row('Bulk Bar', $bar, 'bar.csv'),
            $row('Bulk Line', $line, 'line.csv'),
        )));
        $zip->addFile($svg, 'media/scene.svg');
        $zip->addFile(get_post_meta($bar, 'uploaded_path_csv', true), 'data/bar.csv');
        $zip->addFile(get_post_meta($line, 'uploaded_path_csv', true), 'data/line.csv');
        $zip->close();
        echo wp_json_encode(base64_encode(file_get_contents('/tmp/bulk.zip')));`,
    );

    const to = await openAdmin(browser, target);
    const output = await checkPackage(to.page, { name: 'bulk.zip', mimeType: 'application/zip', buffer: Buffer.from(zip, 'base64') });
    await expect(output.locator('.notice-error')).toHaveCount(0);
    await runImport(to.page);
    expect(to.errors).toEqual([]);
    await to.close();

    const figures = await php(
        target,
        `$out = array();
        foreach (array('Bulk Bar', 'Bulk Line') as $title) {
            $post = get_posts(array('post_type' => 'figure', 'title' => $title, 'numberposts' => 1))[0];
            $rendered = json_decode((string) get_post_meta($post->ID, 'figure_interactive_args_rendered', true), true);
            $modal = (int) get_post_meta($post->ID, 'figure_modal', true);
            $out[$title] = array(
                'status'  => get_post_meta($post->ID, 'figure_published', true),
                'modal'   => get_the_title($modal),
                'traces'  => array_map(function ($trace) { return array('type' => $trace['type'] ?? '', 'points' => count((array) ($trace['y'] ?? array()))); }, (array) ($rendered['data'] ?? array())),
                'html'    => file_exists((string) get_post_meta($post->ID, 'uploaded_path_html', true)),
                'pending' => Graphic_Data_Figure_Html_Rebuild::needs_render($post->ID),
            );
        }
        echo wp_json_encode($out);`,
    );
    for (const [title, type] of [['Bulk Bar', 'bar'], ['Bulk Line', 'scatter']]) {
        const figure = figures[title];
        expect(figure.status, title).toBe('published');
        expect(figure.modal, title).toBe('Bulk Modal');
        expect(figure.html, title).toBe(true);
        expect(figure.pending, title).toBe(false);
        expect(figure.traces.length, title).toBeGreaterThan(0);
        expect(figure.traces.some((trace: any) => trace.type === type && trace.points > 0), title).toBe(true);
    }
});

/**
 * PHP that describes a site's Instances, Scenes, Modals and Figures by
 * type and slug, in the terms a spreadsheet keeps: each column's value,
 * links as the linked post's type and slug, whether an image is set, and
 * a hash of each Figure's data. With a suffix, only posts whose slug ends
 * in it are described, and the suffix is removed from slugs.
 */
function describeContent(suffix: string): string {
    return `$suffix = '${suffix}';
        $slug = function ($name) use ($suffix) {
            return '' !== $suffix && substr($name, -strlen($suffix)) === $suffix ? substr($name, 0, -strlen($suffix)) : $name;
        };
        $out = array();
        foreach (array('instance', 'scene', 'modal', 'figure') as $type) {
            $posts = get_posts(array('post_type' => $type, 'post_status' => 'any', 'numberposts' => -1, 'meta_query' => array(array('key' => 'graphic_data_placeholder_id', 'compare' => 'NOT EXISTS'))));
            foreach ($posts as $post) {
                if ('' !== $suffix ? $slug($post->post_name) === $post->post_name : (bool) get_post_meta($post->ID, Graphic_Data_Transfer_Schema::BATCH_META_KEY, true)) {
                    continue;
                }
                $item = array('post_title' => $post->post_title);
                foreach (Graphic_Data_Transfer_Tsv::get_columns($type) as $name => $column) {
                    if (in_array($column['kind'], array('ref', 'title', 'slug', 'data'), true)) {
                        continue;
                    }
                    if ('' !== $column['parent']) {
                        $set = get_post_meta($post->ID, $column['parent'], true);
                        $stored = is_array($set) && isset($set[$name]) ? $set[$name] : null;
                    } else {
                        $stored = metadata_exists('post', $post->ID, $name) ? get_post_meta($post->ID, $name, true) : null;
                    }
                    if (null === $stored) {
                        continue;
                    }
                    switch ($column['kind']) {
                        case 'post':
                            $linked = get_post((int) $stored);
                            $item[$name] = $linked ? $linked->post_type . ':' . $slug($linked->post_name) : '';
                            break;
                        case 'term':
                            $term = get_term((int) $stored);
                            $item[$name] = $term && !is_wp_error($term) ? $term->slug : '';
                            break;
                        case 'media':
                            $item[$name] = '' === (string) $stored ? '' : 'set';
                            break;
                        case 'html':
                            $item[$name] = wp_kses_post((string) $stored);
                            break;
                        case 'settings':
                            $item[$name] = Graphic_Data_Transfer_Tsv::parse_settings((string) $stored);
                            break;
                        default:
                            // instance_slug is edited along with the slugs.
                            $item[$name] = 'instance_slug' === $name ? $slug((string) $stored) : (string) $stored;
                    }
                }
                if ('figure' === $type) {
                    $json = (string) get_post_meta($post->ID, 'uploaded_path_json', true);
                    $item['data'] = $json && file_exists($json) ? md5(trim(file_get_contents($json))) : '';
                }
                $out[$type . ':' . $slug($post->post_name)] = $item;
            }
        }
        echo wp_json_encode($out);`;
}

test('Instances exported as spreadsheets come back through a bulk import', async ({ browser }, testInfo) => {
    test.setTimeout(600_000);
    const file = testInfo.outputPath('spreadsheets.zip');
    const from = await openAdmin(browser, source);
    const page = from.page;
    for (const id of await instanceIds(source, `array('key' => 'graphic_data_placeholder_id', 'compare' => 'NOT EXISTS')`)) {
        await page.locator(`input[name="instance_ids[]"][value="${id}"]`).check();
    }
    await page.locator('input[name="format"][value="tsv"]').check();
    await expect(page.locator('.graphic-data-content-transfer__format-notice')).toBeVisible();
    await expect(page.locator('input[name="include_pages"]')).toBeDisabled();
    await expect(page.locator('input[name="include_about"]')).toBeDisabled();
    await page.click('#graphic-data-transfer-preview');
    await expect(page.getByRole('heading', { name: 'These spreadsheets will contain' })).toBeVisible({ timeout: 120_000 });
    const [download] = await Promise.all([page.waitForEvent('download'), page.locator('#graphic-data-transfer-download').click()]);
    expect(download.suggestedFilename()).toMatch(/^graphic-data-spreadsheets-instances-\d{4}-\d\d-\d\d\.zip$/);
    await download.saveAs(file);
    expect(from.errors).toEqual([]);
    await from.close();

    // Edit the spreadsheets as a user would: give every item a new slug, so
    // that the rows are not copies of what test 2 imported into the target.
    // Pages cannot be in spreadsheets, so the tutorial Modals' links to a
    // page (slug:<slug>) find the copy that test 2 imported.
    await target.playground.writeFile('/tmp/sheets.zip', new Uint8Array(fs.readFileSync(file)));
    const edited: { zip: string; rows: Record<string, number> } = await php(
        target,
        `$in = new ZipArchive(); $in->open('/tmp/sheets.zip');
        $out = new ZipArchive(); $out->open('/tmp/edited.zip', ZipArchive::CREATE | ZipArchive::OVERWRITE);
        $rows = array();
        for ($i = 0; $i < $in->numFiles; $i++) {
            $name = $in->getNameIndex($i);
            $data = $in->getFromIndex($i);
            if ('/' === substr($name, -1)) {
                $out->addEmptyDir(rtrim($name, '/'));
                continue;
            }
            if ('.tsv' === substr($name, -4) && 'README.tsv' !== $name) {
                $handle = fopen('php://temp', 'r+');
                fwrite($handle, preg_replace('/^\\xEF\\xBB\\xBF/', '', $data));
                rewind($handle);
                $table = array();
                while (false !== ($cells = fgetcsv($handle, 0, "\\t", '"', ''))) {
                    $table[] = $cells;
                }
                foreach (array('post_name', 'instance_slug') as $column) {
                    $index = array_search($column, $table[0], true);
                    for ($r = 1; false !== $index && $r < count($table); $r++) {
                        $table[$r][$index] .= '-edited';
                    }
                }
                $rows[$name] = count($table) - 1;
                $data = Graphic_Data_Transfer_Tsv::to_tsv($table);
            }
            $out->addFromString($name, $data);
        }
        $out->close();
        echo wp_json_encode(array('zip' => base64_encode(file_get_contents('/tmp/edited.zip')), 'rows' => $rows));`,
    );

    const sourceContent = await php(source, describeContent(''));
    const count = (type: string) => Object.keys(sourceContent).filter((key) => key.startsWith(type + ':')).length;
    expect(edited.rows).toEqual({
        'instance_types.tsv': expect.any(Number),
        'instances.tsv': count('instance'),
        'scenes.tsv': count('scene'),
        'modals.tsv': count('modal'),
        'figures.tsv': count('figure'),
    });

    const to = await openAdmin(browser, target);
    const output = await checkPackage(to.page, { name: 'edited.zip', mimeType: 'application/zip', buffer: Buffer.from(edited.zip, 'base64') });
    await expect(output.locator('.notice-error')).toHaveCount(0);
    await runImport(to.page);
    expect(to.errors).toEqual([]);
    await to.close();

    // Every field the spreadsheets hold comes back; fields the source never
    // stored take their default, so they are not compared.
    const targetContent = await php(target, describeContent('-edited'));
    expect(Object.keys(targetContent).sort()).toEqual(Object.keys(sourceContent).sort());
    const differences: string[] = [];
    for (const [key, item] of Object.entries<Record<string, unknown>>(sourceContent)) {
        for (const [field, value] of Object.entries(item)) {
            if (JSON.stringify(targetContent[key][field]) !== JSON.stringify(value)) {
                differences.push(`${key} ${field}: ${JSON.stringify(value)} became ${JSON.stringify(targetContent[key][field])}`);
            }
        }
    }
    expect(differences).toEqual([]);

    const state = await php(
        target,
        `$out = array('held' => array(), 'no_html' => array(), 'no_render' => array());
        foreach (array('instance', 'scene', 'modal', 'figure') as $type) {
            foreach (get_posts(array('post_type' => $type, 'post_status' => 'any', 'numberposts' => -1)) as $post) {
                if ('-edited' !== substr($post->post_name, -7)) {
                    continue;
                }
                $status_key = Graphic_Data_Transfer_Schema::get_publication_meta_key($type);
                if (in_array(get_post_meta($post->ID, $status_key, true), array('draft', 'Draft'), true)) {
                    $out['held'][] = $post->post_title;
                }
                if ('figure' === $type && 'published' === get_post_meta($post->ID, 'figure_published', true)) {
                    if (!file_exists((string) get_post_meta($post->ID, 'uploaded_path_html', true))) {
                        $out['no_html'][] = $post->post_title;
                    }
                    if ('Interactive' === get_post_meta($post->ID, 'figure_path', true) && !json_decode((string) get_post_meta($post->ID, 'figure_interactive_args_rendered', true))) {
                        $out['no_render'][] = $post->post_title;
                    }
                }
            }
        }
        $out['queue'] = count(Graphic_Data_Figure_Html_Rebuild::get_queue());
        echo wp_json_encode($out);`,
    );
    const sourceHeld = Object.values<Record<string, unknown>>(sourceContent)
        .filter((item) => ['draft', 'Draft'].includes(String(item.scene_published ?? item.modal_published ?? item.figure_published ?? item.instance_status)))
        .map((item) => item.post_title);
    expect(state.held.sort()).toEqual(sourceHeld.sort());
    expect(state.no_html).toEqual([]);
    expect(state.no_render).toEqual([]);
    expect(state.queue).toBe(0);
});
