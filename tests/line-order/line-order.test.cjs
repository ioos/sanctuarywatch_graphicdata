const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const root=require('path').resolve(__dirname, '../../plugins/graphic_data_plugin');
const {JSDOM}=require(root+'/node_modules/jsdom'),parser=require(root+'/node_modules/@babel/parser');
const dom=new JSDOM('<div id="graphGUI"></div><textarea name="figure_interactive_arguments"></textarea>',{runScripts:'outside-only'});
const w=dom.window,ctx=dom.getInternalVMContext(),saved=w.document.querySelector('textarea');
const utility=fs.readFileSync(root+'/includes/figures/js/interactive/plotly-utility.js','utf8');
for(const n of parser.parse(utility,{sourceType:'module'}).program.body){
 if(n.type==='ExportNamedDeclaration'&&['logFormFieldValues','fillFormFieldValues'].includes(n.declaration?.id?.name))vm.runInContext(utility.slice(n.declaration.start,n.declaration.end),ctx);
}
const source=fs.readFileSync(root+'/includes/figures/js/interactive/plotly-timeseries-line.js','utf8');
const fn=parser.parse(source,{sourceType:'module'}).program.body.find(n=>n.type==='FunctionDeclaration'&&n.id.name==='displayLineFields');
vm.runInContext(source.slice(fn.start,fn.end),ctx);
const config={XAxis:'x',EventMarkers:'',EvaluationPeriod:''};
const columns={0:'x'};
for(let i=1;i<=12;i++){columns[i]='v'+i;Object.assign(config,{['Line'+i]:'v'+i,['Line'+i+'Title']:'Title '+i,['Line'+i+'Color']:'#123456'});}
saved.value=JSON.stringify(Object.entries(config));w.displayLineFields(12,columns,saved.value);
const click=(i,dir)=>w.document.querySelector('[data-line-position="'+i+'"][data-line-move="'+dir+'"]').click();
assert.equal(w.document.querySelector('[data-line-position="1"][data-line-move="up"]').disabled,true);
assert.equal(w.document.querySelector('[data-line-position="12"][data-line-move="down"]').disabled,true);
w.document.getElementById('Line10Title').value='Unsaved edit';
click(10,'up');
assert.equal(w.document.getElementById('Line9').value,'v10');
assert.equal(w.document.getElementById('Line9Title').value,'Unsaved edit');
assert.equal(w.document.getElementById('Line10').value,'v9');
assert.equal(w.document.getElementById('Line1').value,'v1');
assert.equal(w.document.getElementById('XAxis').value,'x');
click(9,'down');
assert.equal(w.document.getElementById('Line10').value,'v10');
const persist=saved.value;
w.displayLineFields(12,columns,persist);
assert.equal(w.document.getElementById('Line10Title').value,'Unsaved edit');
assert.equal(w.document.querySelectorAll('[data-line-move]').length,24);
console.log('PASS: up/down moves, saved/reloaded settings, unsaved edits, 12-line indices, boundaries, and unchanged X axis.');
