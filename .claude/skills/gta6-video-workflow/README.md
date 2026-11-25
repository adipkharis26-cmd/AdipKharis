# GTA 6 Video Workflow

AiLockuo's end-to-end pipeline for making GTA 6 videos: ideas → script → your voiceover →
real stream clips → footage-led edit → finished video.

## What it does

Seven stages. You own two of them.

| Stage | Who | What happens |
|---|---|---|
| 1. Ideas | Claude | Paste your master topic prompt. Claude researches what's ranking and what's saturated, then returns 30+ ideas in your format, plus a ranked top 10 — each with a footage-feasibility note. |
| 2. Topic lock | **You** | Pick one. |
| 3. Script | Claude | Researches the specific claims, writes the script to your master script prompt, and adds a shot list keyed to each narration beat. |
| 4. Voiceover | **You** | Record and upload the audio. Claude transcribes it for real word timings. |
| 5. Clips | Claude | Drives the beyondgtaclips engine on your computer to find the hottest recent GTA 6 streams and cut the moments your shot list asks for. |
| 6. Edit | Claude | Footage-led edit cut to your delivered read, with animation overlaid — captions, arrows, zooms, labels, stat callouts. |
| 7. Deliver | Claude | Renders the 16:9 master and any Shorts, with title, thumbnail concept and a description carrying streamer credits. |

Claude asks every run whether you want long-form, Shorts, or both.

## House style

Footage-led, always. Real gameplay carries the video; animation sits on top of it. No
full-screen motion-graphics scenes with nothing underneath.

## Setup

Stage 5 runs on your own computer — it needs YouTube access and ffmpeg, which cloud sandboxes
block. One-time setup:

1. Clone the clip engine:
   `git clone --depth 1 https://github.com/beyondtahir/beyondgtaclips ~/.claude/skills/beyondgtaclips`
2. Install prerequisites — ffmpeg and Deno. Claude will ask before installing anything.
3. Run its setup once and wait for READY (builds a private Python env, downloads ~220 MB of
   transcription models).
4. Connect your `BeyondGTAClips` output folder to the session so Claude can pull clips in for
   editing. One approval, reused after that.

On Windows, if anything reports being blocked by Smart App Control, the workflow uses the
supported routes — your own Python, or WSL — and never asks you to turn protections off.

Full details in `skills/gta6-video-workflow/references/beyondgtaclips.md`.

## Ground rules it enforces

- Never presents unconfirmed GTA 6 features as confirmed, and labels anything resting on a
  rumour — on screen and in the script.
- Never describes on-screen action that isn't in the clip.
- Verifies factual claims by search; attributes launch-week numbers, which still conflict
  between sources.
- Credits every streamer whose footage appears, on screen and in the description.
- If a script beat has no usable clip, it says so instead of substituting footage that doesn't
  match your narration.

## Note on naming

The clip engine is the upstream `beyondtahir/beyondgtaclips` repository. That URL is left
intact everywhere because it's the real location of the code — renaming it would break the
clone. AiLockuo branding applies to this plugin and workflow.

## Usage

Say "run the GTA workflow", or just paste your master topic prompt.
