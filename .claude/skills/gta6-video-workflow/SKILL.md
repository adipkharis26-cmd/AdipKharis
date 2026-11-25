---
name: gta6-video-workflow
description: AiLockuo's end-to-end GTA 6 video pipeline. Use when the user wants to make a GTA 6 video, pastes a GTA 6 master topic prompt, asks for GTA 6 video ideas or a GTA 6 script, has a voiceover ready for a GTA 6 video, or says "make a GTA 6 video", "run the GTA workflow", "find clips for my script". Runs seven stages: topic ideas, topic lock, researched script with a shot list, voiceover handoff, stream clips found via the beyondgtaclips repo, footage-led edit with animation overlay, delivery as long-form 16:9 and optional 9:16 Shorts.
---

# GTA 6 video workflow

Seven stages, run in order. The user owns stages 2 and 4 (topic choice, voiceover);
everything else is yours. Announce which stage you're entering, keep a task list, and never
skip ahead — a script written before the topic is locked gets thrown away.

**House style, fixed for every video:** footage-led. Real GTA 6 stream footage carries the
video; animation is an overlay on top of it — captions, arrows, zooms, labels, stat callouts,
lower thirds. Never full-screen motion-graphics scenes with no gameplay under them.

**Ask the format at the start of every run.** Long-form 16:9, Shorts 9:16, or both. Don't
assume, don't carry over the last run's answer. If both, the long-form master is built first
and the Shorts are cut from it.

## Hard content rules (apply at every stage)

- Never invent GTA 6 features, mechanics, locations or gameplay details and present them as
  confirmed. The game launched 19 Nov 2026; much is still undocumented.
- Label anything resting on an unconfirmed feature or an unverified rumour, in the idea list,
  in the script, and on screen.
- Never fabricate footage, or describe on-screen action that isn't in the clip you have.
- Verify factual claims by search before they enter a script. Numbers from launch-week press
  coverage conflict with each other — attribute them and treat them as approximate.
- Credit every streamer whose footage appears: on screen at first use and in the description.

## Stage 1 — Ideas

The user pastes their master topic prompt. Follow it as written. If they don't paste one, use
the stored default in `references/master-prompts.md`. Before generating, research:
search what is currently ranking for the topic area, which angles are already saturated, and
what launch-week coverage has established as fact. Ideas must be grounded in what the game
actually does, not in what would make a good thumbnail.

Deliver in the user's required format, per idea: video concept, suggested YouTube title,
thumbnail concept, viral potential 1-10, production difficulty. At least 30 ideas, then the
10 strongest ranked by overall view potential.

Add one line per idea the prompt doesn't ask for but this pipeline needs: **footage
feasibility** — whether the idea can actually be cut from existing stream footage, needs the
user's own capture, or works on animation overlay alone. An idea with no footage path is dead
weight however high it scores, so say so.

## Stage 2 — Topic lock (user)

User picks one. Confirm it back in a line before moving on.

## Stage 3 — Script

Ask the format question now if it hasn't been asked. Then research the specific topic
properly — searches on the actual claims the script will make, not just the topic name.

Follow the user's master script prompt as written (stored default in
`references/master-prompts.md`): hook in the first 5-15 seconds, no "hey
guys welcome back", staged escalation, curiosity gaps, natural spoken English, satisfying
payoff, 130-150 words per minute matched to the requested duration, no filler.

Output per section: `[Timestamp – Section Name]`, then `NARRATION:` (voiceover text ready to
record) and `VISUAL SUGGESTIONS:`. Close with total word count, estimated duration, three
alternative titles, one thumbnail concept.

Then add the handoff this pipeline needs — a **shot list** keyed to the script's sections:
for each beat, what footage it wants (chase, NPC reaction, crash, discovery, streamer
reaction), how long, and whether it's clip or overlay-only. Stage 5 searches against this
list, so write it in the words a stream transcript would use.

Deliver the script as a doc so the user can edit it while recording.

## Stage 4 — Voiceover (user)

User records and uploads the audio. Confirm duration against the script's estimate; if it's
more than ~15% off, flag it before editing, because every animation timing derives from it.
Transcribe the audio and align it to the script to get real word timings — the edit cuts to
the delivered read, not the written estimate.

