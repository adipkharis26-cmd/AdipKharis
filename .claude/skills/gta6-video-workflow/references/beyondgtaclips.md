# beyondgtaclips — install, commands, and what to harvest

The clip-finding engine for stage 5. Source: `https://github.com/beyondtahir/beyondgtaclips`
(upstream repo name — do not rewrite this URL, it is the real location).

## Where it runs

On the user's own computer only. It drives `yt-dlp` against youtube.com and needs ffmpeg,
so a hosted cloud sandbox cannot run it: proxies there block youtube.com and yt-dlp is not
installed. Reach the user's machine by shell if one is available, otherwise by computer use
(open a terminal, type, read output from screenshots), otherwise hand over the commands.

## Install

Clone into the assistant's skills folder:

```
git clone --depth 1 https://github.com/beyondtahir/beyondgtaclips ~/.claude/skills/beyondgtaclips
```

Then `bgc setup` and wait for **READY**. It builds a private Python env in
`~/.beyondgtaclips` and downloads Whisper models (~220 MB) plus a face model.

Prerequisites:

- macOS: `brew install ffmpeg deno`
- Windows: `winget install Gyan.FFmpeg` and `winget install DenoLand.Deno`
- Linux/WSL: `sudo apt install -y python3 python3-venv python3-pip ffmpeg git fonts-dejavu fonts-noto-core fonts-noto-color-emoji`

**Ask before installing anything on the user's machine.** Name exactly what it is and what
it's for, and offer to let them run it themselves.

### Windows Smart App Control

If setup or any command reports that Windows blocked a file, never suggest turning off Smart
App Control or any other protection, and never try to work around it. Two supported routes,
both keeping protections on:

1. `bgc setup --system-python` — uses the user's own Python.
2. WSL — Microsoft-signed, runs the Linux build inside Windows. See the repo's `WINDOWS.md`.

If the machine is managed by an employer or school that blocks WSL, tell the user to ask their
IT team rather than routing around the policy.

## Commands

`bgc` expands to:

- Windows: `python "SKILL_DIR\scripts\beyondgtaclips.py"` (or `py`)
- macOS/Linux/WSL: `python3 "SKILL_DIR/scripts/beyondgtaclips.py"`

| Command | Purpose |
|---|---|
| `bgc doctor` | What's installed, which AI will pick moments |
| `bgc setup` | One-time environment build |
| `bgc styles` | Print the five edit styles |
| `bgc find --within 48h --count 6` | Rank streams worth clipping now |
| `bgc clip --pick 1,3 --total 4 --styles 1` | Cut clips from chosen streams |
| `bgc remake "<folder>" --clip 2 --hook "..."` | Re-render a clip without re-downloading |

Useful flags on `clip`: `--focus "police chases"` to steer moment selection, `--length long`
for 60-90 s story clips, `--section 1:30:00-3:00:00` to limit to part of a stream,
`--topic "<game>"` for anything other than GTA 6, `--brain agent` to pick moments yourself.

## How `find` ranks

Roughly 13 searches across every spelling of the topic (GTA 6, GTA VI, GTA6) crossed with the
words stream titles actually use, plus a live-now search, merged and de-duplicated. Drops
shorts, compilations, re-uploads, trailers, reviews, upcoming streams, anything too short or
too old, and streams already clipped. Checks spoken language. Then ranks by HEAT: views per
hour blended with total views, with boosts for streams live right now and for strong like
ratios — so a 2-hour-old stream at 3K views/hour outranks yesterday's 800K. Still-live
streams are listed separately and can be clipped once they end. Every result states why it
ranked where it did.

## What `clip` does per stream

1. Scans YouTube preview frames across the whole stream to find where the game is played,
   skipping waiting rooms, menus and just-chatting stretches.
2. Downloads audio only; measures loudness and chat activity; transcribes the 10 hottest
   gameplay stretches.
3. AI picks the best moments (funny, shocking, chaos, discoveries) and writes a hook each.
4. Downloads only those seconds of video with padding on both sides, then runs the story
   check: re-cuts each moment so it tells one whole story — starting 3-10 s before the
   unexpected thing, ending just after the reaction. Rewrites hooks that claim something not
   on screen; drops moments with nothing worth posting and promotes a backup.
5. Verifies the clip is real gameplay, then renders the chosen styles in 9:16.

Output lands in `~/BeyondGTAClips/<date>/<topic>/<creator>__<title>/`.

## What to harvest for this pipeline

This is the critical difference from using the repo as a standalone clipper.

| Need | File | Why |
|---|---|---|
| Long-form 16:9 | `<clips_dir>/<key>.src.mp4` | Raw downloaded source segment, kept on disk with ~14 s lead and ~10 s tail. Unstyled, full-frame. The only usable input for a footage-led 16:9 edit. |
| Shorts 9:16 | `<name>__<style>.mp4` | Finished vertical render with hook text and captions baked in. Use as-is; never re-caption. |
| Quality check | `checks/<clip>__<style>.jpg` | Three frames per clip. Look at these before trusting any clip in an edit. |
| Posting copy | `POSTING.md` in the run folder | Caption, hashtags, two A/B hooks, trending-sound tip per clip. |

The rendered 9:16 styles are wrong for long-form: they are 1080x1920 with a hook card and
burnt-in captions. Reach for `.src.mp4` instead.

## The five styles (Shorts only)

All 1080x1920. `1 hookcard` (default — story sentence on black up top with action words in
bold red, gameplay centre, red captions under), `2 stack` (facecam box on top, full 16:9
stream below; needs a facecam or falls back to hookcard), `3 bubble` (full-screen gameplay,
round facecam bubble, two-word pop captions), `4 cinematic` (blurred backdrop, slow push-in,
quiet subtitles), `5 news` (BREAKING tag, condensed headline, scrolling red ticker).

Hook text convention: `*stars*` render as bold red words; at most one emoji, at the end.

## Fair play

No logins, no cookies, no API keys — the repo's `SECURITY.md` lists what it touches. Footage
belongs to the streamers who recorded it: credit them on screen at first use and in the
description, keep clips short and transformative, and respect each campaign program's own
rules about reuse. Wholesale re-uploads get claimed.
