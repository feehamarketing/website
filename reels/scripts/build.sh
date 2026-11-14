#!/usr/bin/env bash
# Builds the reel end to end:  ./scripts/build.sh [voice file] [output name]
#   with a voice file -> word timings from the real audio, full mix, final MP4
#   without           -> draft timings and music only (pipeline test)
set -euo pipefail
cd "$(dirname "$0")/.."
VOICE="${1:-}"
NAME="${2:-reel}"
mkdir -p out/tmp

if [ -n "$VOICE" ]; then
  node scripts/align.mjs "$VOICE"
else
  node scripts/align.mjs --draft
fi
node scripts/make-audio.mjs

if [ -n "$VOICE" ]; then
  # Voice on top; the music ducks under it (sidechain), then the whole mix is
  # normalised to -14 LUFS, the loudness Instagram targets.
  ffmpeg -v error -y -i "$VOICE" -i out/tmp/music.wav -i out/tmp/sfx.wav -filter_complex "
    [0:a]aresample=44100,highpass=f=70,acompressor=threshold=-18dB:ratio=3:attack=5:release=120:makeup=2,apad,atrim=0:15,asplit=2[v][key];
    [1:a]volume=0.5[m];
    [m][key]sidechaincompress=threshold=0.03:ratio=6:attack=15:release=350[duck];
    [2:a]volume=0.55[s];
    [v][duck][s]amix=inputs=3:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11,atrim=0:15[out]" \
    -map "[out]" -ar 48000 -ac 2 public/mix.wav
else
  ffmpeg -v error -y -i out/tmp/music.wav -i out/tmp/sfx.wav -filter_complex \
    "[0:a]volume=0.8[m];[1:a]volume=0.55[s];[m][s]amix=inputs=2:normalize=0,loudnorm=I=-14:TP=-1.5,atrim=0:15[out]" \
    -map "[out]" -ar 48000 -ac 2 public/mix.wav
fi

npx remotion render src/index.ts Reel "out/$NAME.mp4" \
  --codec=h264 --crf=17 --pixel-format=yuv420p --audio-codec=aac --audio-bitrate=256k \
  --concurrency=4 --log=error
ffprobe -v error -show_entries stream=codec_name,width,height,r_frame_rate,pix_fmt,sample_rate,channels:format=duration,size -of default=nw=1 "out/$NAME.mp4"
