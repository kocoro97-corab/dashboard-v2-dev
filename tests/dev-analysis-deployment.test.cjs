'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const html=read('index.html');
const scripts=[
 'js/exchange-session-proof.js',
 'js/sector-rotation-adapter.js',
 'js/sector-rotation-engine.js',
 'js/sector-cache-rotation-bridge.js',
 'js/page-sectors.js',
 'js/page-stocks.js',
 'js/market-regime-engine.js',
 'js/stock-setup-adapter.js',
 'js/stock-setup-engine.js',
 'js/integrated-strategy-engine.js',
 'js/integrated-event-adapter.js',
 'js/opportunity-review-queue.js',
 'js/cached-strategy-bridge.js',
 'js/analysis-integration-panel-v1.js',
 'js/page-strategy.js'
];
test('development CSP, OAuth and dev relay are preserved',()=>{
 assert.match(html,/Content-Security-Policy/);
 assert.match(html,/myinvest-v2-dev-relay\.kocoro97\.workers\.dev/);
 assert.match(html,/oauth\/google\/start/);
 assert.match(html,/base-uri 'none'/);
 assert.match(html,/s\.tradingview\.com/);
});
test('all staged analytics modules exist, are syntactically valid, and load in dependency order',()=>{
 let prior=-1;
 for(const file of scripts){
  const content=read(file);
  new Function(content);
  const tag=new RegExp('<script\\s+src="'+file.replace(/[.*+?^${}()|[\]\\]/g,'\\  const tag=new RegExp('<script\\s+src="'+file.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\?[^"]*"\\s*><\\/script>');')+'\\?[^"]*"\\s*><\\/script>,'g');
  const occurrences=[...html.matchAll(tag)];
  assert.equal(occurrences.length,1,file+' script tag must exist exactly once');
  const index=html.indexOf(occurrences[0][0]);
  assert.ok(index>prior,file+' must load after its required dependencies');
  prior=index;
 }
});
test('existing industry momentum and verified ETF rotation have disjoint selectors',()=>{
 const sectors=read('js/page-sectors.js');
 assert.equal((sectors.match(/'stv2-insights'/g)||[]).length,1);
 assert.equal((sectors.match(/'stv2-verified-rotation'/g)||[]).length,1);
 assert.match(sectors,/strictRotation/);
 assert.match(sectors,/sessionDates:proven/);
});
test('invest workflow UI reuses cached data and leaves account provider unchanged',()=>{
 const strategy=read('js/page-strategy.js');
 const stocks=read('js/page-stocks.js');
 const panel=read('js/analysis-integration-panel-v1.js');
 const bridge=read('js/cached-strategy-bridge.js');
 assert.match(strategy,/integration\.mount\(view,currentPublic\)/);
 assert.match(strategy,/readinessPanel\?\.destroy\?\.\(\)/);
 assert.match(strategy,/MYInvestEventContext\.collect/);
 assert.match(strategy,/InvestWorkflow\.holdings\(ctx,s,latestData\)/);
 assert.match(stocks,/sessionProof=session\?\.status/);
 for(const [name,body] of [['panel',panel],['bridge',bridge]]){
  assert.doesNotMatch(body,/\bfetch\s*\(|\bXMLHttpRequest\b|\bindexedDB\b|\blocalStorage\b|\bsessionStorage\b/,
   name+' must not initiate separate fetches or persist private data');
  assert.doesNotMatch(body,/placeOrder\s*\(|submitOrder\s*\(/);
 }
 assert.match(bridge,/sectorLink\?\.verified===true/);
});
test('all script URLs use same-origin relative paths and versioned development cache',()=>{
 const stagedTags=[...html.matchAll(/<script\s+src="(js\/[^"]+)"\s*><\/script>/g)]
 .map(m=>m[1]).filter(x=>scripts.some(file=>x.startsWith(file+'?')));
 assert.equal(stagedTags.length,scripts.length);
 for(const s of stagedTags){
  assert.ok(s.includes('dev=analysis-20261124'),s+' lacks explicit new deployment cache version');
  assert.ok(!s.startsWith('//')&&!s.includes('://'),'only same-origin script loads allowed');
 }
});
