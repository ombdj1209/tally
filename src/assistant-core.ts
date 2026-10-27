import { categories, type Expense, type Ledger } from './model.ts';

export type Allocation = { person: string; value: number };
export type Draft = { title: string; totalCents: number; currency: string; date: string; payer: string; group: string; category: string; method: 'equal'|'exact'|'weights'|'items'; allocations: Allocation[]; items: {title:string;cents:number;allocations:Allocation[]}[]; taxCents:number;tipCents:number; note:string };
export type InsightFilter = { from:string;to:string;category:string;group:string };
export type AssistantPlan = { reply:string;questions:string[];drafts:Draft[];filter:InsightFilter };
export type CheckedDraft = { draft:Draft;expense:Expense;warnings:string[];explanation:string };
export type Insight = { totalCents:number; count:number; categories:{name:string;cents:number}[]; evidence:{id:string;title:string;date:string;cents:number}[]; from:string;to:string; previousCents:number|null; differenceCents:number|null };
export const localDate=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
const validDate=(s:string)=>/^\d{4}-\d{2}-\d{2}$/.test(s)&&new Date(s+'T12:00:00Z').toISOString().slice(0,10)===s;
function cents(n:number,zero=false){if(!Number.isSafeInteger(n)||n<(zero?0:1)||n>10000000000)throw new Error('Amounts must be whole cents within the supported range.');return n}
export function allocate(total:number, allocations:Allocation[]):Record<string,number>{
  cents(total,true);
  if(!allocations.length||allocations.length>100||new Set(allocations.map(a=>a.person)).size!==allocations.length)throw new Error('Choose distinct people for the split.');
  if(allocations.some(a=>!Number.isFinite(a.value)||a.value<0||a.value>10000000000))throw new Error('Split weights must be valid positive values.');
  const weights=allocations.map(a=>BigInt(Math.round(a.value*10000))),sum=weights.reduce((a,b)=>a+b,0n);
  if(!sum)throw new Error('At least one split weight must be greater than zero.');
  // Integer arithmetic avoids floating-point remainder drift for large bills.
  const numerators=weights.map(w=>w*BigInt(total)),denom=sum;
  const rounded=numerators.map(n=>Number(n/denom));
  const order=numerators.map((n,i)=>({i,remainder:n%denom})).sort((a,b)=>a.remainder===b.remainder?a.i-b.i:a.remainder>b.remainder?-1:1);
  const remainder=total-rounded.reduce((a,b)=>a+b,0);
  for(let i=0;i<remainder;i++)rounded[order[i].i]++;
  return Object.fromEntries(allocations.map((a,i)=>[a.person,rounded[i]]));
}
export function checkDraft(d:Draft,data:Ledger,id='draft'):CheckedDraft{
  cents(d.totalCents);if(d.currency!==data.currency)throw new Error('This receipt uses a different currency. Convert it explicitly before adding it.');
  if(!d.title?.trim()||d.title.length>90||!validDate(d.date))throw new Error('The expense needs a valid title and date.');
  if(!categories.includes(d.category))throw new Error('Choose a valid category.');
  const people=new Set(data.people.map(p=>p.id)),group=data.groups.find(g=>g.id===d.group);
  if(!people.has(d.payer)||d.group&&!group)throw new Error('The payer or group could not be matched.');
  function validate(as:Allocation[]){if(!Array.isArray(as)||!as.length)throw new Error('Tell me who is sharing this expense.');for(const a of as){if(!people.has(a.person)||group&&!group.members.includes(a.person))throw new Error('Someone in the split is not a member of this group.');}}
  let shares:Record<string,number>,explanation='';
  if(d.method==='items'){
    if(!d.items?.length||d.items.length>100)throw new Error('Itemized splits need readable receipt items.');
    shares={};let subtotal=0;
    for(const item of d.items){cents(item.cents);validate(item.allocations);subtotal+=item.cents;for(const [person,n] of Object.entries(allocate(item.cents,item.allocations)))shares[person]=(shares[person]||0)+n;}
    cents(d.taxCents,true);cents(d.tipCents,true);
    if(subtotal+d.taxCents+d.tipCents!==d.totalCents)throw new Error('Receipt items, tax, and tip do not match the total. Please clarify the missing amount.');
    // Proportional tax and tip are based on each person's item subtotal.
    const extra=allocate(d.taxCents+d.tipCents,Object.entries(shares).map(([person,value])=>({person,value})));
    for(const [person,n] of Object.entries(extra))shares[person]+=n;
    explanation='Items split as assigned. Tax and tip distributed proportionally to item subtotals; leftover cents assigned by largest remainder.';
  }else{
    validate(d.allocations);
    if(d.method==='exact'){
      if(new Set(d.allocations.map(a=>a.person)).size!==d.allocations.length)throw new Error('A person appears twice in the split.');
      shares=Object.fromEntries(d.allocations.map(a=>[a.person,cents(a.value,true)]));
      if(Object.values(shares).reduce((a,b)=>a+b,0)!==d.totalCents)throw new Error('The exact shares do not add up to the total.');
      explanation='Exact amounts, checked against the expense total.';
    }else if(d.method==='equal'||d.method==='weights'){
      shares=allocate(d.totalCents,d.allocations.map(a=>({...a,value:d.method==='equal'?1:a.value})));
      explanation=d.method==='equal'?'Equal split. Any leftover cents go to the first people listed.':`Weighted split (${d.allocations.map(a=>`${data.people.find(p=>p.id===a.person)?.name}: ${a.value}`).join(', ')}). Leftover cents assigned by largest remainder.`;
    }else throw new Error('This split method is not supported.');
  }
  if(Object.values(shares).reduce((a,b)=>a+b,0)!==d.totalCents)throw new Error('The split does not balance.');
  const duplicate=data.expenses.filter(e=>e.cents===d.totalCents&&e.date===d.date&&e.payer===d.payer);
  const warnings=duplicate.map(e=>`Possible duplicate: ${e.title} has the same amount, payer, and date.`);
  if(group&&!group.members.includes(d.payer))warnings.push('The payer is outside this group. Please check.');
  return {draft:d,expense:{id,title:d.title.trim(),cents:d.totalCents,category:d.category,group:d.group,payer:d.payer,shares,date:d.date,note:d.note.slice(0,300)},warnings,explanation};
}
export function computeInsight(data:Ledger,filter:InsightFilter):Insight{
  if(filter.from&&!validDate(filter.from)||filter.to&&!validDate(filter.to)||filter.from&&filter.to&&filter.from>filter.to)throw new Error('Use a valid date range.');
  if(filter.category&&!categories.includes(filter.category)||filter.group&&!data.groups.some(g=>g.id===filter.group))throw new Error('That category or group is not in this ledger.');
  const match=(e:Expense)=> (!filter.category||e.category===filter.category)&&(!filter.group||e.group===filter.group);
  const rows=data.expenses.filter(e=>match(e)&&(!filter.from||e.date>=filter.from)&&(!filter.to||e.date<=filter.to));
  const totalCents=rows.reduce((sum,e)=>sum+(e.shares.you||0),0);
  let previousCents:number|null=null;
  if(filter.from&&filter.to){const start=new Date(filter.from+'T00:00:00Z'),end=new Date(filter.to+'T00:00:00Z'),days=Math.round((+end-+start)/86400000)+1;const prevEnd=new Date(+start-86400000).toISOString().slice(0,10),prevStart=new Date(+start-days*86400000).toISOString().slice(0,10);previousCents=data.expenses.filter(e=>match(e)&&e.date>=prevStart&&e.date<=prevEnd).reduce((sum,e)=>sum+(e.shares.you||0),0);}
  return {totalCents,count:rows.length,categories:categories.map(name=>({name,cents:rows.filter(e=>e.category===name).reduce((s,e)=>s+(e.shares.you||0),0)})).filter(c=>c.cents).sort((a,b)=>b.cents-a.cents),evidence:rows.map(e=>({id:e.id,title:e.title,date:e.date,cents:e.shares.you||0})).sort((a,b)=>b.cents-a.cents),from:filter.from,to:filter.to,previousCents,differenceCents:previousCents===null?null:totalCents-previousCents};
}
export function localPlan(message:string,data:Ledger,mode:'draft'|'insights',today=localDate()):AssistantPlan{
  const filter={from:'',to:'',category:'',group:''};
  if(mode==='insights')return {reply:'Here is your all-time spending breakdown, calculated from your recorded share. Local mode supports this summary; connect AI for custom questions.',questions:[],drafts:[],filter};
  // Deliberately narrow grammar: no guessing at unsupported natural-language requests.
  const match=message.trim().match(/^I paid (?:\$)?(\d+(?:\.\d{1,2})?) for (.{1,90}?) with (.+?)[.!]?$/i);
  if(!match)return {reply:'Local helper understands a simple equal split. Try: “I paid 120 for dinner with Maya”. Complex requests and receipt reading need cloud AI.',questions:[],drafts:[],filter};
  const names=match[3].split(/,\s*|\s+and\s+/i).map(s=>s.trim().toLowerCase()),ids=['you'];
  for(const name of names){const matches=data.people.filter(p=>p.name.toLowerCase()===name);if(matches.length!==1)return {reply:`I couldn’t uniquely match “${name}”. Add that person in Groups, or use their exact name.`,questions:[],drafts:[],filter};if(!ids.includes(matches[0].id))ids.push(matches[0].id);}
  return {reply:'Equal split drafted. Take a look before adding it.',questions:[],filter,drafts:[{title:match[2],totalCents:Math.round(Number(match[1])*100),currency:data.currency,date:today,payer:'you',group:'',category:'Other',method:'equal',allocations:ids.map(person=>({person,value:1})),items:[],taxCents:0,tipCents:0,note:'Drafted with local helper; review category and group.'}]};
}
