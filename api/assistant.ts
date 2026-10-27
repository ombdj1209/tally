import { answerAssistant } from '../server/assistant.ts';
import type { IncomingMessage, ServerResponse } from 'node:http';
export default async function handler(req:IncomingMessage & {body?:unknown},res:ServerResponse){
  res.setHeader('Content-Type','application/json');res.setHeader('Cache-Control','no-store');
  const send=(status:number,body:unknown)=>{res.statusCode=status;res.end(JSON.stringify(body))};
  if(req.method==='GET')return send(200,{configured:!!process.env.OPENAI_API_KEY,requiresSignIn:true});
  if(req.method!=='POST'){res.setHeader('Allow','GET, POST');return send(405,{error:'Method not allowed'})}
  if(!req.headers['content-type']?.includes('application/json'))return send(415,{error:'Use JSON requests.'});
  if(Number(req.headers['content-length']||0)>3300000)return send(413,{error:'Attachments are too large.'});
  let body=req.body;
  try{if(body===undefined){let raw='';for await(const chunk of req){raw+=chunk;if(Buffer.byteLength(raw)>3300000)return send(413,{error:'Attachments are too large.'})}body=JSON.parse(raw)}else if(typeof body==='string')body=JSON.parse(body)}catch{return send(400,{error:'Invalid request body.'})}
  const token=req.headers.authorization?.startsWith('Bearer ')?req.headers.authorization.slice(7):'';
  const result=await answerAssistant(body,token,process.env);return send(result.status,result.body);
}
