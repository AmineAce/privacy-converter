#!/usr/bin/env bash
# Verify audio files are optimized (≤10KB each for UI notification sounds).
# Fails with non-zero exit if any MP3 exceeds the threshold.
set -euo pipefail

THRESHOLD=10240  # 10KB
FAIL=0

for f in public/*.mp3; do
  [ -f "$f" ] || continue
  size=$(stat -c%s "$f")
  if [ "$size" -gt "$THRESHOLD" ]; then
    echo "FAIL: $f is ${size}B (exceeds ${THRESHOLD}B threshold)"
    FAIL=1
  else
    echo "PASS: $f is ${size}B (threshold ${THRESHOLD}B)"
  fi
done

exit $FAIL
