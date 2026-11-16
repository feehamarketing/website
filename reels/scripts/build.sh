#!/usr/bin/env bash
# Builds a reel end to end:
#   ./scripts/build.sh configs/feeha.json voice.mp3 [output name]  -> final MP4
#   WORDS=words.json ./scripts/build.sh configs/x.json voice.mp3   -> exact word
#        timings from a transcript (scripts/words-from-transcript.py)
#   ./scripts/build.sh configs/feeha.json "" preview               -> music only,
#        estimated caption timings (layout / pipeline test)
set -euo pipefail
cd "$(dirname "$0")/.."
CFG="$1"
VOICE="${2:-}"
ID=$(node -p "require('./$CFG').id")
COMP=$(node -p "require('./$CFG').composition")
NAME="${3:-$ID}"
mkdir -p out/tmp

if [ -n "$VOICE" ] && [ -n "${WORDS:-}" ]; then
  node scripts/align.mjs "$CFG" "$VOICE" "$WORDS"
elif [ -n "$VOICE" ]; then
  # Exact word timings when the script is English and PocketSphinx is
  # installed (pip install pocketsphinx); otherwise timings from the pauses.
  if python3 scripts/forced-align.py "$CFG" "$VOICE" "out/tmp/$ID-words.json" >/dev/null 2>&1; then
    node scripts/align.mjs "$CFG" "$VOICE" "out/tmp/$ID-words.json"
  else
    echo "forced alignment unavailable: using pause-based timings"
    node scripts/align.mjs "$CFG" "$VOICE"
  fi
else
  node scripts/align.mjs "$CFG" --draft
fi
TL=$(node -p "require('./$CFG').timeline")
DUR=$(node -p "const t=require('./$TL'); t.totalFrames/t.fps")
node scripts/make-audio.mjs "$CFG"

M=out/tmp/$ID-music.wav
S=out/tmp/$ID-sfx.wav
if [ -n "$VOICE" ]; then
  # Voice on top; the music ducks under it (sidechain), then the whole mix is
  # normalised to -14 LUFS, the loudness Instagram targets.
  ffmpeg -v error -y -i "$VOICE" -i "$M" -i "$S" -filter_complex "
    [0:a]aresample=44100,highpass=f=70,acompressor=threshold=-18dB:ratio=3:attack=5:release=120:makeup=2,apad,atrim=0:$DUR,asplit=2[v][key];
    [1:a]volume=0.5[m];
    [m][key]sidechaincompress=threshold=0.03:ratio=6:attack=15:release=350[duck];
    [2:a]volume=0.55[s];
    [v][duck][s]amix=inputs=3:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11,atrim=0:$DUR[out]" \
    -map "[out]" -ar 48000 -ac 2 "public/$ID-mix.wav"
else
  ffmpeg -v error -y -i "$M" -i "$S" -filter_complex \
    "[0:a]volume=0.8[m];[1:a]volume=0.55[s];[m][s]amix=inputs=2:normalize=0,loudnorm=I=-14:TP=-1.5,atrim=0:$DUR[out]" \
    -map "[out]" -ar 48000 -ac 2 "public/$ID-mix.wav"
fi

npx remotion render src/index.ts "$COMP" "out/$NAME.mp4" \
  --codec=h264 --crf=17 --pixel-format=yuv420p --color-space=bt709 \
  --audio-codec=aac --audio-bitrate=256k --concurrency=4 --log=error
ffprobe -v error -show_entries stream=codec_name,width,height,r_frame_rate,pix_fmt,sample_rate,channels:format=duration,size -of default=nw=1 "out/$NAME.mp4"
