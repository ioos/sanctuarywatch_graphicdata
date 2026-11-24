# Content Transfer cheatsheet

A reference for working on the Graphic Data plugin's Content Transfer tool, which exports and imports content between sites. It was last updated on 2026-11-23, while the work sat uncommitted on the `content-transfer` branch. Before trusting a detail, check it against the code: class doc comments are the source of truth.

Not to be confused with "Figure Reports" (`Graphic_Data_Export_Figures`), which turns Figures into documents and slides.

---

## 1. Where things are

All paths are under `plugins/graphic_data_plugin/`.

| File | Role |
|---|---|
| `admin/class-content-transfer.php` | `Graphic_Data_Content_Transfer`. Builds the admin page (submenu `graphic-data-content-transfer` under `graphic-data-search`) and holds every AJAX and admin-post handler, the capability checks and `get_exporter()`. |
| `admin/class-transfer-schema.php` | `Graphic_Data_Transfer_Schema`. The single source of field rules: meta keys per type, references, required parents, status fields, unique keys, schema version and upgrades. |
| `admin/class-transfer-exporter.php` | `Graphic_Data_Transfer_Exporter`. Collects a selection and writes a **package** zip. |
| `admin/class-transfer-tsv-exporter.php` | `Graphic_Data_Transfer_Tsv_Exporter`. Wraps the package exporter (`get_collected()`) and writes a **spreadsheet** (bulk-import) zip. |
| `admin/class-transfer-tsv.php` | `Graphic_Data_Transfer_Tsv`. Reads a bulk-import zip and converts it to a package. Also builds the template and README, plus `csv_to_json()`, `to_tsv()` and `parse_settings()`. |
| `admin/class-transfer-importer.php` | `Graphic_Data_Transfer_Importer`. Runs an import as a job across several requests: chunked upload, dry run, link choices, steps, undo and history. |
| `admin/class-figure-html-rebuild.php` | `Graphic_Data_Figure_Html_Rebuild`. The queue of imported Figures that need standalone HTML, or saved Plotly JSON for bulk imports. |
| `admin/js/content-transfer.js` | Page JS: export form, preview, chunked upload, link choices, import steps, HTML and render rebuild. |
| `admin/js/figure-html.js` | `createFigureHtml()`, shared by the Figure edit screen and the transfer page. |
| `admin/css/content-transfer.css` | Page styles. |

Tests:
- `tests/content-transfer/schema-upgrade.test.php`: plain PHP, no WordPress needed. Run it with `php tests/content-transfer/schema-upgrade.test.php`.
- `tests/e2e/specs/content-transfer/round-trip.spec.ts`: six Playwright tests on two Playground sites created with `startPlayground()`.

### AJAX and admin-post actions (all `graphic_data_transfer_*`)
- `preview`: export preview (JSON summary).
- `export` (admin-post): downloads the zip.
- `tsv_template` (admin-post): downloads the blank bulk-import template.
- `import_upload`, `import_run`, `import_cancel`, `import_undo`: the import job.
- `html_list`, `html_figure`, `html_save`, `render_save`: rebuilding Figure HTML and saved JSON in the browser.

One nonce action covers every request: `graphic_data_content_transfer`.

---

## 2. Who can do what

| Capability | Can |
|---|---|
| `edit_others_posts` (Editor and above) | Open the page. Export and import a **single Figure** only (`package_type` `figure`). Undo only their own single-Figure imports. |
| `manage_options` (Admin) | Everything: Instance and selection exports, pages and About, the Spreadsheets format, bulk import, undoing any import, and rebuilding HTML for all Figures or one Instance. |

---

## 3. Export

### Selection
- **scope `instances`**: whole Instances (`instance_ids`). Optional `include_pages` adds pages tagged to those Instances. Optional `include_about` adds the About post.
- **scope `selected`**: any Scenes, Modals and Figures, picked in a tree. Ticking an item ticks everything beneath it.
- Exportable WordPress statuses are `publish`, `draft`, `pending`, `private` and `future`. Trash and auto-draft are never exported.
- Instance Type terms, Media Library files, files in uploads and Figure data files that the selection depends on are collected automatically.
- The preview lists:
  - counts;
  - **links to content outside the export**, which will need relinking on import;
  - items missing a parent (`unassigned`);
  - warnings.

### Format A: Package (the default)

