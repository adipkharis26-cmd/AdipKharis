#!/usr/bin/env python3
"""Generate the Mas Kharis voice over with ElevenLabs, with word timestamps.

Usage:  python3 video/src/tts_elevenlabs.py ep03 [--voice VOICE_ID] [--from N]

--from N  regenerate only sections N.. (1-based) and keep the existing audio and
          timestamps of the earlier sections (so approved parts do not change).

Reads   video/vo/<ep>.txt  (one paragraph per script section, blank line between)
Writes  video/vo/<ep>.mp3, <ep>.json, <ep>-words.js  in the same format align.py
        produces, so story.js / voCaption work unchanged.

Each section is synthesized separately (with previous/next text for natural
prosody) and joined with a fixed pause, so section boundaries are exact.

API key: ELEVENLABS_API_KEY if set; otherwise a placeholder is sent and the
cloud session's network proxy injects the key saved for api.elevenlabs.io.
Voice/model settings: workflow/config.json -> "elevenlabs", overridden per channel by
channels.<id>.elevenlabs (channel picked from the episode prefix, e.g. ep03 -> mas-kharis,
tl01 -> ternyata-leluhur, or --channel ID).
"""
import base64, json, os, re, subprocess, sys, tempfile, wave
from pathlib import Path

import requests

ROOT = Path(__file__).resolve().parents[2]
VO_DIR = ROOT / 'video' / 'vo'
_CONF = json.loads((ROOT / 'workflow' / 'config.json').read_text(encoding='utf-8'))
CFG = dict(_CONF['elevenlabs'])


def use_channel(ep, channel=None):
    """Merge the channel's own ElevenLabs settings (voice etc.) over the defaults."""
    chans = _CONF.get('channels', {})
    if not channel:
        hits = [k for k, v in chans.items() if v.get('prefix') and re.fullmatch(re.escape(v['prefix']) + r'\d+', ep)]
        channel = hits[0] if hits else None
    if channel:
        if chans[channel].get('suara_menunggu'):
            sys.exit(f"Suara ElevenLabs untuk channel '{channel}' belum diisi owner (config.channels.{channel}.suara_menunggu). Set status butuh-vo.")
        CFG.update(chans[channel].get('elevenlabs', {}))
    return channel


def ffprobe_dur(p):
    out = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', str(p)],
                         capture_output=True, text=True, check=True).stdout
    return float(out.strip())


def tts(text, prev_text, next_text, voice):
    url = f'https://api.elevenlabs.io/v1/text-to-speech/{voice}/with-timestamps'
    body = {
        'text': text,
        'model_id': CFG.get('model_id', 'eleven_multilingual_v2'),
        'voice_settings': CFG.get('voice_settings', {}),
    }
    if prev_text: body['previous_text'] = prev_text
    if next_text: body['next_text'] = next_text
    if CFG.get('language_code'): body['language_code'] = CFG['language_code']
    key = os.environ.get('ELEVENLABS_API_KEY', 'proxy-injected')
    r = requests.post(url, params={'output_format': 'mp3_44100_128'}, json=body,
                      headers={'xi-api-key': key, 'Content-Type': 'application/json'}, timeout=180)
    if r.status_code != 200:
        sys.exit(f'ElevenLabs error {r.status_code}: {r.text[:400]}')
    return r.json()


def tighten(wav, max_pause, lead=0.05, tail=0.12):
    """Shorten every silence longer than max_pause (and trim lead/tail silence).
    Rewrites wav in place; returns a function mapping old time -> new time."""
    log = subprocess.run(['ffmpeg', '-i', str(wav), '-af', 'silencedetect=n=-38dB:d=0.2', '-f', 'null', '-'],
                         capture_output=True, text=True).stderr
    starts = [float(x) for x in re.findall(r'silence_start: ([\d.]+)', log)]
    ends = [float(x) for x in re.findall(r'silence_end: ([\d.]+)', log)]
    with wave.open(str(wav), 'rb') as w:
        par = w.getparams(); data = w.readframes(par.nframes)
    sr, bpf, dur = par.framerate, par.sampwidth * par.nchannels, par.nframes / par.framerate
    cuts = []  # (cut_start, cut_end) in seconds
    for a, b in zip(starts, ends + [dur] * (len(starts) - len(ends))):
        if a <= 0.01:  cuts.append((0.0, max(0.0, b - lead)))
        elif b >= dur - 0.01: cuts.append((a + tail, dur))
        elif b - a > max_pause: cuts.append((a + max_pause / 2, b - max_pause / 2))
    cuts = [(a, b) for a, b in cuts if b > a]
    out, pos = bytearray(), 0.0
    for a, b in cuts:
        out += data[int(pos * sr) * bpf:int(a * sr) * bpf]; pos = b
    out += data[int(pos * sr) * bpf:]
    with wave.open(str(wav), 'wb') as w:
        w.setparams(par); w.writeframes(bytes(out))
    def remap(t):
        shift = 0.0
        for a, b in cuts:
            if t >= b: shift += b - a
            elif t > a: return a - shift
        return t - shift
    return remap


