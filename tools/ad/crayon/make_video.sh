#!/usr/bin/env bash
# Build a dinrr crayon video.  Usage (from anywhere):
#   tools/ad/crayon/make_video.sh N stills "1,4.5,9"   -> stillsN/sheet.png (+ single stills)
#   tools/ad/crayon/make_video.sh N render             -> outN/dinrr-NN-<slug>-{music,sfx-only}.mp4
# Each video N needs scenesN.js, recordN.mjs, soundN.py next to this script (copy from the newest one).
set -euo pipefail
N="$1"; MODE="${2:-render}"; TIMES="${3:-1,3,6,9,11,15,17,21,24.5}"
HERE="$(cd "$(dirname "$0")" && pwd)"; ROOT="$(cd "$HERE/../../.." && pwd)"
cd "$ROOT"
[ -d node_modules ] || npm ci --no-audit --no-fund >/tmp/npmci.log 2>&1
[ -f dist/index.html ] || npm run build >/tmp/build.log 2>&1
cd "$HERE"
[ -d node_modules/playwright ] || npm i --no-save --no-audit --no-fund playwright@1.56 >/tmp/pw.log 2>&1
curl -sf -o /dev/null localhost:4173/ || (cd "$ROOT" && nohup npx vite preview --port 4173 --strictPort >/tmp/preview.log 2>&1 &)
curl -sf -o /dev/null localhost:4175/engine3.html || (nohup python3 -m http.server 4175 >/tmp/http.log 2>&1 &)
for i in $(seq 30); do curl -sf -o /dev/null localhost:4173/ && curl -sf -o /dev/null localhost:4175/engine3.html && break; sleep 1; done
cat engine3.html "scenes$N.js" > "crayon$N.html"

if [ "$MODE" = stills ]; then
  ONLY="$TIMES" OUT="stills$N" node "record$N.mjs" | grep -v '^frame' || true
  python3 - "stills$N" <<'PY'
import sys,glob
from PIL import Image
d=sys.argv[1];fs=sorted(glob.glob(f'{d}/s_*.png'),key=lambda f:float(f.split('s_')[1][:-4]))
ims=[Image.open(f).resize((270,480)) for f in fs];cols=min(7,len(ims));rows=(len(ims)+cols-1)//cols
sh=Image.new('RGB',(270*cols,480*rows),'white')
for i,im in enumerate(ims):sh.paste(im,((i%cols)*270,(i//cols)*480))
sh.save(f'{d}/sheet.png');print(f'{d}/sheet.png')
PY
  exit 0
fi

node "record$N.mjs" > "/tmp/rec$N.log" 2>&1
python3 "sound$N.py"
SLUG="${SLUG:-video}"; NN=$(printf %02d "$N"); mkdir -p "out$N"
for v in mix sfx; do
  name="music"; [ "$v" = sfx ] && name="sfx-only"
  ffmpeg -loglevel error -y -framerate 30 -i "frames$N/%05d.png" -i "${v}$N.wav" -c:v libx264 -crf 24 -preset slow -pix_fmt yuv420p \
    -af loudnorm=I=-14:TP=-1.5:LRA=11 -c:a aac -b:a 192k -ar 48000 -shortest -movflags +faststart "out$N/dinrr-$NN-$SLUG-$name.mp4"
done
ls -la "out$N"
