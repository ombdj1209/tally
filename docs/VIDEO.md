# Tally feature film

[Watch or download the MP4](media/tally-feature-tour.mp4) · [Back to README](../README.md)

A 70-second promotional walkthrough using real app screenshots, animated entrances, editorial captions, solid cream/ink/lime backgrounds, and an original synthesized instrumental score. No narration or stock music is used.

## Delivery

- 1920 × 1080, 30 frames per second.
- H.264 video, AAC audio, MP4 with fast-start metadata.
- Fourteen five-second scenes.
- Captions are baked into the video so the feature story works with audio muted.
- Screens use sample data. This is an edited feature showcase, not a recording of live cloud AI or microphone performance.

## Storyboard

| Time | Story |
| --- | --- |
| 00:00 | Tally: less money admin, more living |
| 00:05 | Groups, people and shared plans |
| 00:10 | Expense entry and categorization |
| 00:15 | Equal, exact and percentage splits |
| 00:20 | Search, filters, details, editing and CSV export |
| 00:25 | Full/partial payment records and undo |
| 00:30 | Category and daily spending insights |
| 00:35 | Local helper and optional cloud assistant/receipt features |
| 00:40 | Draft review before saving |
| 00:45 | Personality and configurable browser voice |
| 00:50 | Themes and accents |
| 00:55 | Responsive desktop workspace |
| 01:00 | Optional private Supabase sync and setup boundaries |
| 01:05 | Repository call to action and MIT license |

## Rebuild

Install Python 3.10+ and FFmpeg, then run from the repository root:

```sh
python scripts/render-promo.py
```

The renderer uses Windows Arial fonts when present, or DejaVu Sans at the usual Linux path. It does not bundle those font files. Temporary clips, text files and generated audio stay in ignored `.cache/promo/`; final video and poster go to `docs/media/`. Edit `SCENES` in the script to change copy, shots, or scene order. If you change the scene count or duration, update the README and this storyboard.

The soundtrack is synthesized by the included script. Screenshots and video ship under the repository's MIT license; third-party fonts retain their own license terms.
