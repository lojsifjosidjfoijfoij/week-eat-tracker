#!/usr/bin/env bash
# Build a dinrr APP video (real app, recorded 1:1).  Usage:
#   tools/ad/app/make_appvideo.sh N stills "1,4,8,12,16,19"   -> stillsN/sheet.png
#   SLUG=<kebab> MUSIC_START=1.85 tools/ad/app/make_appvideo.sh N render -> outN/dinrr-app-NN-<slug>-{music,sfx-only}.mp4
# Needs app/recordN.mjs + app/stageN.html (copy from the newest pair).
set -euo pipefail
N="$1"; MODE="${2:-render}"; TIMES="${3:-1,4,7,10,13,16,19}"
HERE="$(cd "$(dirname "$0")" && pwd)"; AD="$(cd "$HERE/.." && pwd)"; ROOT="$(cd "$HERE/../../.." && pwd)"
cd "$ROOT"
[ -d node_modules ] || npm ci --no-audit --no-fund >/tmp/npmci.log 2>&1
[ -d node_modules/playwright ] || npm i --no-save --no-audit --no-fund playwright@1.56 >/tmp/pw.log 2>&1
[ -f dist/index.html ] || npm run build >/tmp/build.log 2>&1
curl -sf -o /dev/null localhost:4173/ || (nohup npx vite preview --port 4173 --strictPort >/tmp/preview.log 2>&1 &)
curl -sf -o /dev/null "localhost:4174/app/stage$N.html" || (cd "$AD" && nohup python3 -m http.server 4174 >/tmp/http4174.log 2>&1 &)
for i in $(seq 30); do curl -sf -o /dev/null localhost:4173/ && curl -sf -o /dev/null "localhost:4174/app/stage$N.html" && break; sleep 1; done
cd "$HERE"
DUR=$(grep -o 'process.env.DUR || [0-9.]*' "record$N.mjs" | grep -o '[0-9.]*$')

if [ "$MODE" = stills ]; then
  rm -rf "stills$N"; mkdir -p "stills$N"
  ONLY="$TIMES" NUM="$N" OUT="stills$N" node "record$N.mjs" | grep -v '^frame' || true
  python3 - "stills$N" <<'PY'
import sys,glob
from PIL import Image
d=sys.argv[1];fs=sorted(glob.glob(f'{d}/*.png'))
ims=[Image.open(f).resize((270,480)) for f in fs];cols=min(7,len(ims));rows=(len(ims)+cols-1)//cols
sh=Image.new('RGB',(270*cols,480*rows),'white')
for i,im in enumerate(ims):sh.paste(im,((i%cols)*270,(i//cols)*480))
sh.save(f'{d}/sheet.png');print(f'{d}/sheet.png')
PY
  exit 0
fi

NUM="$N" OUT="frames$N" node "record$N.mjs" > "/tmp/app$N.log" 2>&1
python3 app_sound.py "sfx$N.json" "$DUR" "${MUSIC_START:-1.85}" "a$N-"
SLUG="${SLUG:-video}"; NN=$(printf %02d "$N"); mkdir -p "out$N"
for v in mix sfx; do
  name="music"; [ "$v" = sfx ] && name="sfx-only"
  ffmpeg -loglevel error -y -framerate 30 -i "frames$N/%05d.png" -i "a$N-$v.wav" -c:v libx264 -crf 22 -preset slow -pix_fmt yuv420p \
    -af loudnorm=I=-14:TP=-1.5:LRA=11 -c:a aac -b:a 192k -ar 48000 -shortest -movflags +faststart "out$N/dinrr-app-$NN-$SLUG-$name.mp4"
done
ls -la "out$N"
