"""Align a script to a VO file using pause detection + syllable counts.

Usage: python3 align.py <vo.mp3> <script.txt> <out.json>
Writes [{"w": word, "s": start, "e": end, "sec": section_index}, ...]
"""
import json, re, subprocess, sys

vo, script_path, out = sys.argv[1:4]

dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', vo],
                           capture_output=True, text=True).stdout)
log = subprocess.run(['ffmpeg', '-hide_banner', '-i', vo, '-af', 'silencedetect=noise=-35dB:d=0.3', '-f', 'null', '-'],
                     capture_output=True, text=True).stderr
starts = [float(x) for x in re.findall(r'silence_start: ([\d.]+)', log)]
ends = [float(x) for x in re.findall(r'silence_end: ([\d.]+)', log)]
islands, cur = [], 0.0
for s, e in zip(starts, ends):
    if s - cur > 0.05:
        islands.append((cur, s))
    cur = e
if dur - cur > 0.05:
    islands.append((cur, dur))

sections = [p.strip() for p in open(script_path, encoding='utf-8').read().split('\n\n') if p.strip()]
phrases = []  # (words, section)
for si, sec in enumerate(sections):
    for chunk in re.split(r'(?<=[.,?!…:])\s+', sec):
        if chunk.strip():
            phrases.append((chunk.split(), si))


def syl(word):
    w = re.sub(r'[^a-z]', '', word.lower())
    w = re.sub(r'(ai|au|oi|ng|ny)', lambda m: 'a' if m.group(0) in ('ai', 'au', 'oi') else 'n', w)
    return max(1, len(re.findall(r'[aiueo]', w)))


psyl = [sum(syl(w) for w in ws) for ws, _ in phrases]
n, m = len(phrases), len(islands)
rate = sum(psyl) / sum(e - s for s, e in islands)

import math
INF = float('inf')
# dp[i][j]: best cost placing first i phrases into first j islands (each island >= 1 phrase)
for _ in range(3):
    dp = [[INF] * (m + 1) for _ in range(n + 1)]
    bk = [[0] * (m + 1) for _ in range(n + 1)]
    dp[0][0] = 0
    for j in range(1, m + 1):
        d = islands[j - 1][1] - islands[j - 1][0]
        for i in range(1, n + 1):
            acc = 0
            for k in range(i, 0, -1):
                acc += psyl[k - 1]
                if dp[k - 1][j - 1] < INF:
                    c = dp[k - 1][j - 1] + math.log(d * rate / acc) ** 2
                    if c < dp[i][j]:
                        dp[i][j], bk[i][j] = c, k - 1
    groups, i = [], n
    for j in range(m, 0, -1):
        k = bk[i][j]; groups.append((k, i)); i = k
    groups.reverse()
    rate = sum(sum(psyl[a:b]) for a, b in groups) / sum(e - s for s, e in islands)

words, report = [], []
for (a, b), (s, e) in zip(groups, islands):
    ws = [(x, ph[1]) for ph in phrases[a:b] for x in ph[0]]
    tot = sum(syl(w) + 0.6 for w, _ in ws)
    t = s
    for w, sec in ws:
        d = (syl(w) + 0.6) / tot * (e - s)
        words.append({'w': w, 's': round(t, 3), 'e': round(t + d, 3), 'sec': sec}); t += d
    sy = sum(psyl[a:b])
    report.append(f'{s:6.2f}-{e:6.2f}  {sy / (e - s):4.1f} syl/s  ' + ' '.join(w for w, _ in ws))
json.dump({'duration': dur, 'words': words}, open(out, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(f'islands={m} phrases={n} rate={rate:.2f} syl/s')
print('\n'.join(report))
