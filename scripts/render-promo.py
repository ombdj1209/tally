"""Render the Tally feature film from real screenshots. Requires Python 3 and FFmpeg.
Run from the project root: python scripts/render-promo.py
Outputs docs/media/tally-feature-tour.mp4 (1920x1080, 30fps).
"""
import math
import shutil
import struct
import subprocess
import wave
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CACHE = ROOT / '.cache' / 'promo'
OUT = ROOT / 'docs' / 'media'
CACHE.mkdir(parents=True, exist_ok=True)
OUT.mkdir(parents=True, exist_ok=True)
FONT = Path('C:/Windows/Fonts/arial.ttf')
BOLD = Path('C:/Windows/Fonts/arialbd.ttf')
if not FONT.exists():
    FONT = Path('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf')
    BOLD = Path('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf')
shutil.copyfile(FONT, CACHE / 'regular.ttf')
shutil.copyfile(BOLD, CACHE / 'bold.ttf')

# Captions describe shipping behavior; cloud features are explicitly qualified.
SCENES = [
 ('GOOD TIMES. CLEAR TABS.', 'Less money admin.\nMore living.', 'Meet Tally. Your expenses, finally in order.', 'mobile-overview', 'lime'),
 ('01 / YOUR PEOPLE', 'Every shared plan.\nOne clear place.', 'Groups, people, trips and everyday expenses.', 'mobile-groups', 'cream'),
 ('02 / ADD AN EXPENSE', 'A few details.\nEvery cent counted.', 'Choose a payer, category, group, date and note.', 'mobile-add-expense', 'cream'),
 ('03 / FLEXIBLE SPLITS', 'Fair looks different\nfor every bill.', 'Equal shares. Exact amounts. Percentages.', 'mobile-percentage-split', 'ink'),
 ('04 / KEEP TRACK', 'Find it. Review it.\nKeep it accurate.', 'Search, filter, edit, delete and export as CSV.', 'mobile-expense-detail', 'cream'),
 ('05 / SETTLE UP', 'Clear balances.\nLess awkwardness.', 'Record full or partial payments. Undo mistakes.\nPayment records only; Tally does not move money.', 'mobile-record-payment', 'lime'),
 ('06 / SPENDING INSIGHTS', 'Know where\nit all goes.', 'Your share, categories, month filters and daily rhythm.', 'mobile-insights', 'cream'),
 ('07 / YOUR SIDEKICK', 'Type it. Say it.\nMake it simpler.', 'A local helper for simple drafts. Optional cloud AI\nadds receipt reading, flexible splits and spending queries.', 'mobile-assistant', 'ink'),
 ('08 / YOU STAY IN CONTROL', 'Draft first.\nReview. Then save.', 'Check people and amounts before adding expenses.\nCloud drafts also flag possible duplicates.', 'mobile-draft-review', 'cream'),
 ('09 / A LITTLE PERSONALITY', 'Helpful. Warm.\nA little sassy.', 'Customize the name, tone and personal instructions.\nChoose voice, pace and pitch. Browser support varies.', 'mobile-personality', 'lime'),
 ('10 / MAKE IT YOURS', 'Your palette.\nYour kind of calm.', 'Light, dark or system. Lime, peach or lavender.\nRounded surfaces and motion that respects your settings.', 'mobile-appearance', 'cream'),
 ('11 / ROOM TO BREATHE', 'Small screen.\nBig picture.', 'A responsive web app with\na dedicated desktop layout.', 'web-overview', 'ink'),
 ('12 / START YOUR WAY', 'Try it locally.\nSync when ready.', 'Optional Supabase sign-in and private sync.\nCloud AI needs provider setup.\nOne private ledger per account.', 'web-expenses', 'cream'),
 ('TALLY / OPEN SOURCE', 'Good times.\nClear tabs.', 'Explore the app. Make it yours.\ngithub.com/ombdj1209/tally  |  MIT licensed', 'mobile-overview', 'lime'),
]
DURATION = 5
FPS = 30

def run(args):
    subprocess.run(args, cwd=CACHE, check=True, stdout=subprocess.DEVNULL)

