/** Run: node --experimental-vm-modules tests/carousel/carousel.test.cjs
 * Uses the plugin's existing jsdom/fake-timers development dependencies. No server or database.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { pathToFileURL } = require('node:url');
const plugin = path.resolve(__dirname, '../../plugins/graphic_data_plugin');
const { JSDOM } = require(path.join(plugin, 'node_modules/jsdom'));
const FakeTimers = require(path.join(plugin, 'node_modules/@sinonjs/fake-timers'));
const interactive = path.join(plugin, 'includes/figures/js/interactive');

async function environment() {
    const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'https://example.test/wp-admin/post.php?post=42', runScripts: 'outside-only', pretendToBeVisual: true });
    const w = dom.window;
    w.console = { ...console, log() {} };
    w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
    Object.defineProperty(w.HTMLImageElement.prototype, 'complete', { get: () => true });
    Object.defineProperty(w.HTMLImageElement.prototype, 'naturalWidth', { get: () => 1000 });
    w.HTMLElement.prototype.getClientRects = function () { return this.closest('[hidden]') ? [] : [{}]; };
    const clock = FakeTimers.withGlobal(w).install({ toFake: ['setTimeout','clearTimeout','setInterval','clearInterval','Date'] });
    const context = dom.getInternalVMContext(); const cache = new Map();
    async function module(file) {
        if (cache.has(file)) return cache.get(file);
        const mod = new vm.SourceTextModule(fs.readFileSync(file, 'utf8'), { context, identifier: file, initializeImportMeta(meta) { meta.url = pathToFileURL(file).href; } });
        cache.set(file, mod);

        return mod;
    }
    async function load(name) { const mod = await module(path.join(interactive, name)); if (mod.status === 'unlinked') { await mod.link((specifier, referencing) => module(specifier.startsWith('@graphic-data/') ? path.join(interactive, specifier.split('/')[1] + '.js') : path.resolve(path.dirname(referencing.identifier), specifier))); } if (mod.status !== 'evaluated') await mod.evaluate(); return mod.namespace; }
    return { w, clock, load, close() { clock.uninstall(); w.close(); } };
}
function fields() {
    return { graphType: 'Image Carousel', CarouselImageCount: '3', CarouselAutoplay: 'Yes', CarouselVisibleSeconds: '4', CarouselFadeSeconds: '1.5',
        CarouselImage1Url: '/wp-content/uploads/one.png', CarouselImage1Text: '<b>Plain text</b>', CarouselImage1Alt: 'One', CarouselImage1Caption: 'First image context', CarouselImage2Caption: '   ', CarouselImage3Caption: '<b>Third image context</b>',
        CarouselImage2Url: '/wp-content/uploads/two.png', CarouselImage2Text: 'Two',
        CarouselImage3Url: '/wp-content/uploads/three.png', CarouselImage3Text: 'Preserve this' };
}
async function renderer() {
    const e = await environment();
    try {
        const api = await e.load('image-carousel.js');
        const config = fields(); const spec = api.buildCarouselSpec(config);
        assert.equal(spec.playback.visibleDurationMs, 4000);
        assert.equal(spec.playback.fadeDurationMs, 1500);
        assert.equal(spec.slides[0].caption, 'First image context');
        assert.equal(spec.slides[1].caption, '', 'whitespace captions are empty');
        assert.equal(api.buildCarouselSpec({...config, CarouselImageCount:'2'}).slides.length, 2);
        assert.throws(() => api.buildCarouselSpec({...config, CarouselImage2Url:''}), /slide 2/);
        assert.throws(() => api.buildCarouselSpec({...config, CarouselImage2Url:'javascript:alert(1)'}), /slide 2/);
        assert.equal(api.carouselSettings(JSON.stringify([['graphType','Tabulator table']]).replaceAll('"','\\"')).graphType, 'Tabulator table');
        e.w.document.body.innerHTML = '<div id="a"></div><div id="b"></div>';
        const a = e.w.document.getElementById('a'), b = e.w.document.getElementById('b');
        const first = await api.mountImageCarousel(a, spec);
        const second = await api.mountImageCarousel(b, {...spec, playback:{...spec.playback,autoplay:false}});
        assert.equal(a.querySelector('.gd-text').textContent, '<b>Plain text</b>');
        assert.equal(a.querySelector('.gd-text b'), null);
        assert.equal(a.querySelector('.gd-stage').nextElementSibling.className, 'gd-caption');
        assert.equal(a.querySelector('.gd-caption').textContent, 'First image context');
        assert.equal(a.querySelector('.gd-caption').hidden, false);
        assert.equal(a.querySelectorAll('img')[2].hasAttribute('src'), false, 'third image must stay deferred');
        const current = node => node.querySelector('[aria-current="true"]').textContent;
        await e.clock.tickAsync(3999); assert.equal(current(a), '1');
        await e.clock.tickAsync(1); assert.equal(current(a), '2'); assert.equal(current(b), '1');
        assert.equal(a.querySelector('.gd-caption').hidden, true);
        assert.equal(a.querySelector('.gd-caption').textContent, '');
        await e.clock.tickAsync(5499); assert.equal(current(a), '2', 'full visible interval must follow fade');
        await e.clock.tickAsync(1); assert.equal(current(a), '3');
        assert.equal(a.querySelector('.gd-caption').hidden, false);
        assert.equal(a.querySelector('.gd-caption').textContent, '<b>Third image context</b>');
        assert.equal(a.querySelector('.gd-caption b'), null);
        assert.equal(a.querySelectorAll('img')[2].getAttribute('src'), '/wp-content/uploads/three.png');
        await e.clock.tickAsync(1500);
        a.hidden = true; await e.clock.tickAsync(10000); assert.equal(current(a), '3', 'hidden carousel must pause');
        a.hidden = false; await e.clock.tickAsync(250);
        a.querySelector('[aria-label="Previous image"]').click();
        await e.clock.tickAsync(1500); assert.equal(current(a), '2');
        await e.clock.tickAsync(10000); assert.equal(current(a), '2', 'manual navigation pauses playback');
        first.setHeight(450); assert.equal(a.querySelector('.gd-stage').style.height, '450px');
        // Move a live carousel into an editor iframe, then remove it.
        const frame = e.w.document.createElement('iframe'); e.w.document.body.append(frame);
        frame.contentDocument.body.append(a.querySelector('.gd-carousel'));
        await e.clock.tickAsync(250); assert.ok(frame.contentDocument.querySelector('.gd-carousel'));
        frame.remove(); a.remove(); b.remove(); await e.clock.tickAsync(500);
        // Explicit cleanup also supports teardown before the next lifecycle tick.
        first.destroy(); second.destroy();
        assert.equal(e.clock.countTimers(), 0);
        console.log('PASS renderer: active count, validation, plain text, deferred loading, fade timing, independent instances, hidden pause, navigation, iframe movement, cleanup');
    } finally { e.close(); }
}
async function admin() {
    const e = await environment();
    try {
        const config = fields(); config.CarouselImageCount = '2';
        e.w.document.body.innerHTML = '<input name="post_ID" value="42"><select name="figure_path"><option selected>Interactive</option><option>Internal</option></select><textarea name="figure_interactive_arguments"></textarea><div class="exopite-sof-field exopite-sof-field-upload"></div><div class="exopite-sof-field exopite-sof-field-button"><div class="exopite-sof-fieldset"><button class="figure_interactive_settings">Run</button></div></div>';
        const args = e.w.document.getElementsByName('figure_interactive_arguments')[0]; args.value = JSON.stringify(Object.entries(config));
        let requests = 0;
        e.w.fetch = async url => { requests++; return {ok:true, json: async()=> String(url).includes('wp-json') ? {uploaded_path_json:'/wp-content/data/example.json'} : {data:{Year:[2024],Value:[12]}}}; };
        await e.load('plotly-timeseries-line.js'); await e.load('plotly-bar.js');
        const upload = await e.load('file-upload.js'); await upload.checkIfFileExistsAndLoadJson();
        assert.equal(requests, 0, 'carousel must not fetch a data file');
        assert.equal(e.w.document.querySelectorAll('fieldset:not([hidden])').length, 2);
        const count = e.w.document.getElementById('CarouselImageCount'); count.value='1'; count.dispatchEvent(new e.w.Event('change'));
        assert.equal(Object.fromEntries(JSON.parse(args.value)).CarouselImage3Text, 'Preserve this');
        // Re-create controls from saved values, simulating a reload.
        const settings = await e.load('image-carousel-settings.js');
        e.w.document.getElementById('secondaryGraphFields').remove(); settings.carouselParameterFields(args.value);
        const restored = e.w.document.getElementById('CarouselImageCount'); restored.value='3'; restored.dispatchEvent(new e.w.Event('change'));
        assert.equal(e.w.document.getElementById('CarouselImage3Text').value, 'Preserve this');
        assert.equal(e.w.document.getElementById('CarouselImage3Caption').value, '&lt;b&gt;Third image context&lt;/b&gt;');
        assert.equal(e.w.document.getElementById('CarouselImage3Caption').tagName, 'TEXTAREA');
        assert.equal(e.w.document.querySelectorAll('fieldset:not([hidden])').length, 3);
        const select = e.w.document.getElementById('graphType');
        for (const type of ['Tabulator table','Plotly line graph (time series)','Plotly bar graph']) {
            select.value=type; select.dispatchEvent(new e.w.Event('change'));
            await new Promise(resolve=>setImmediate(resolve));
            assert.ok(e.w.document.getElementById('secondaryGraphFields'), `settings restored for ${type}`);
            assert.notEqual(e.w.document.querySelector('.exopite-sof-field-upload').style.display,'none');
            assert.equal(Object.fromEntries(JSON.parse(args.value)).CarouselImage3Text,'Preserve this');
        }
        select.value='Image Carousel'; select.dispatchEvent(new e.w.Event('change'));
        assert.equal(e.w.document.getElementById('CarouselImage3Text').value, 'Preserve this');
        assert.equal(e.w.document.getElementById('CarouselImage3Caption').value, '&lt;b&gt;Third image context&lt;/b&gt;');
        assert.equal(e.w.document.getElementById('CarouselImage3Caption').tagName, 'TEXTAREA');
        assert.equal(e.w.document.querySelector('.exopite-sof-field-upload').style.display,'none');
        console.log('PASS admin: no file requirement, inactive row persistence/reload, switching among Carousel/Tabulator/Timeseries/Bar');
    } finally { e.close(); }
}
async function exportAndValidation() {
    const e = await environment();
    try {
        const api = await e.load('image-carousel.js');
        e.w.document.body.innerHTML = '<textarea name="figure_interactive_arguments"></textarea><textarea name="figure_interactive_args_rendered"></textarea><div id="target"></div>';
        const argumentsField = e.w.document.getElementsByName('figure_interactive_arguments')[0];
        const rendered = e.w.document.getElementsByName('figure_interactive_args_rendered')[0];
        const config = fields(); config.CarouselImageCount = '2';
        argumentsField.value = JSON.stringify(Object.entries(config));
        assert.equal(await api.renderCarouselFigure({targetId:'target', interactiveArguments:argumentsField.value}),true);
        assert.equal(JSON.parse(rendered.value).slides.length,2);
        await assert.rejects(api.renderCarouselFigure({targetId:'target',interactiveArguments:JSON.stringify({...config,CarouselImage1Url:''})}), /slide 1/);
        assert.equal(rendered.value,'', 'invalid selections clear the old rendered spec');
        e.w.document.querySelector('.gd-carousel').graphicDataCarousel.destroy();
        const acorn = require(path.join(plugin,'node_modules/acorn'));
        const source = fs.readFileSync(path.join(plugin,'admin/js/admin-preview-buttons.js'),'utf8');
        const ast = acorn.parse(source,{ecmaVersion:'latest',sourceType:'module'});
        const fn = ast.body.find(node=>node.type==='ExportNamedDeclaration' && node.declaration?.id?.name==='createFigureHtml');
        const context = vm.createContext({URL, console, graphicDataSiteTitle:'Test site', CAROUSEL_MODULE_URL:'/wp-content/plugins/graphic_data_plugin/includes/figures/js/interactive/image-carousel.js', isCarouselSpec:api.isCarouselSpec, isComparisonSpec:()=>false, isTabulatorSpec:()=>false});
        vm.runInContext(source.slice(fn.declaration.start,fn.declaration.end), context);
        const spec = api.buildCarouselSpec(config);
        spec.slides[0].text='</script><script>alert(1)</script>';
        const output = await context.createFigureHtml(spec,42,'https://example.test',{figureTitle:'Carousel'},'Interactive');
        assert.ok(output.figIframeHtml.includes('mountImageCarousel'));
        assert.ok(!output.figIframeHtml.includes('</script><script>alert(1)</script>'));
        assert.ok(!output.figIframeHtml.includes('Plotly.newPlot'));
        console.log('PASS preview/export: active-only spec, invalid-selection clearing, standalone carousel dispatch, script-safe overlay serialization');
    } finally { e.close(); }
}
async function playbackControls() {
    const e = await environment();
    try {
        const api = await e.load('image-carousel.js');
        const config = fields();
        delete config.CarouselVisibleSeconds; delete config.CarouselFadeSeconds;
        const spec = api.buildCarouselSpec(config);
        assert.equal(spec.playback.visibleDurationMs, 3500);
        assert.equal(spec.playback.fadeDurationMs, 1000);
        // Existing explicitly saved timings are intentionally retained.
        assert.equal(api.buildCarouselSpec(fields()).playback.visibleDurationMs, 4000);
        e.w.document.body.innerHTML = '<div id="target"></div>';
        const target = e.w.document.getElementById('target');
        const handle = await api.mountImageCarousel(target, spec);
        const root = target.querySelector('.gd-carousel');
        const current = () => root.querySelector('[aria-current="true"]').textContent;
        root.dispatchEvent(new e.w.MouseEvent('mouseenter'));
        await e.clock.tickAsync(3499); assert.equal(current(), '1');
        await e.clock.tickAsync(1); assert.equal(current(), '2', 'autoplay runs while hovered');
        await e.clock.tickAsync(1000);
        let play = root.querySelector('[aria-label="Pause automatic playback"]');
        play.focus(); play.click();
        await e.clock.tickAsync(5000); assert.equal(current(), '2', 'Pause must stop rotation');
        assert.equal(e.w.document.activeElement, play);
        play.click(); // Browser retains focus, the original failure condition.
        await e.clock.tickAsync(3500); assert.equal(current(), '3', 'Play works with focus and hover retained');
        await e.clock.tickAsync(1000 + 3500); assert.equal(current(), '1', 'playback continues across transitions');
        await e.clock.tickAsync(1000);
        root.querySelector('[aria-label="Next image"]').focus();
        await e.clock.tickAsync(5000); assert.equal(current(), '1', 'keyboard navigation focus pauses rotation');
        play.focus(); play.click();
        await e.clock.tickAsync(3500); assert.equal(current(), '2', 'keyboard Play resumes rotation');
        handle.destroy();
        // Missing timing values in an older spec use the same new runtime defaults.
        const runtime = {...spec, playback:{autoplay:true}};
        const fallback = await api.mountImageCarousel(target, runtime);
        assert.equal(target.querySelector('.gd-carousel').style.getPropertyValue('--gd-fade'),'1000ms');
        await e.clock.tickAsync(3500);
        assert.equal(target.querySelector('[aria-current="true"]').textContent,'2');
        fallback.destroy();
        console.log('PASS playback regression: hovered autoplay, focused Play/Pause, keyboard resume, 3.5s/1s defaults, existing timings preserved');
    } finally { e.close(); }
}
async function richCaptions() {
    const e=await environment();
    try {
        const sanitizer=await e.load('carousel-caption.js');
        const html='<p><strong>Context</strong> <a href="https://example.test/details" target="_blank" onclick="alert(1)">Details</a></p><ul><li>Item</li></ul>';
        const clean=sanitizer.sanitizeCarouselCaption(html);
        assert.ok(clean.includes('<strong>Context</strong>'));
        assert.ok(clean.includes('href="https://example.test/details"'));
        assert.ok(clean.includes('rel="noopener noreferrer"'));
        assert.ok(!clean.includes('onclick'));
        for (const alignment of ['left','center','right','justify']) {
            const formatted=sanitizer.sanitizeCarouselCaption('<p style="text-align:'+alignment+';color:red;position:fixed">Aligned</p>');
            assert.equal(formatted,'<p style="text-align: '+alignment+';">Aligned</p>');
        }
        assert.equal(sanitizer.sanitizeCarouselCaption('<p style="text-align:inherit">Plain</p>'),'<p>Plain</p>');
        assert.equal(sanitizer.sanitizeCarouselCaption('<p><br>&nbsp;</p>'),'');
        assert.equal(sanitizer.sanitizeCarouselCaption('<script>alert(1)</script><img src=x onerror=alert(1)>'),'');
        assert.ok(!sanitizer.sanitizeCarouselCaption('<a href="java&#x09;script:alert(1)">Bad link</a>').includes('href'));
        e.w.document.body.innerHTML='<div id="graphGUI"><select id="graphType" name="plotFields"><option>Image Carousel</option></select></div><textarea name="figure_interactive_arguments"></textarea><div id="target"></div>';
        const config={...fields(),CarouselImageCount:'2',CarouselImage1Caption:html,CarouselImage1CaptionFormat:'html',CarouselImage2Caption:'<p><br></p>',CarouselImage2CaptionFormat:'html'};
        const args=e.w.document.getElementsByName('figure_interactive_arguments')[0];args.value=JSON.stringify(Object.entries(config));
        const editors=new Map(),removed=[];
        e.w.tinymce={get:id=>editors.get(id)};
        e.w.wp={editor:{initialize(id,settings) {
            let content=e.w.document.getElementById(id).value;
            const callbacks = new Map();
            const editor={initialized:false,getContent:()=>editor.initialized ? content : '',isHidden:()=>false,
                on(events, callback){events.split(' ').forEach(event=>callbacks.set(event,callback));},
                setContent(value){content=value;callbacks.get('SetContent')?.();},
                finishLoading(){
                    content=e.w.document.getElementById(id).value;
                    callbacks.get('SetContent')?.();
                    editor.initialized=true;
                    callbacks.get('init')?.();
                }};
            assert.ok(settings.tinymce.toolbar1.includes('bold'));
            assert.ok(settings.tinymce.toolbar1.includes('alignleft aligncenter alignright alignjustify'));
            assert.ok(settings.quicktags);
            editors.set(id,editor);settings.tinymce.setup(editor);
        },remove(id){removed.push(id);editors.delete(id)}}};
        const ui=await e.load('image-carousel-settings.js');ui.carouselParameterFields(args.value);
        assert.equal(editors.size,2,'only visible captions initialize rich editors');
        assert.equal(e.w.document.getElementById('CarouselImage1Caption').value,clean,'pending editors must not erase textareas');
        editors.get('CarouselImage1Caption').finishLoading();
        assert.equal(e.w.document.getElementById('CarouselImage2Caption').value,'','empty caption stays empty');
        const count=e.w.document.getElementById('CarouselImageCount');
        count.value='3';count.dispatchEvent(new e.w.Event('change'));
        assert.equal(editors.size,3);
        editors.get('CarouselImage2Caption').finishLoading();
        assert.equal(e.w.document.getElementById('CarouselImage3Caption').value,'&lt;b&gt;Third image context&lt;/b&gt;','later editor retains saved content while earlier editors finish loading');
        editors.get('CarouselImage3Caption').finishLoading();
        editors.get('CarouselImage3Caption').setContent('<p><strong>Third updated</strong></p>');
        assert.equal(Object.fromEntries(JSON.parse(args.value)).CarouselImage3Caption,'<p><strong>Third updated</strong></p>');
        editors.get('CarouselImage2Caption').setContent('<p>Second updated</p>');
        assert.equal(Object.fromEntries(JSON.parse(args.value)).CarouselImage2Caption,'<p>Second updated</p>');
        editors.get('CarouselImage2Caption').setContent('<p><br></p>');
        count.value='2';count.dispatchEvent(new e.w.Event('change'));
        editors.get('CarouselImage1Caption').setContent('<p><em>Latest edit</em></p>');
        const root=e.w.document.getElementById('secondaryGraphFields');root.syncCaptionEditors();
        const padding=e.w.document.getElementById('CarouselImage1CaptionPadding');
        assert.equal(padding.value,'0');
        padding.value='18';padding.dispatchEvent(new e.w.Event('change'));
        const saved=Object.fromEntries(JSON.parse(args.value));assert.equal(saved.CarouselImage1Caption,'<p><em>Latest edit</em></p>');assert.ok(!args.value.includes('<p>'));
        const api=await e.load('image-carousel.js');
        saved.CarouselImage1Caption='<p style="text-align: justify;"><em>Latest edit</em></p>';
        const spec=api.buildCarouselSpec(saved);
        assert.equal(spec.slides[0].captionPadding,18);
        assert.equal(api.buildCarouselSpec({...saved,CarouselImage1CaptionPadding:'-1'}).slides[0].captionPadding,0);
        assert.equal(api.buildCarouselSpec({...saved,CarouselImage1CaptionPadding:'200'}).slides[0].captionPadding,100);
        assert.equal(api.buildCarouselSpec({...saved,CarouselImage1CaptionPadding:'bad'}).slides[0].captionPadding,0);
        const handle=await api.mountImageCarousel(e.w.document.getElementById('target'),spec);
        assert.equal(e.w.document.querySelector('.gd-caption em').textContent,'Latest edit');
        assert.equal(e.w.document.querySelector('.gd-caption').style.padding,'18px');
        assert.equal(e.w.document.querySelector('.gd-caption p').style.textAlign,'justify');
        await e.clock.tickAsync(4000);assert.equal(e.w.document.querySelector('.gd-caption').hidden,true);
        assert.equal(e.w.document.querySelector('.gd-caption').style.padding,'0px');
        handle.destroy();
        root.cleanupCaptionEditors();assert.equal(removed.length,3);assert.equal(editors.size,0);
        assert.equal(Object.fromEntries(JSON.parse(args.value)).CarouselImage1Caption,'<p><em>Latest edit</em></p>');
        console.log('PASS rich captions: safe formatting/links, blank markup, editor initialization/sync/cleanup, JSON round trip, rendered HTML and hidden empty slides');
    } finally {e.close()}
}
(async()=>{ await renderer(); await admin(); await exportAndValidation(); await playbackControls(); await richCaptions(); })().catch(error=>{console.error(error);process.exitCode=1});
