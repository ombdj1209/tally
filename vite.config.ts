import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import handler from './api/assistant.ts';
export default defineConfig(({mode})=>{
  const env=loadEnv(mode,process.cwd(),'');
  for(const key of ['OPENAI_API_KEY','OPENAI_MODEL','SUPABASE_URL','SUPABASE_ANON_KEY','VITE_SUPABASE_URL','VITE_SUPABASE_ANON_KEY'])if(env[key])process.env[key]=env[key];
  return {plugins:[react(),{name:'tally-local-assistant',configureServer(server){server.middlewares.use('/api/assistant',(req,res)=>{void handler(req,res).catch(()=>{res.statusCode=500;res.end(JSON.stringify({error:'Assistant unavailable.'}))})})}}]};
});
