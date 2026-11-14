"""Exact word timings for an English voice-over whose text is known.

Forced alignment with PocketSphinx (pip install pocketsphinx; its US-English
model ships inside the package, nothing else is downloaded).

    python3 scripts/forced-align.py configs/feeha.json voice.mp3 out.json

Reads the on-screen script ("script") and the text that was spoken ("tts")
from the config, aligns the spoken words, then maps them back onto the
on-screen tokens (e.g. "feeha dot c a" -> "feeha.ca", "s e o" -> "SEO").
"""
import json
import re
import subprocess
import sys

from pocketsphinx import Decoder

cfg_path, voice, out_path = sys.argv[1:4]
cfg = json.load(open(cfg_path))

# Pronunciations missing from the bundled dictionary (CMU phone set).
EXTRA = {
    "feeha": "F IY HH AH",
}


def norm(w):
    w = w.lower().replace("é", "e")
    return re.sub(r"[^a-z0-9']", "", w)


display = [t for t in cfg["script"].split() if not re.fullmatch(r"[?!:;.,]+", t)]
spoken = [norm(w) for w in cfg["tts"].split() if norm(w)]

# Map each spoken word to the display token it belongs to, by walking both
# texts: a display token absorbs spoken words until their letters match.
owner = []
si = 0
for di, tok in enumerate(display):
    # letters of the token as spoken: "feeha.ca" -> "feehadotca"
    target = norm(tok.strip(".!?,:;").replace(".", "dot"))
    got = ""
    start = si
    while si < len(spoken) and len(got) < len(target):
        got += spoken[si]
        si += 1
    if got != target:
        sys.exit(f"cannot match display token {tok!r} with spoken {spoken[start:si]}")
    owner += [di] * (si - start)
if si != len(spoken):
    sys.exit("spoken text is longer than the on-screen script")

pcm = subprocess.run(
    ["ffmpeg", "-v", "error", "-i", voice, "-ac", "1", "-ar", "16000", "-f", "s16le", "-"],
    check=True,
    capture_output=True,
).stdout

dec = Decoder(samprate=16000, bestpath=False, loglevel="FATAL")
for w, ph in EXTRA.items():
    if dec.lookup_word(w) is None:
        dec.add_word(w, ph, True)
for w in set(spoken):
    if dec.lookup_word(w) is None:
        sys.exit(f"word not in dictionary, add it to EXTRA: {w}")
dec.set_align_text(" ".join(spoken))
dec.start_utt()
dec.process_raw(pcm, full_utt=True)
dec.end_utt()
segs = [s for s in dec.seg() if s.word not in ("<s>", "</s>", "<sil>") and not s.word.startswith("[")]
words_t = [(s.word.split("(")[0], s.start_frame / 100, (s.end_frame + 1) / 100) for s in segs]
if len(words_t) != len(spoken):
    sys.exit(f"alignment returned {len(words_t)} words for {len(spoken)} spoken words")

out = []
for di, tok in enumerate(display):
    idx = [k for k, o in enumerate(owner) if o == di]
    out.append({"text": tok, "start": round(words_t[idx[0]][1], 3), "end": round(words_t[idx[-1]][2], 3)})
json.dump(out, open(out_path, "w"), ensure_ascii=False, indent=1)
print(f"{len(out)} words aligned")