```
manifest.json          format, schema_version, plugin/WP versions, package_type,
                       exported_at, source {site_url, home_url, uploads_url, data_url},
                       selection, counts, checksums (sha256 of every file)
content.json           terms, posts (core fields + allowlisted meta), references,
                       media index, data-file index. Source IDs kept as-is.
media/<id>/<file>      Media Library originals
media/files/<path>     files under uploads that are not attachments
data/figure_<id>/...   Figure source data (CSV / JSON / GeoJSON)
```

- `manifest.json` lets the importer check the package before reading `content.json`: right format, supported schema and checksums. It also identifies the source site, which tells the importer whether this is a same-site import and builds the URL rewrite map.
- `package_type` is `instances`, `selection` or `figure`.
- Generated Figure HTML is **not** packaged. It is rebuilt on the target.
- Not exported, because these values are rebuilt: `figure_iframe_code`, `uploaded_path_html`, `uploaded_html_file`.

### Format B: Spreadsheets (TSV, admins only)

The form has a Format fieldset, `name="format"`, with the values `package` and `tsv`. Choosing `tsv`:
- disables `include_pages` and `include_about`;
- shows the `.graphic-data-content-transfer__format-notice` warning;
- changes the button to "Download spreadsheets";
- produces a file named `graphic-data-spreadsheets-….zip`.

The zip has the bulk-import layout, so it can be edited and sent back through Import. All five TSV files are always written.

```
instance_types.tsv  instances.tsv  scenes.tsv  modals.tsv  figures.tsv
README.tsv
media/   data/
```

How cells are written:
- **Refs:** `<type>-<sourceID>` for posts and `type-<termID>` for Instance Types.
- **Links:**
  - `ref:<ref>` when the target is in the export;
  - `slug:<slug>` when the target is outside the export but has an exportable status;
  - blank otherwise.
- **Images:**
  - files go in `media/<id>/<file>`;
  - `<col>_alt` and `<col>_caption` columns are added only when they have values;
  - an image that isn't in the export keeps its URL.
- **Data:**
  - GeoJSON if the Figure has it;
  - otherwise the CSV, when `csv_to_json(csv)` equals the stored JSON;
  - otherwise the JSON.
- **Escaping:** backslashes in title, text and html cells are doubled, because the import reads `\n`, `\t` and `\\` as escapes.
- **Encoding:** every TSV starts with a UTF-8 byte order mark so Excel reads it correctly.

