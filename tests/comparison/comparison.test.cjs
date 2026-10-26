/** Run: node --experimental-vm-modules tests/comparison/comparison.test.cjs
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
    const value = {graphType:'Image Comparison Slider',ComparisonCount:'2'};
    for (let i=1;i<=3;i++) for (const side of ['Left','Right']) {
        const prefix=`Comparison${i}${side}`;
        Object.assign(value,{[prefix+'Url']:`/wp-content/uploads/${i}-${side}.jpg`,[prefix+'AttachmentId']:String(i*2+(side==='Left'?0:1)),[prefix+'Text']:`${side} ${i}`,[prefix+'Alt']:`Description ${side} ${i}`,[prefix+'Width']:'1200',[prefix+'Height']:'800',[prefix+'TextPosition']:side==='Left'?'top':'bottom'});
    }
    return value;
}
async function comparison() {
    const e=await environment();
    try {
        const api=await e.load('image-comparison.js'); const config=fields();
        const spec=api.buildComparisonSpec(config);
        assert.equal(spec.comparisons.length,2);
        assert.equal(spec.comparisons[0].left.textPosition,'top');
        assert.equal(spec.comparisons[0].right.textPosition,'bottom');
        assert.equal(api.buildComparisonSpec({...config,Comparison1LeftTextPosition:'unknown'}).comparisons[0].left.textPosition,'center');
        assert.doesNotThrow(()=>api.buildComparisonSpec({...config,Comparison1RightUrl:config.Comparison1LeftUrl}));
        assert.doesNotThrow(()=>api.buildComparisonSpec({...config,Comparison1RightAttachmentId:config.Comparison1LeftAttachmentId,Comparison1RightUrl:config.Comparison1LeftUrl}));
        assert.throws(()=>api.buildComparisonSpec({...config,Comparison1LeftUrl:''}),/left image/);
        assert.throws(()=>api.buildComparisonSpec({...config,Comparison1LeftUrl:'javascript:alert(1)'}),/left image/);
        spec.comparisons[0].left.text='<b>Plain caption</b>';
        e.w.document.body.innerHTML='<div id="target"></div>';
        const target=e.w.document.getElementById('target');
        const handle=await api.mountImageComparison(target,spec);
        const stages=target.querySelectorAll('.gd-comparison-stage');
        const ranges=target.querySelectorAll('input[type=range]');
        assert.equal(stages.length,2);
        assert.equal(stages[0].style.aspectRatio,'1200 / 800');
        assert.equal(target.querySelector('.gd-comparison-left figcaption').textContent,'<b>Plain caption</b>');
        assert.equal(target.querySelector('figcaption b'),null);
        assert.equal(target.querySelector('.gd-comparison-right figcaption').dataset.position,'bottom');
        assert.equal(target.querySelector('.gd-comparison-left img').alt,'Description Left 1');
        ranges[0].value='75';ranges[0].dispatchEvent(new e.w.Event('input'));
        assert.equal(stages[0].style.getPropertyValue('--gd-divider'),'75%');
        assert.equal(stages[1].style.getPropertyValue('--gd-divider'),'50%');
        assert.equal(ranges[0].getAttribute('aria-valuetext'),'75% left image, 25% right image');
        stages[0].getBoundingClientRect=()=>({left:100,width:400});
        const pointer=(name,x,id=1)=>{const event=new e.w.Event(name);Object.assign(event,{clientX:x,pointerId:id,button:0,isPrimary:true});stages[0].dispatchEvent(event)};
        pointer('pointerdown',200);assert.equal(ranges[0].value,'25');
        pointer('pointermove',400);assert.equal(ranges[0].value,'75');
        pointer('pointerup',400);pointer('pointermove',100);assert.equal(ranges[0].value,'75');
        pointer('pointerdown',900);assert.equal(ranges[0].value,'100');pointer('pointercancel',900);
        pointer('pointerdown',0);assert.equal(ranges[0].value,'0');pointer('pointerup',0);
        handle.setHeight(400);assert.equal(stages[1].style.height,'400px');
        const frame=e.w.document.createElement('iframe');e.w.document.body.append(frame);frame.contentDocument.body.append(target.firstElementChild);
        ranges[1].value='20';ranges[1].dispatchEvent(new e.w.Event('input'));assert.equal(stages[1].style.getPropertyValue('--gd-divider'),'20%');
        handle.destroy();assert.equal(frame.contentDocument.querySelector('.gd-comparison-stack'),null);assert.equal(e.clock.countTimers(),0);
        console.log('PASS comparison renderer: pair validation, caption positions/plain text, divider range and drag, independent pairs, bounds, iframe movement, cleanup');
    } finally {e.close()}
}
async function adminAndExport() {
    const e=await environment();
    try {
        e.w.document.body.innerHTML='<input name="post_ID" value="42"><select name="figure_path"><option selected>Interactive</option></select><textarea name="figure_interactive_arguments"></textarea><textarea name="figure_interactive_args_rendered"></textarea><div class="exopite-sof-field exopite-sof-field-upload"></div><div class="exopite-sof-field exopite-sof-field-button"><div class="exopite-sof-fieldset"><button class="figure_interactive_settings">Run</button></div></div><div id="target"></div>';
        const args=e.w.document.getElementsByName('figure_interactive_arguments')[0];args.value=JSON.stringify(Object.entries(fields()));
        let requests=0;e.w.fetch=async()=>{requests++;throw new Error('Data fetch must not be needed')};
        const upload=await e.load('file-upload.js');await upload.checkIfFileExistsAndLoadJson();
        assert.equal(requests,0);
        assert.equal(e.w.document.querySelector('.exopite-sof-field-upload').style.display,'none');
        assert.equal(e.w.document.getElementById('CarouselAutoplay'),null);
        assert.ok(e.w.document.getElementById('secondaryGraphFields').textContent.includes('coregistered'));
        assert.equal(e.w.document.querySelectorAll('fieldset:not([hidden])').length,2);
        const count=e.w.document.getElementById('ComparisonCount');count.value='1';count.dispatchEvent(new e.w.Event('change'));
        assert.equal(Object.fromEntries(JSON.parse(args.value)).Comparison3RightText,'Right 3');
        const settings=await e.load('image-comparison-settings.js');e.w.document.getElementById('secondaryGraphFields').remove();settings.comparisonParameterFields(args.value);
        const restored=e.w.document.getElementById('ComparisonCount');restored.value='3';restored.dispatchEvent(new e.w.Event('change'));
        assert.equal(e.w.document.getElementById('Comparison3RightText').value,'Right 3');
        assert.equal(e.w.document.getElementById('Comparison3RightTextPosition').value,'bottom');
        const type=e.w.document.getElementById('graphType');type.value='Image Carousel';type.dispatchEvent(new e.w.Event('change'));type.value='Image Comparison Slider';type.dispatchEvent(new e.w.Event('change'));
        assert.equal(e.w.document.getElementById('Comparison3RightText').value,'Right 3');
        const api=await e.load('image-comparison.js');
        assert.equal(await api.renderComparisonFigure({targetId:'target',interactiveArguments:args.value}),true);
        assert.equal(JSON.parse(e.w.document.getElementsByName('figure_interactive_args_rendered')[0].value).comparisons.length,3);
        await assert.rejects(api.renderComparisonFigure({targetId:'target',interactiveArguments:{...fields(),Comparison1RightUrl:''}}),/right image/);
        assert.equal(e.w.document.getElementsByName('figure_interactive_args_rendered')[0].value,'');
        const acorn=require(path.join(plugin,'node_modules/acorn'));const source=fs.readFileSync(path.join(plugin,'admin/js/admin-preview-buttons.js'),'utf8');const ast=acorn.parse(source,{ecmaVersion:'latest',sourceType:'module'});const fn=ast.body.find(node=>node.type==='ExportNamedDeclaration'&&node.declaration?.id?.name==='createFigureHtml');
        const context=vm.createContext({URL,console,graphicDataSiteTitle:'Test',COMPARISON_MODULE_URL:'/image-comparison.js',isComparisonSpec:api.isComparisonSpec,isCarouselSpec:()=>false,isTabulatorSpec:()=>false});
        vm.runInContext(source.slice(fn.declaration.start,fn.declaration.end),context);
        const spec=api.buildComparisonSpec(fields());spec.comparisons[0].left.text='</script><script>alert(1)</script>';
        const result=await context.createFigureHtml(spec,42,'https://example.test',{figureTitle:'Comparison'},'Interactive');
        assert.ok(result.figIframeHtml.includes('mountImageComparison'));assert.ok(!result.figIframeHtml.includes('Plotly.newPlot'));assert.ok(!result.figIframeHtml.includes('</script><script>alert(1)</script>'));
        console.log('PASS comparison admin/export: data-free setup, no playback controls, guidance, hidden-pair persistence/reload/type switching, active spec, validation and standalone export');
    } finally {e.close()}
}
(async()=>{await comparison();await adminAndExport()})().catch(error=>{console.error(error);process.exitCode=1});