## Stage 5 — Find and cut the clips

The clips come from the beyondgtaclips repo, which runs **on the user's own computer**. It
cannot run in a cloud sandbox: it drives `yt-dlp` against youtube.com, which sandbox proxies
block, and yt-dlp isn't installed there. Drive it on the user's machine instead:

- **Shell available** (a device bash tool): run the commands directly.
- **No shell** (desktop bridge only, the usual case on Windows): use computer use. Open
  Windows Terminal, type the commands, read the output from screenshots. Slower but reliable.
- **Neither**: give the user the exact commands, have them paste the output back.

Install location and setup details are in `references/beyondgtaclips.md`. Read it before the
first run on a machine.

Commands (`bgc` = `python "SKILL_DIR\scripts\beyondgtaclips.py"` on Windows,
`python3 "SKILL_DIR/scripts/beyondgtaclips.py"` elsewhere):

1. `bgc doctor` — check the install. First time on a machine, `bgc setup` and wait for READY.
   Setup needs ffmpeg and Deno plus ~220 MB of Whisper models. **Ask before installing
   anything**, say exactly what it is, and let the user run the installer themselves if they
   prefer. On Windows, if anything reports being blocked, never suggest weakening Smart App
   Control — follow the repo's `WINDOWS.md` (its own Python, or the WSL route).
2. `bgc find --within 48h --count 6` — ranks streams by HEAT: views per hour blended with
   total views, boosted for live-now and strong like ratios, with compilations, re-uploads,
   trailers, shorts and already-clipped streams dropped. Show the user the ranked list
   (creator, title, views, age) and let them pick, or take the top ones and say which.
3. `bgc clip --pick <n,n> --total <n> --styles 1 --focus "<from the shot list>"` — use
   `--focus` to steer moment-picking toward the beats the script actually needs. Allow
   10-20 minutes per stream; run it in the background and report each stage as it passes
   (looking at the stream, listening, picking moments, cutting).

**Harvest the right files.** This differs from normal clipping use:

- **Long-form 16:9** → the raw source segments, `<clips_dir>/<key>.src.mp4`. The repo keeps
  them, with ~14 s of lead and ~10 s of tail around each moment. Unstyled, full-frame, no
  baked hook card — exactly what a footage-led edit needs.
- **Shorts 9:16** → the rendered styled clips, `<name>__<style>.mp4`. Hook text and captions
  are already baked in; don't re-add them.
- Check `checks/<clip>__<style>.jpg` (3 frames per clip) before trusting any clip. If a hook
  misdescribes what's on screen, `bgc remake "<folder>" --clip <n> --hook "..."` fixes it
  without re-downloading.

Stage the harvested files into the working sandbox for editing. That needs the output folder
(`~/BeyondGTAClips` / `C:\Users\<name>\BeyondGTAClips`) connected to the session — request it
once, with a reason, and reuse it on later runs.

If a beat on the shot list has no usable clip, say so rather than substituting a moment that
doesn't match the narration. Options: the user captures it themselves, or the beat becomes
overlay-only.

## Stage 6 — Edit

Build the edit against the voiceover's real word timings. Footage under narration throughout;
overlay animation on top:

- Captions styled consistently, kept out of platform UI zones.
- Arrows, circles and zoom-ins to point at what the narration is describing, timed to land
  on the word, not near it.
- Labels and lower thirds for streamer credit at first appearance.
- Stat callouts and comparison graphics where the script cites numbers, with the source named
  on screen.
- Transitions that match the script's section breaks.

Don't let the overlay cover the action it's pointing at. Don't hold a clip past its moment to
fill narration — cut to another angle or let the overlay carry the gap.

For Shorts, cut from the strongest 3-5 beats of the long-form master: vertical reframe on the
action, hook text in the first second, hard cut in on the moment with no runway.

## Stage 7 — Deliver

Render the 16:9 master, plus any Shorts. Send the files, and write them back to the user's
folder if one is connected. With them:

- Final title (plus the two alternates), thumbnail concept, description with streamer credits
  and source links.
- Any claim in the script that rests on an unconfirmed feature, listed plainly so the user
  knows what they're publishing.
- Which script beats ended up overlay-only for lack of footage.

Then offer the next run, not a summary of this one.
