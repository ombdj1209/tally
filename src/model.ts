export type Person = { id: string; name: string; color: number };
export type Group = { id: string; name: string; emoji: string; members: string[]; color: number };
export type Expense = { id: string; title: string; cents: number; category: string; group: string; payer: string; shares: Record<string,number>; date: string; note: string };
export type Settlement = { id: string; from: string; to: string; cents: number; date: string };
export type Ledger = { people: Person[]; groups: Group[]; expenses: Expense[]; settlements: Settlement[]; currency: string; name: string };
export const categories = ['Food & drinks','Groceries','Travel','Home','Entertainment','Shopping','Other'];
export function equalShares(cents:number, ids:string[]):Record<string,number> {
  if (!Number.isSafeInteger(cents) || cents<1 || !ids.length) throw new Error('Enter an amount and choose at least one person.');
  return Object.fromEntries(ids.map((id,i)=>[id,Math.floor(cents/ids.length)+(i<cents%ids.length?1:0)]));
}
export function balances(data:Ledger):Record<string,number> {
  const result:Record<string,number> = Object.fromEntries(data.people.map(p=>[p.id,0]));
  for (const e of data.expenses) { result[e.payer]=(result[e.payer]||0)+e.cents; for(const [id,cents] of Object.entries(e.shares))result[id]=(result[id]||0)-cents; }
  for (const s of data.settlements) { result[s.from]+=s.cents; result[s.to]-=s.cents; }
  return result;
}
export function debts(data:Ledger) {
  const b=balances(data), receivers=Object.entries(b).filter(([,n])=>n>0).map(([id,n])=>({id,n})), payers=Object.entries(b).filter(([,n])=>n<0).map(([id,n])=>({id,n:-n}));
  const result:{from:string;to:string;cents:number}[]=[];
  for (const p of payers) for(const r of receivers) { const cents=Math.min(p.n,r.n); if(cents){result.push({from:p.id,to:r.id,cents});p.n-=cents;r.n-=cents;} }
  return result;
}
export const emptyLedger = ():Ledger=>({name:'Alex',currency:'USD',people:[{id:'you',name:'You',color:0}],groups:[],expenses:[],settlements:[]});
export function demoLedger():Ledger {
  const people=[{id:'you',name:'You',color:0},{id:'maya',name:'Maya',color:1},{id:'james',name:'James',color:2},{id:'sophie',name:'Sophie',color:3}];
  const groups=[{id:'bali',name:'Bali, here we come',emoji:'🌴',members:['you','maya','james','sophie'],color:0},{id:'home',name:'The apartment',emoji:'🏡',members:['you','maya'],color:1},{id:'weekend',name:'Weekend people',emoji:'🍸',members:['you','james','sophie'],color:2}];
  const date=(day:number)=>`${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}-${String(Math.min(day,new Date().getDate())).padStart(2,'0')}`;
  const rows:[string,number,string,string,string,number][]=[['Dinner at Bar Vera',12840,'Food & drinks','weekend','you',26],['The weekly grocery run',8620,'Groceries','home','maya',25],['Our little Bali villa',64000,'Travel','bali','you',24],['Coffee & catch-ups',2450,'Food & drinks','weekend','sophie',23],['October internet',6000,'Home','home','you',20],['Movie night',5400,'Entertainment','weekend','james',18],['Airport transfers',9600,'Travel','bali','maya',15],['Sunday brunch',7800,'Food & drinks','weekend','you',12],['Kitchen essentials',4200,'Shopping','home','maya',9],['Snacks for the flight',3200,'Groceries','bali','sophie',5]];
  return {name:'Alex',currency:'USD',people,groups,settlements:[],expenses:rows.map(([title,cents,category,group,payer,day],i)=>({id:`demo-${i}`,title,cents,category,group,payer,date:date(day),note:'',shares:equalShares(cents,groups.find(g=>g.id===group)!.members)}))};
}