def smooth_pauses(wav, max_pause, xf=0.06, lead=0.04, tail=0.35):
    """Like tighten(), but natural: long pauses are shortened with an equal-power crossfade
    (breath / room tone fades instead of a hard cut), and the take ends with a gentle fade-out.
    Rewrites wav in place; returns a function mapping old time -> new time."""
    import numpy as np
    log = subprocess.run(['ffmpeg', '-i', str(wav), '-af', 'silencedetect=n=-42dB:d=0.25', '-f', 'null', '-'],
                         capture_output=True, text=True).stderr
    starts = [float(x) for x in re.findall(r'silence_start: ([\d.]+)', log)]
    ends = [float(x) for x in re.findall(r'silence_end: ([\d.]+)', log)]
    with wave.open(str(wav), 'rb') as w:
        par = w.getparams(); x = np.frombuffer(w.readframes(par.nframes), dtype=np.int16).astype(np.float32)
    sr = par.framerate; dur = len(x) / sr
    cuts = []
    for a, b in zip(starts, ends + [dur] * (len(starts) - len(ends))):
        if a <= 0.01: cuts.append((0.0, max(0.0, b - lead)))
        elif b >= dur - 0.01: cuts.append((min(dur, a + tail), dur))
        elif b - a > max_pause: cuts.append((a + max_pause / 2, b - max_pause / 2))
    cuts = [(a, b) for a, b in cuts if b - a > 0.02]
    n = int(xf * sr); fade_in = np.sqrt(np.linspace(0, 1, n)); fade_out = fade_in[::-1]
    out, pos = np.zeros(0, np.float32), 0
    for a, b in cuts:
        ia, ib = int(a * sr), int(b * sr)
        seg = x[pos:ia]
        if ia == 0 or ib >= len(x) or len(out) == 0 and pos == 0 and ia == 0:
            out = np.concatenate([out, seg]); pos = ib; continue
        out = np.concatenate([out, seg])
        if len(out) >= n and ib + n <= len(x):           # crossfade the end of the kept part into what follows the cut
            out[-n:] = out[-n:] * fade_out + x[ib:ib + n] * fade_in
            pos = ib + n
        else:
            pos = ib
    out = np.concatenate([out, x[pos:]])
    m = min(len(out), int(0.25 * sr)); out[-m:] *= np.linspace(1, 0, m) ** 2      # soft tail
    m = min(len(out), int(0.02 * sr)); out[:m] *= np.linspace(0, 1, m)            # no click at the start
    with wave.open(str(wav), 'wb') as w:
        w.setparams(par); w.writeframes(np.clip(out, -32768, 32767).astype(np.int16).tobytes())
    def remap(t):
        shift = 0.0
        for a, b in cuts:
            if t >= b: shift += (b - a) + (xf if 0 < a and b < dur else 0)
            elif t > a: return a - shift
        return t - shift
    return remap


def words_from_alignment(al, offset, sec, remap=lambda t: t):
    chars, st, en = al['characters'], al['character_start_times_seconds'], al['character_end_times_seconds']
    out, cur, s0, e0 = [], '', None, None
    for c, s, e in zip(chars, st, en):
        if c.isspace():
            if cur: out.append({'w': cur, 's': round(offset + remap(s0), 3), 'e': round(offset + remap(e0), 3), 'sec': sec})
            cur = ''
            continue
        if not cur: s0 = s
        cur += c; e0 = e
    if cur: out.append({'w': cur, 's': round(offset + remap(s0), 3), 'e': round(offset + remap(e0), 3), 'sec': sec})
    return out


