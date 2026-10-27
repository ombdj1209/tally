import { test } from 'node:test';
import assert from 'node:assert/strict';
import { equalShares, balances, debts, emptyLedger, demoLedger } from '../src/model.ts';
test('equal split assigns every cent, including remainder',()=>{assert.deepEqual(equalShares(100,['a','b','c']),{a:34,b:33,c:33});assert.throws(()=>equalShares(10,[]));});
test('balance conserves money and payments clear debts',()=>{const d=emptyLedger();d.people.push({id:'friend',name:'Friend',color:1});d.expenses.push({id:'1',title:'Dinner',cents:1001,category:'Food & drinks',group:'',payer:'you',shares:equalShares(1001,['you','friend']),date:'2026-10-26',note:''});assert.deepEqual(balances(d),{you:500,friend:-500});assert.deepEqual(debts(d),[{from:'friend',to:'you',cents:500}]);d.settlements.push({id:'s',from:'friend',to:'you',cents:500,date:'2026-10-26'});assert.deepEqual(debts(d),[]);});
test('simplified demo payments settle all accounts exactly',()=>{const d=demoLedger();assert.equal(Object.values(balances(d)).reduce((a,b)=>a+b,0),0);const transfers=debts(d);d.settlements=transfers.map((t,i)=>({...t,id:String(i),date:'2026-10-26'}));assert.ok(Object.values(balances(d)).every(n=>n===0));});