for index, (label, title, caption, shot, theme) in enumerate(SCENES):
    bg, fg, muted = {'cream':('f6f7f0','20291f','5c6857'), 'ink':('20291f','f6f7f0','d7e0cb'), 'lime':('d9f572','20291f','435332')}[theme]
    for key, content in [('label',label),('title',title),('caption',caption)]:
        (CACHE / f'{index}-{key}.txt').write_text(content, encoding='utf-8', newline='\n')
        for line_index, line in enumerate(content.splitlines()):
            (CACHE / f'{index}-{key}-{line_index}.txt').write_text(line, encoding='utf-8')
    desktop = shot.startswith('web-')
    width, height = (1056,825) if desktop else (388,840)
    x, y = (810,142) if desktop else (1370,118)
    title_size = 63 if desktop else 80
    filters = [
        f'[1:v]scale={width}:{height}:flags=lanczos,setsar=1[screen]',
        f'[0:v]drawbox=x={x-12}:y={y-12}:w={width+24}:h={height+24}:color=141b13:t=fill[base]',
        f"[base][screen]overlay=x='{x}+50*pow(max(0,1-t/0.8),3)':y={y}:shortest=1",
    ]
    text_filters = [
        f"drawtext=fontfile=bold.ttf:text='tally':fontsize=52:fontcolor={fg}:x=100:y=75",
        f"drawtext=fontfile=regular.ttf:textfile={index}-label.txt:fontsize=22:fontcolor={muted}:x=100:y=240",
    ]
    text_filters += [f"drawtext=fontfile=bold.ttf:textfile={index}-title-{line}.txt:fontsize={title_size}:fontcolor={fg}:x=95:y='{325+line*(title_size+25)}+25*pow(max(0,1-t/0.65),3)'" for line in range(len(title.splitlines()))]
    text_filters += [f"drawtext=fontfile=regular.ttf:textfile={index}-caption-{line}.txt:fontsize={25 if desktop else 29}:fontcolor={muted}:x=100:y={590+line*44}" for line in range(len(caption.splitlines()))]
    chain = ','.join(text_filters + [
        f"drawtext=fontfile=regular.ttf:text='REAL APP SCREENS / DEMO DATA':fontsize=17:fontcolor={muted}:x=100:y=956",
        f"drawtext=fontfile=bold.ttf:text='{index+1:02d} / {len(SCENES):02d}':fontsize=20:fontcolor={muted}:x=100:y=990",
        f'fade=t=in:st=0:d=0.22:color=0x{bg}',
        f'fade=t=out:st=4.8:d=0.2:color=0x{bg}',
        'format=yuv420p',
    ])
    graph = ';'.join(filters) + ',' + chain + '[out]'
    print(f'Rendering {index+1}/{len(SCENES)}: {label}', flush=True)
    run(['ffmpeg','-hide_banner','-loglevel','error','-y','-f','lavfi','-i',f'color=c=0x{bg}:s=1920x1080:r={FPS}:d={DURATION}',
         '-loop','1','-framerate',str(FPS),'-i',str(ROOT/'docs'/'images'/f'{shot}-hd.jpg'),
         '-filter_complex',graph,'-map','[out]','-t',str(DURATION),'-c:v','libx264','-preset','fast','-crf','18','-threads','2',f'scene-{index:02d}.mp4'])

# Original quiet electronic score: four warm chord colors and a restrained pulse.
seconds = len(SCENES)*DURATION
rate = 44100
with wave.open(str(CACHE/'score.wav'),'wb') as wav:
    wav.setnchannels(1); wav.setsampwidth(2); wav.setframerate(rate)
    chords = [(130.81,164.81,196.00),(110.00,130.81,164.81),(87.31,110.00,130.81),(98.00,123.47,146.83)]
    for sec in range(seconds):
        block = bytearray()
        for n in range(rate):
            t=sec+n/rate; chord=chords[int(t/5)%4]; beat=t%0.5
            pad=sum(math.sin(2*math.pi*f*t) for f in chord)*0.025
            pulse=math.sin(2*math.pi*(58*beat+0.8*(1-math.exp(-beat*30))))*math.exp(-beat*22)*0.09
            bell=math.sin(2*math.pi*chord[int(t*2)%3]*4*t)*math.exp(-beat*9)*0.018
            fade=min(1,t/2,(seconds-t)/3)
            block.extend(struct.pack('<h',int((pad+pulse+bell)*max(0,fade)*32767)))
        wav.writeframes(block)
(CACHE/'concat.txt').write_text('\n'.join(f"file 'scene-{i:02d}.mp4'" for i in range(len(SCENES))),encoding='utf-8')
run(['ffmpeg','-hide_banner','-loglevel','error','-y','-f','concat','-safe','0','-i','concat.txt','-i','score.wav','-c:v','copy','-c:a','aac','-b:a','160k','-shortest','-movflags','+faststart',str(OUT/'tally-feature-tour.mp4')])
run(['ffmpeg','-hide_banner','-loglevel','error','-y','-ss','1','-i',str(OUT/'tally-feature-tour.mp4'),'-frames:v','1','-update','1',str(OUT/'tally-feature-tour-poster.jpg')])
print(f'Done: {OUT / "tally-feature-tour.mp4"}',flush=True)
