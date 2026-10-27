import { useEffect, useState } from 'react';
import { Sun, Moon, Monitor, Check } from 'lucide-react';

type Mode = 'light' | 'dark' | 'system';
type Accent = 'lime' | 'peach' | 'lavender';
const modes = ['light', 'dark', 'system'] as const;
const accents = ['lime', 'peach', 'lavender'] as const;
function read<T extends string>(key: string, choices: readonly T[], fallback: T): T {
  try { const value = localStorage.getItem(key) as T; return choices.includes(value) ? value : fallback; } catch { return fallback; }
}
export function useAppearance() {
  const [mode, setMode] = useState<Mode>(() => read('tally-mode', modes, 'light'));
  const [accent, setAccent] = useState<Accent>(() => read('tally-accent', accents, 'lime'));
  const [warning, setWarning] = useState('');
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    function apply() {
      const dark = mode === 'dark' || (mode === 'system' && media.matches);
      document.documentElement.dataset.theme = dark ? 'dark' : 'light';
      document.documentElement.dataset.accent = accent;
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#191e19' : '#f6f7f2');
    }
    apply(); media.addEventListener('change', apply);
    try { localStorage.setItem('tally-mode', mode); localStorage.setItem('tally-accent', accent); setWarning(''); }
    catch { setWarning('Applied for this visit. Your browser could not save this preference.'); }
    return () => media.removeEventListener('change', apply);
  }, [mode, accent]);
  return { mode, setMode, accent, setAccent, warning };
}
export function AppearanceSettings({ appearance }: { appearance: ReturnType<typeof useAppearance> }) {
  const { mode, setMode, accent, setAccent, warning } = appearance;
  return <section className="appearance-settings" aria-labelledby="appearance-title">
    <h3 id="appearance-title">Make yourself at home</h3>
    <p>Choose your look. Changes apply instantly on this device.</p>
    <fieldset className="theme-options"><legend>Appearance</legend>
      {modes.map(value => {
        const Icon = value === 'light' ? Sun : value === 'dark' ? Moon : Monitor;
        return <label className={`theme-choice ${mode === value ? 'selected' : ''}`} key={value}>
          <input type="radio" name="appearance" value={value} checked={mode === value} onChange={() => setMode(value)} />
          <span className={`theme-preview preview-${value}`} aria-hidden="true"><span className="preview-heading"/><span className="preview-balance"/><span className="preview-rows"><i/><i/></span></span>
          <span className="theme-choice-label"><Icon size={15}/>{value.charAt(0).toUpperCase()+value.slice(1)}<span className="theme-check">{mode === value && <Check size={12}/>}</span></span>
        </label>;
      })}
    </fieldset>
    <fieldset className="accent-options"><legend>A little color</legend>{accents.map(value => <label key={value} className={`accent-choice ${accent===value?'selected':''}`}><input type="radio" name="accent" value={value} checked={accent===value} onChange={()=>setAccent(value)}/><span className={`accent-swatch swatch-${value}`} aria-hidden="true">{accent===value&&<Check size={14}/>}</span>{value.charAt(0).toUpperCase()+value.slice(1)}</label>)}</fieldset>
    <p className="appearance-status" role="status">{warning || (mode === 'system' ? 'Follows your device’s light and dark appearance.' : 'Your preference is saved on this device.')}</p>
  </section>;
}
