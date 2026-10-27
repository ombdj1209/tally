import { test } from 'node:test';
import assert from 'node:assert/strict';
import { allocate, checkDraft, computeInsight, localPlan, type Draft } from '../src/assistant-core.ts';
import { demoLedger } from '../src/model.ts';
import { answerAssistant } from '../server/assistant.ts';
const ledger=demoLedger();
const base:Draft={title:'Dinner',totalCents:1001,currency:'USD',date:'2026-10-26',payer:'you',group:'',category:'Food & drinks',method:'equal',allocations:[{person:'you',value:1},{person:'maya',value:1},{person:'james',value:1}],items:[],taxCents:0,tipCents:0,note:''};
test('weighted split uses largest remainder and conserves every cent',()=>{
  assert.deepEqual(allocate(1001,[{person:'a',value:3},{person:'b',value:2}]),{a:601,b:400});
  for(let n=1;n<1000;n+=17){const shares=allocate(n,[{person:'a',value:33.33},{person:'b',value:33.33},{person:'c',value:33.34}]);assert.equal(Object.values(shares).reduce((a,b)=>a+b,0),n)}
  assert.throws(()=>allocate(100,[{person:'a',value:1},{person:'a',value:1}]));assert.throws(()=>allocate(100,[{person:'a',value:0}]));
});
test('item-based split distributes tax and tip only across item subtotals',()=>{
  const draft={...base,totalCents:5500,method:'items' as const,items:[{title:'Pizza',cents:2000,allocations:[{person:'you',value:1},{person:'maya',value:1}]},{title:'Wine',cents:3000,allocations:[{person:'you',value:1}]}],taxCents:200,tipCents:300};
  assert.deepEqual(checkDraft(draft,ledger).expense.shares,{you:4400,maya:1100});
  assert.throws(()=>checkDraft({...draft,totalCents:5400},ledger),/do not match/);
});
test('invalid identities, currencies, dates, exact totals are rejected',()=>{
  assert.throws(()=>checkDraft({...base,payer:'invented'},ledger));
  assert.throws(()=>checkDraft({...base,currency:'EUR'},ledger));
  assert.throws(()=>checkDraft({...base,date:'2026-02-30'},ledger));
  assert.throws(()=>checkDraft({...base,method:'exact'},ledger));
  assert.throws(()=>checkDraft({...base,group:'home'},ledger),/member/);
});
test('duplicate warnings do not silently drop valid expenses',()=>{
  const existing=ledger.expenses[0];const checked=checkDraft({...base,totalCents:existing.cents,date:existing.date,payer:existing.payer},ledger);assert.ok(checked.warnings.some(w=>w.includes('duplicate')));
});
test('insight total equals displayed evidence and respects category/date filters',()=>{
  const r=computeInsight(ledger,{from:'',to:'',category:'Travel',group:''});assert.equal(r.totalCents,18400);assert.equal(r.evidence.reduce((s,e)=>s+e.cents,0),r.totalCents);
  assert.throws(()=>computeInsight(ledger,{from:'2026-11-01',to:'2026-10-01',category:'',group:''}));
});
test('local helper is explicit, safe, and does not invent participants',()=>{
  const p=localPlan('I paid 10.01 for coffee with Maya',ledger,'draft','2026-10-26');assert.deepEqual(checkDraft(p.drafts[0],ledger).expense.shares,{you:501,maya:500});
  assert.equal(localPlan('I paid 10 for lunch with Stranger',ledger,'draft').drafts.length,0);
  assert.equal(localPlan('Split a villa by nights',ledger,'draft').drafts.length,0);
});
const env={OPENAI_API_KEY:'test-key-not-real',SUPABASE_URL:'https://test.invalid',SUPABASE_ANON_KEY:'test-public-key'};
test('endpoint refuses missing key/auth without contacting external services',async()=>{
  const never:typeof fetch=async()=>{throw new Error('Must not fetch')};
  assert.equal((await answerAssistant({mode:'draft',message:'x'},'',{},never)).status,503);
  assert.equal((await answerAssistant({mode:'draft',message:'x'},'',env,never)).status,401);
});
test('endpoint validates drafts and never executes a ledger write',async()=>{
  const calls:string[]=[];const mock:typeof fetch=async(input,init)=>{const url=String(input);calls.push(url);
    if(url.endsWith('/auth/v1/user'))return Response.json({id:'test-user'});
    if(url.includes('/rpc/'))return Response.json(true);
    if(url.includes('/rest/v1/ledgers')){assert.equal(init?.method,undefined);return Response.json([{data:ledger,revision:3}])}
    const request=JSON.parse(String(init?.body));assert.equal(request.store,false);assert.equal(request.text.format.strict,true);assert.ok(!JSON.stringify(request).includes('demo-0'));
    return Response.json({status:'completed',output:[{content:[{type:'output_text',text:JSON.stringify({reply:'Ready to review.',questions:[],drafts:[base],filter:{from:'',to:'',category:'',group:''}})}]}]});};
  const result=await answerAssistant({mode:'draft',message:'Split this equally'},'test-token',env,mock);assert.equal(result.status,200);assert.equal((result.body as any).checked[0].expense.cents,1001);assert.equal(calls.length,4);
});
test('daily quota rejection does not call the AI provider',async()=>{
  let calls=0;const mock:typeof fetch=async()=>{calls++;return calls===1?Response.json({id:'test-user'}):Response.json(false)};
  assert.equal((await answerAssistant({mode:'draft',message:'x'},'test-token',env,mock)).status,429);assert.equal(calls,2);
});
test('clarifying questions prevent partially guessed drafts from being returned',async()=>{
  let n=0;const mock:typeof fetch=async()=>{n++;return Response.json(n===1?{id:'u'}:n===2?true:n===3?[{data:ledger,revision:1}]:{status:'completed',output:[{content:[{type:'output_text',text:JSON.stringify({reply:'Who paid?',questions:['Who paid?'],drafts:[base],filter:{from:'',to:'',category:'',group:''}})}]}]})};
  const result=await answerAssistant({mode:'draft',message:'Dinner'},'test-token',env,mock);assert.equal(result.status,200);assert.equal((result.body as any).checked.length,0);
});