def main():
    args = sys.argv[1:]
    if not args: sys.exit(__doc__)
    ep = args[0]
    ch = use_channel(ep, args[args.index('--channel') + 1] if '--channel' in args else None)
    print(f'channel={ch} voice={CFG.get("voice_name", CFG.get("voice_id"))}')
    voice = args[args.index('--voice') + 1] if '--voice' in args else CFG.get('voice_id')
    if not voice or voice.startswith('ISI_'):
        sys.exit('Voice ID belum diisi: set workflow/config.json -> elevenlabs.voice_id atau pakai --voice')
    gap = float(CFG.get('section_gap_s', 0.8))
    secs = [p.strip().replace('\n', ' ') for p in (VO_DIR / f'{ep}.txt').read_text(encoding='utf-8').split('\n\n') if p.strip()]

    tmp = Path(tempfile.mkdtemp(prefix=f'tts_{ep}_'))
    silence = tmp / 'gap.wav'
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=mono',
                    '-t', str(gap), silence], check=True)
    words, parts, offset, first = [], [], 0.0, 0
    if '--from' in args:
        first = int(args[args.index('--from') + 1]) - 1
        old = json.loads((VO_DIR / f'{ep}.json').read_text(encoding='utf-8'))
        words = [w for w in old['words'] if w['sec'] < first]
        cut = min(w['s'] for w in old['words'] if w['sec'] == first) - 0.05  # keeps the gap before it
        head = tmp / 'head.wav'
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', VO_DIR / f'{ep}.mp3', '-t', f'{cut:.3f}',
                        '-ar', '44100', '-ac', '1', head], check=True)
        parts, offset = [head], ffprobe_dur(head)
    if CFG.get('satu_tarikan') and not first:
        # one continuous take: the whole script in a single request (natural breath & tone between
        # paragraphs), words assigned to sections by count; long pauses smoothed with crossfades
        print(f'[1 tarikan] {len(secs)} bagian...')
        res = tts('\n\n'.join(secs), '', '', voice)
        mp3 = tmp / 'all.mp3'; wav = tmp / 'all.wav'
        mp3.write_bytes(base64.b64decode(res['audio_base64']))
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', mp3, '-ar', '44100', '-ac', '1', wav], check=True)
        remap = smooth_pauses(wav, float(CFG.get('max_pause_s', 0.6)))
        ws = words_from_alignment(res['alignment'], 0.0, 0, remap)
        counts = [len(t.split()) for t in secs]; k = 0
        for i, c in enumerate(counts):
            for w in ws[k:k + c]: w['sec'] = i
            k += c
        words = ws; parts = [wav]
        secs = []   # done
    for i, text in enumerate(secs):
        if i < first: continue
        print(f'[{i + 1}/{len(secs)}] {text[:60]}...')
        res = tts(text, secs[i - 1] if i else '', secs[i + 1] if i + 1 < len(secs) else '', voice)
        mp3 = tmp / f's{i}.mp3'; wav = tmp / f's{i}.wav'
        mp3.write_bytes(base64.b64decode(res['audio_base64']))
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', mp3, '-ar', '44100', '-ac', '1', wav], check=True)
        mp = float(CFG.get('max_pause_s', 0))
        remap = tighten(wav, mp) if mp > 0 else (lambda t: t)
        words += words_from_alignment(res['alignment'], offset, i, remap)
        dur = ffprobe_dur(wav)
        parts.append(wav)
        offset += dur
        if i + 1 < len(secs):
            parts.append(silence); offset += gap

    lst = tmp / 'list.txt'
    lst.write_text(''.join(f"file '{p}'\n" for p in parts))
    out_mp3 = VO_DIR / f'{ep}.mp3'
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', lst,
                    '-c:a', 'libmp3lame', '-b:a', '192k', out_mp3], check=True)
    dur = ffprobe_dur(out_mp3)
    data = {'duration': dur, 'words': words}
    (VO_DIR / f'{ep}.json').write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding='utf-8')
    (VO_DIR / f'{ep}-words.js').write_text('const VO = ' + json.dumps(data, ensure_ascii=False) + ';\n', encoding='utf-8')
    print(f'OK {out_mp3.relative_to(ROOT)}  {dur:.1f}s  {len(words)} kata')


if __name__ == '__main__':
    main()