What spreadsheets can't carry. The standing notice plus the preview warnings say this:
- No pages and no About.
- Re-importing creates **new** content. Rows whose slug matches existing content come in as held (Draft) copies. **Nothing is updated in place.** An update-in-place mode has been raised with the user and not yet decided.
- Images inside formatted (html) text aren't included and keep pointing at the source site. The preview warns per item.
- Images are re-added to the Media Library with alt text and caption only.
- Interactive charts are rebuilt from their settings. Types outside `Graphic_Data_Transfer_Tsv::GRAPH_TYPES` (for example "Plotly map"), Figures with no settings and Figures with missing data import as Draft. The preview warns per Figure.
- A `slug:` link requires the target site to have that slug. A Modal linking to a page fails unless the page exists on the target.
- Cells over 32,767 characters (Excel's limit) are listed. The file still holds the full value.
- Spreadsheet programs may change values (dates, numbers, quotes).

---

## 4. Import

The importer accepts **both** formats:
- **Package:** has `manifest.json` and `content.json`.
- **Bulk import (TSV zip), admins only:** `Graphic_Data_Transfer_Tsv::is_bulk_zip()` requires that the zip has **no** `manifest.json`. `convert_bulk_import()` turns it into a normal package inside `check()`, so every rule below applies to both.

### Job flow (`Graphic_Data_Transfer_Importer`)

1. `create_job()`, then `append_chunk()`. The upload arrives in chunks into `uploads/graphic-data-transfer/<token>/`. Job state is kept in the option `graphic_data_transfer_job_<token>`. Jobs expire after one day.
2. `check()` then `open()` validate the format, schema version and checksums, and run schema upgrades. `make_plan()` and `describe_plan()` do a dry run. `get_link_targets()` lists every link to content outside the package, with a suggested target from `suggest_link()`, in this order:
   1. the same post, if the import is on the same site;
   2. an earlier import of that post (`_graphic_data_transfer_source` meta);
   3. a post of the same type with the same slug.
3. The user picks a target for each link, and a Modal tab for each Figure. Choices are narrowed to the chosen Instance and Scene.
4. `run_step()`. The first step receives the choices. Media is imported a few files at a time (a 10-second budget per request). Then terms, posts, data files and references are written in one step.
5. Imported published Figures are queued in `Graphic_Data_Figure_Html_Rebuild`. The page's JS builds their HTML with `createFigureHtml()`. For bulk-import Interactive figures, it first builds the saved Plotly JSON from the settings (`RENDER_META_KEY` → `render_save`).

### Rules

- **Every post is created new** and assigned to the importing user. Nothing is merged.
- **Copies are held:** a post that already exists on the target is imported as a copy and held. "Exists" means found by source key or slug. Re-importing the same bulk zip counts as copies, because the source is recorded as `bulk-import:<zip hash>`.
- **About is the exception:** it overwrites the existing About post, which is backed up first so undo can restore it.
- **"Held" never means WordPress draft for Graphic Data types.** The instance, scene, modal, figure and about types always keep `post_status = publish`. A held post has its Graphic Data **Status field** set to draft:

  | Type | Status field | Held value |
  |---|---|---|
  | instance | `instance_status` | `Draft` (capitalised) |
  | scene | `scene_published` | `draft` |
  | modal | `modal_published` | `draft` |
  | figure | `figure_published` | `draft` |
  | about | `about_published` | — |

  Pages use normal WordPress statuses, and a page copy imports as a WordPress draft. Use `Graphic_Data_Transfer_Schema::get_import_status()`, `get_publication_meta_key()` and `get_held_publication_status()` for this.
- **Also held:**
  - a source post that was not WordPress-published;
  - a Scene, Modal or Figure missing a **required parent** after the user's link choices. These are listed in an error message.

  Required parents (`get_required_references()`):
  - Scene: `scene_location` (Instance)
  - Modal: `modal_location` (Instance) and `modal_scene` (Scene)
  - Figure: `location` (Instance), `figure_scene` (Scene) and `figure_modal` (Modal)
- **Instance Types** are reused by slug.
- **Unique meta:** a copy's `instance_slug` gets a numbered suffix (`-2`).
- **References** are remapped to new IDs: post meta from `get_post_references()`, and page block attributes from `get_block_references()`. A link left empty is cleared (block refs are set to 0).
  - The `instanceId` block attribute is the editor's clientId, **not** an Instance, so it is copied unchanged.
- **Media** is reused when an attachment with the same sha256 already exists: same-site ID, an earlier import, or the same plain uploads path. Otherwise it is sideloaded. SVGs are validated.
- **URLs** from the source site's uploads and data folders are rewritten to the target's.
- **Meta is written with `wp_slash()`**, because `update_post_meta` unslashes.
- Everything created is tagged with `_graphic_data_transfer_batch`. A failed step undoes the batch automatically. The **Import history** (last 20, option `graphic_data_transfer_batches`) offers Undo.

### Bulk import (TSV) specifics (`Graphic_Data_Transfer_Tsv`)

- **Files:** `FILES` maps instance_type, instance, scene, modal and figure to their files and gives the read order.
- **Columns:**
  - They come from each type's `create_*_fields()` edit-screen definitions, limited to `get_meta_keys()`.
  - `get_columns($type)` gives each column's kind: ref, title, slug, text, html, code, number, color, choice, post, term, tab, media, data or settings.
  - The template and README come from the same definitions, through `write_template()` and `get_readme_rows()`.
- **Cells:**
  - Cells are trimmed. A blank cell takes the field's default.
  - Choice cells are checked against the allowed values.
  - html cells are cleaned with `wp_kses`, as on the edit screen. A side effect: `href='x'` becomes `href="x"`.
  - In title, text and html cells, `\n`, `\t` and `\\` are read as escapes.
- **Link cells:** `ref:<name>` (a row in this zip), `id:<ID>` or `slug:<slug>` (existing content). Links to existing content become the suggested link choices.
- **Image cells:** `media/<file>`, an `https://` URL (downloaded) or `attachment:<ID>`, plus optional `<col>_alt` and `<col>_caption` columns.
- **Data cells:** `figure_upload_file` takes `data/<file>`. A CSV is converted to JSON exactly as the edit screen does, with `csv_to_json()` mirroring the JS. JSON and GeoJSON are also accepted.
- **Settings:**
  - `figure_interactive_arguments` takes JSON (from the edit screen's "Copy settings for bulk import" button).
  - It is checked against the data. Unusable settings mean the Figure is held, with a warning.
  - `figure_interactive_args_rendered` is never imported; it is built later in the browser.
- **IDs:** rows get source IDs from 1,000,000,000 up (`ID_OFFSET`), so they never collide with real IDs.
- **Required fields:** an Instance needs `instance_short_title` and `instance_slug`.
- **Errors:** at most 200 are listed. The import stops on errors, and each one names the file, row and column.

---

## 5. Schema versions

- `SCHEMA_VERSION = 1`, and `PACKAGE_FORMAT = 'graphic-data-content-transfer'`.
- Upgrading older packages:
  - `get_upgrades()` returns steps keyed by the version each step produces;
  - `run_upgrades()` applies them in `open()`;
  - `rename_meta_key()` is a helper for steps.
  - **Never edit or remove a released step.**
- A newer package imports with a warning listing the fields it skipped.
- When a field is added to an edit screen, add it to `get_meta_keys()`. Add it to `get_post_references()` and `get_required_references()` too if it holds a post ID. Without that, transfer silently drops it, and so do WordPress revisions.
- **Revisions use the same list.** `admin/class-revisions.php` (`Graphic_Data_Revisions`) passes `get_meta_keys()` to core's `wp_post_revision_meta_keys` filter. That revisions every type's fields, adds a row per field to the Revisions screen, and fixes up the latest revision after a restore. A restored Figure is queued for an HTML rebuild.
- **Figure data files are kept for revisions.**
  - Uploads never overwrite an existing file; a clash gets a suffix (`data-1.csv`). The JSON made from a CSV is saved next to it under the matching name.
  - Delete File only takes the file off the Figure. `Graphic_Data_Figure::remove_unused_data_files()` removes a file once neither the Figure nor any of its revisions uses it, matching by file name.
  - So a Figure's data folder can hold several versions of its data. The export only takes the files the Figure currently uses.

---

## 6. Gotchas learned the hard way

- **Exopite "simple" save mode writes every `$_POST` field as meta**, including junk `post_title` and `post_type` meta. Imported posts don't have these, so code must read the real post:
  - `class-utility.php` `modal_helper()` uses `get_the_title()` and `get_post_type()`. Without that, scene hotspots on imported Scenes weren't clickable.
  - In the theme, `single-scene.php` sets `$graphic_data_title_arr['post_title'] = get_the_title(...)` after the meta loop. Without it, imported scene titles showed as "undefined".
  - `single-about.php` uses `get_the_title()`.
  - When you see `get_post_meta( $id, 'post_title' | 'post_type' )`, suspect this bug.
- Frontend Interactive figures replay `figure_interactive_args_rendered`. They never rebuild from source data, so an imported Figure without it shows nothing until the rebuild queue runs. Visit the Content Transfer page to process the queue.
- Held Figures get no standalone HTML until they're published, as on the edit screen.
- The e2e harness needs `@wp-playground/cli` 3.x. Version 1.x corrupts binary downloads.
- The sixth e2e test (spreadsheet round trip) depends on test 2 having imported pages, because of `slug:example-page-1` links.

---

## 7. Local test sites (Local by Flywheel)

- **aug12** is the donor/dev site and this repo. MySQL socket: `~/Library/Application Support/Local/run/CcNzlwB2r/mysql/mysqld.sock`.
- **recipient1** (`http://recipient1.local`, run ID `AIdmVLPpK`) and **recipient2** are import targets.
  - They have their own **copies** of the plugin and theme, not links.
  - Copy changed files across before testing there.

## 8. Checks before calling work done

Run these from the plugin and theme dirs:

```
vendor/bin/phpcs
vendor/bin/phpstan analyse --memory-limit=2048M
npx eslint <files>
php tests/content-transfer/schema-upgrade.test.php
cd tests/e2e && npx playwright test specs/content-transfer   # ~4–8 min
```

## 9. Open questions

- **Update-in-place for spreadsheet re-imports.** The user wants spreadsheet "bulk updates". Today a re-import only creates held copies. The idea is to match rows to existing posts by ref or slug and overwrite them. It needs decisions on:
  - which fields get overwritten;
  - how undo restores the overwritten values;
  - how to avoid duplicating media.
