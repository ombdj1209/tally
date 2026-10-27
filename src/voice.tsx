import { useEffect, useRef, useState } from 'react';
import { Volume2, Square } from 'lucide-react';

export type Personality={name:string;tone:'calm'|'warm'|'sassy';instructions:string;language:string;voice:string;rate:number;pitch:number;localOnly:boolean;autoRead:boolean};
const defaults:Personality={name:'Pip',tone:'sassy',instructions:'',language:'en-US',voice:'',rate:1,pitch:1.05,localOnly:false,autoRead:false};
export function usePersonality(){
  const [prefs,setPrefs]=useState<Personality>(()=>{try{const v=JSON.parse(localStorage.getItem('tally-personality')||'{}');return {...defaults,...v,tone:['calm','warm','sassy'].includes(v.tone)?v.tone:defaults.tone,rate:Math.max(.7,Math.min(1.3,Number(v.rate)||1)),pitch:Math.max(.7,Math.min(1.3,Number(v.pitch)||1.05))}}catch{return defaults}});
  const [warning,setWarning]=useState('');
  useEffect(()=>{try{localStorage.setItem('tally-personality',JSON.stringify(prefs));setWarning('')}catch{setWarning('Settings apply now, but this browser cannot save them.')}},[prefs]);
  return {prefs,setPrefs,warning};
}
export function useSpeech(prefs:Personality){
  const [voices,setVoices]=useState<SpeechSynthesisVoice[]>([]),[speaking,setSpeaking]=useState(false),[speechError,setSpeechError]=useState('');
  const active=useRef<SpeechSynthesisUtterance|null>(null);
  const supported=typeof window!=='undefined'&&'speechSynthesis'in window;
  useEffect(()=>{if(!supported)return;const update=()=>setVoices(window.speechSynthesis.getVoices());update();window.speechSynthesis.addEventListener('voiceschanged',update);return()=>{window.speechSynthesis.removeEventListener('voiceschanged',update);if(active.current){active.current.onend=null;active.current.onerror=null;window.speechSynthesis.cancel()}}},[supported]);
  function stop(){if(supported){window.speechSynthesis.cancel();active.current=null;setSpeaking(false)}}
  function speak(text:string){
    setSpeechError('');if(!supported){setSpeechError('Read-aloud is not supported in this browser.');return;}
    stop();const choices=voices.filter(v=>!prefs.localOnly||v.localService);
    const voice=choices.find(v=>v.voiceURI===prefs.voice)||choices.find(v=>v.lang.toLowerCase()===prefs.language.toLowerCase())||choices.find(v=>v.lang.split('-')[0]===prefs.language.split('-')[0]);
    if(prefs.localOnly&&!voice){setSpeechError('No installed voice for this language. Choose another language or disable on-device-only speech.');return;}
    const utterance=new SpeechSynthesisUtterance(text.slice(0,2500));active.current=utterance;
    if(voice)utterance.voice=voice;utterance.lang=prefs.language;utterance.rate=prefs.rate;utterance.pitch=prefs.pitch;
    utterance.onstart=()=>setSpeaking(true);utterance.onend=()=>{setSpeaking(false);active.current=null};utterance.onerror=e=>{setSpeaking(false);active.current=null;if(e.error!=='canceled'&&e.error!=='interrupted')setSpeechError('This voice could not play. Try another voice, or tap Listen again.');};
    window.speechSynthesis.speak(utterance);
  }
  return {voices,speaking,speechError,supported,speak,stop};
}
type Recognition={lang:string;continuous:boolean;interimResults:boolean;processLocally?:boolean;onresult:((event:{resultIndex:number;results:{length:number;[i:number]:{isFinal:boolean;[i:number]:{transcript:string}}}})=>void)|null;onerror:((event:{error:string})=>void)|null;onend:(()=>void)|null;start:()=>void;stop:()=>void;abort:()=>void};
type RecognitionConstructor={new():Recognition;available?:(options:{langs:string[];processLocally:boolean})=>Promise<string>};
function recognitionClass(){const w=window as unknown as {SpeechRecognition?:RecognitionConstructor;webkitSpeechRecognition?:RecognitionConstructor};return w.SpeechRecognition||w.webkitSpeechRecognition}
export function useDictation(prefs:Personality,onText:(text:string)=>void){
  const [listening,setListening]=useState(false),[starting,setStarting]=useState(false),[interim,setInterim]=useState(''),[voiceError,setVoiceError]=useState('');
  const ref=useRef<Recognition|null>(null),timer=useRef<ReturnType<typeof setTimeout>|null>(null),callback=useRef(onText),mounted=useRef(true);callback.current=onText;
  const supported=!!recognitionClass();
  useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;if(timer.current)clearTimeout(timer.current);if(ref.current){ref.current.onend=null;ref.current.onerror=null;ref.current.onresult=null;ref.current.abort()}}},[]);
  function stop(){ref.current?.stop();if(timer.current)clearTimeout(timer.current)}
  async function start(){
    if(starting||listening)return;setVoiceError('');setInterim('');const Constructor=recognitionClass();
    if(!Constructor){setVoiceError('Dictation is unavailable here. Type instead, or open Tally in a browser with speech recognition.');return;}
    setStarting(true);
    try{
      if(prefs.localOnly){if(!Constructor.available)throw new Error('On-device dictation is not supported here. You can type, or allow browser speech in Settings.');const status=await Constructor.available({langs:[prefs.language],processLocally:true});if(status!=='available')throw new Error('The on-device speech language pack is not installed. Type instead, or allow browser speech in Settings.');}
      if(!mounted.current)return;
      const recognition=new Constructor();ref.current=recognition;recognition.lang=prefs.language;recognition.continuous=false;recognition.interimResults=true;
      if(prefs.localOnly)recognition.processLocally=true;
      recognition.onresult=e=>{let pending='';for(let i=e.resultIndex;i<e.results.length;i++){const text=e.results[i][0].transcript;if(e.results[i].isFinal)callback.current(text);else pending+=text;}setInterim(pending)};
      recognition.onerror=e=>{const messages:Record<string,string>={'not-allowed':'Microphone access was denied. Allow it in browser settings, or type instead.','audio-capture':'No microphone is available. You can still type.','no-speech':'I didn’t catch that. Try again a little closer to the microphone.','network':'Browser speech could not connect. Type instead, or try again.','language-not-supported':'This speech language is not supported on your device.'};if(e.error!=='aborted')setVoiceError(messages[e.error]||'Dictation stopped. Please try again.');setListening(false)};
      recognition.onend=()=>{setListening(false);setInterim('');if(timer.current)clearTimeout(timer.current)};
      recognition.start();setListening(true);timer.current=setTimeout(()=>recognition.stop(),25000);
    }catch(e){if(mounted.current)setVoiceError((e as Error).message)}finally{if(mounted.current)setStarting(false)}
  }
  return {listening,starting,interim,voiceError,supported,start,stop};
}
export function PersonalitySettings({personality}:{personality:ReturnType<typeof usePersonality>}){
  const {prefs,setPrefs,warning}=personality,speech=useSpeech(prefs);
  function update<K extends keyof Personality>(key:K,value:Personality[K]){speech.stop();setPrefs(p=>({...p,[key]:value}))}
  const samples={calm:'Your draft is ready. Please review the shares before saving.',warm:'All worked out. Take a quick look, then get back to the good part.',sassy:'The maths is handled. Your group chat can retire from accounting.'};
  return <section className="personality-settings"><div className="section-heading"><h3>Your little money sidekick</h3><span className="mini-label">PERSONALITY & VOICE</span></div><p className="form-intro">A little character. Absolutely no money guilt.</p>
    <label className="field">Assistant name<input value={prefs.name} maxLength={24} onChange={e=>update('name',e.target.value)}/></label>
    <fieldset className="tone-options"><legend>The vibe</legend>{(['calm','warm','sassy'] as const).map(t=><label key={t} className={prefs.tone===t?'selected':''}><input type="radio" name="assistant-tone" checked={prefs.tone===t} onChange={()=>update('tone',t)}/><strong>{t==='calm'?'Calm':t==='warm'?'Warm':'A little sassy'}</strong><span>{t==='calm'?'Clear & direct':t==='warm'?'Your kind friend':'Wit, not judgment'}</span></label>)}</fieldset>
    <div className="personality-sample">“{samples[prefs.tone]}”</div>
    <label className="field">Personal touches <small>Optional; sent only when you use cloud AI.</small><textarea value={prefs.instructions} maxLength={300} onChange={e=>update('instructions',e.target.value)} placeholder="Call me Alex. Keep replies short. A little dry humor is welcome." rows={3}/></label>
    <div className="form-grid"><label className="field">Speech language<select value={prefs.language} onChange={e=>update('language',e.target.value)}>{[['en-US','English · US'],['en-GB','English · UK'],['en-IN','English · India'],['hi-IN','Hindi'],['ja-JP','Japanese'],['es-ES','Spanish'],['fr-FR','French']].map(([v,n])=><option key={v} value={v}>{n}</option>)}</select></label><label className="field">Voice<select value={prefs.voice} onChange={e=>update('voice',e.target.value)} disabled={!speech.supported}><option value="">Device default</option>{speech.voices.filter(v=>!prefs.localOnly||v.localService).map(v=><option key={v.voiceURI} value={v.voiceURI}>{v.name} · {v.lang}{v.localService?' · on-device':''}</option>)}</select></label></div>
    <div className="form-grid"><label className="field">Pace · {prefs.rate.toFixed(2)}×<input type="range" min="0.7" max="1.3" step="0.05" value={prefs.rate} onChange={e=>update('rate',Number(e.target.value))}/></label><label className="field">Pitch · {prefs.pitch.toFixed(2)}<input type="range" min="0.7" max="1.3" step="0.05" value={prefs.pitch} onChange={e=>update('pitch',Number(e.target.value))}/></label></div>
    <label className="setting-toggle"><span><strong>On-device speech only</strong><small>Requires an installed voice and supported offline recognition.</small></span><input type="checkbox" checked={prefs.localOnly} onChange={e=>update('localOnly',e.target.checked)}/></label>
    <label className="setting-toggle"><span><strong>Read replies aloud</strong><small>Off by default. You can always tap Listen.</small></span><input type="checkbox" checked={prefs.autoRead} onChange={e=>update('autoRead',e.target.checked)}/></label>
    <button type="button" className="button outline full" disabled={!speech.supported} onClick={()=>speech.speaking?speech.stop():speech.speak(samples[prefs.tone])}>{speech.speaking?<Square size={16}/>:<Volume2 size={16}/>} {speech.speaking?'Stop preview':'Preview my voice'}</button>
    <p className="voice-footnote">System voices vary by device; pitch and pace add character, but cannot guarantee expressive acting. Browser speech may use an online service unless on-device-only is enabled.</p>
    {(speech.speechError||warning)&&<p role="status" className="error-banner">{speech.speechError||warning}</p>}
  </section>
}
