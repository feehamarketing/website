#!/bin/bash
# usage: finalize.sh <kind-lang> <CompId> <outname> [vodir]
set -e
n=$1; comp=$2; out=$3; vodir=${4:-/home/claude/install/$n/vo}
R=/home/claude/website/reels
cp /home/claude/install/clip-$n.mp4 $R/public/install/$n.mp4
cd $R && KIND=${n%-*} MIXLANG=${n#*-} VODIR=$vodir OUT=/tmp/$n-raw.wav /root/lemo-opuscar/.venv/bin/python scripts/install/mix.py
J=$(ffmpeg -hide_banner -i /tmp/$n-raw.wav -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/{/,/}/p')
gi(){ echo "$J" | python3 -c "import json,sys;print(json.load(sys.stdin)['$1'])"; }
ffmpeg -loglevel error -y -i /tmp/$n-raw.wav -af loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=$(gi input_i):measured_TP=$(gi input_tp):measured_LRA=$(gi input_lra):measured_thresh=$(gi input_thresh):offset=$(gi target_offset):linear=true -ar 48000 $R/public/install/$n-mix.wav
npx remotion render src/index.ts $comp out/$out --codec=h264 --crf=18 --pixel-format=yuv420p --color-space=bt709 --audio-codec=aac --audio-bitrate=256k --concurrency=2 --browser-executable=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome --log=error
ffmpeg -hide_banner -i out/$out -af ebur128 -f null - 2>&1 | grep -E "^\s+I:" | tail -1
