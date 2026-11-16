"""Exact word timings from an ElevenLabs Scribe transcript.

    python3 scripts/words-from-transcript.py configs/vente.json transcript.json out.json

transcript.json is the word list from creative_transcribe_audio (`words`, or
the file at `words_download_url`): items with text/start/end (spacing items
are ignored). The on-screen script and the transcript are matched word by
word (difflib); script words the transcript wrote differently (numbers, the
web address) get times interpolated between their matched neighbours.
Output: the word list scripts/align.mjs takes as its third argument.
"""
import difflib
import json
import re
import sys
import unicodedata

cfg_path, tr_path, out_path = sys.argv[1:4]
cfg = json.load(open(cfg_path))
raw = json.load(open(tr_path))
if isinstance(raw, dict):
    raw = raw.get("words") or raw.get("transcripts", [{}])[0].get("words", [])
spoken = [w for w in raw if (w.get("type") in (None, "word")) and w.get("text", "").strip()]


def norm(t):
    t = unicodedata.normalize("NFD", t.lower())
    t = "".join(c for c in t if unicodedata.category(c) != "Mn")
    return re.sub(r"[^a-z0-9]", "", t)


# same tokenisation as align.mjs: split on any whitespace, glue lone punctuation
tokens = []
for t in re.split(r"\s+", cfg["script"].strip()):
    if re.fullmatch(r"[?!:;.,]+", t) and tokens:
        tokens[-1] += " " + t
    else:
        tokens.append(t)

a = [norm(t) for t in tokens]
b = [norm(w["text"]) for w in spoken]
times = [None] * len(tokens)
sm = difflib.SequenceMatcher(a=a, b=b, autojunk=False)
for blk in sm.get_matching_blocks():
    for k in range(blk.size):
        w = spoken[blk.b + k]
        times[blk.a + k] = (float(w["start"]), float(w["end"]))
# replaced/missing stretches: spread over the time between known neighbours
for op, i1, i2, j1, j2 in sm.get_opcodes():
    if op == "equal" or i1 == i2:
        continue
    if j1 < j2:
        t0, t1 = float(spoken[j1]["start"]), float(spoken[j2 - 1]["end"])
    else:
        t0 = times[i1 - 1][1] if i1 > 0 and times[i1 - 1] else 0.0
        t1 = times[i2][0] if i2 < len(times) and times[i2] else t0 + 0.3 * (i2 - i1)
    n = i2 - i1
    for k in range(n):
        times[i1 + k] = (t0 + (t1 - t0) * k / n, t0 + (t1 - t0) * (k + 1) / n)

matched = sum(1 for blk in sm.get_matching_blocks() for _ in range(blk.size))
out = [{"text": t, "start": round(s, 3), "end": round(e, 3)} for t, (s, e) in zip(tokens, times)]
json.dump(out, open(out_path, "w"), ensure_ascii=False, indent=1)
print(f"{len(tokens)} script words, {matched} matched exactly in the transcript")
