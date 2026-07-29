#!/usr/bin/env bash
# Optimize MP3 files in public/ for web delivery.
# UI notification sounds → mono 22kHz 32kbps (adequate, halves file size).
set -euo pipefail

for f in public/*.mp3; do
  [ -f "$f" ] || continue
  echo "Optimizing $f …"
  ffmpeg -y -i "$f" -ac 1 -ar 22050 -b:a 32k -map_metadata -1 "${f%.mp3}_optimized.mp3"
  mv "${f%.mp3}_optimized.mp3" "$f"
done

echo "Done."
