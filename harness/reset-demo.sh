#!/usr/bin/env bash
#
# Reset the rig to a clean pre-demo state.
#
#   ./harness/reset-demo.sh          check + reset everything it safely can
#   ./harness/reset-demo.sh --check  report only, change nothing
#
# Run this before every demo. Beats 2-4 are largely self-resetting because the
# harness pushes the baseline itself, but the cloud spec, the auto-PR branch,
# and the two standing pull requests all need attention.

set -uo pipefail
cd "$(dirname "$0")/.."

SPEC_ID="${SPEC_ID:-9e1f61e5-b8f7-42d4-9f78-7b1fb30ec978}"
CHECK_ONLY=false
[ "${1:-}" = "--check" ] && CHECK_ONLY=true

g(){ printf '\033[32m%s\033[0m\n' "$*"; }
r(){ printf '\033[31m%s\033[0m\n' "$*"; }
y(){ printf '\033[33m%s\033[0m\n' "$*"; }
d(){ printf '\033[2m%s\033[0m\n' "$*"; }

if [ -z "${POSTMAN_API_KEY:-}" ]; then
  if [ -f "$HOME/Documents/marvin/.env" ]; then
    export POSTMAN_API_KEY=$(grep '^POSTMAN_API_KEY=' "$HOME/Documents/marvin/.env" | cut -d= -f2)
  else
    r "POSTMAN_API_KEY not set and ~/Documents/marvin/.env not found"; exit 1
  fi
fi

echo "=============================================================="
echo " Demo reset — spec $SPEC_ID"
echo "=============================================================="

# ---------------------------------------------------------------- 1
echo
echo "1. Cloud spec -> baseline (r0)"
if $CHECK_ONLY; then
  d "   (check only, not pushing)"
else
  python3 harness/run.py reset && g "   done — union back to 3 variants, no merchantReference"
fi

# ---------------------------------------------------------------- 2
echo
echo "2. Local scratch"
if $CHECK_ONLY; then
  d "   .tmp present: $([ -d .tmp ] && echo yes || echo no)"
else
  rm -rf .tmp "$HOME/Documents/marvin/content/sdk-regen-pov-demo/.tmp"
  g "   cleared"
fi

# ---------------------------------------------------------------- 3
echo
echo "3. Git state"
git checkout -q main && git pull -q
# grep -c prints 0 AND exits 1 when there are no matches, so `|| echo 0`
# would emit "0\n0" and break the numeric test. Swallow the status instead.
CUSTOM=$(grep -c 'describeInstrument' src/services/payments/payments-service.ts 2>/dev/null); CUSTOM=${CUSTOM:-0}
if [ "$CUSTOM" -ge 1 ]; then
  g "   custom code present on main at src/services/payments/payments-service.ts"
else
  r "   CUSTOM CODE MISSING on main. Beat 6 has nothing to preserve, and Beat 4's"
  r "   framing breaks. Re-add it from harness/custom-code.ts.snippet via a PR."
fi
STRAY=$(grep -c 'mergeCommitMarker' src/services/payments/payments-service.ts 2>/dev/null); STRAY=${STRAY:-0}
[ "$STRAY" -gt 0 ] && y "   note: test marker 'mergeCommitMarker' still present — cosmetic only"

# ---------------------------------------------------------------- 4
echo
echo "4. Standing pull requests (Beat 5 shows these — do NOT merge them)"
for n in 1 2; do
  # mergeStateStatus goes UNKNOWN while GitHub recomputes after main moves.
  # Poll briefly, then fall back to the check conclusion, which is stable.
  for _ in 1 2 3; do
    st=$(gh pr view "$n" --json state -q .state 2>/dev/null)
    ms=$(gh pr view "$n" --json mergeStateStatus -q .mergeStateStatus 2>/dev/null)
    [ "$ms" != "UNKNOWN" ] && break
    sleep 4
  done
  ck=$(gh pr view "$n" --json statusCheckRollup -q '.statusCheckRollup[0].conclusion' 2>/dev/null)
  want_ck=$([ "$n" = 1 ] && echo FAILURE || echo SUCCESS)
  if [ "$st" = OPEN ] && [ "$ck" = "$want_ck" ]; then
    label=$([ "$n" = 1 ] && echo "breaking change, gate red" || echo "additive change, gate green")
    g "   PR #$n OPEN, check=$ck  — $label"
    [ "$ms" = UNKNOWN ] && d "        (mergeability still recomputing; harmless)"
  else
    r "   PR #$n unexpected: state=$st check=$ck (wanted OPEN / $want_ck)"
    d "        recreate from branch $([ "$n" = 1 ] && echo breaking-change || echo additive-change)"
  fi
done

# ---------------------------------------------------------------- 5
echo
echo "5. Auto-PR branch (Beat 6)"
AUTO=$(gh pr list --state open --author app/postman --json number -q '.[0].number' 2>/dev/null)
if [ -n "$AUTO" ] && [ "$AUTO" != "null" ]; then
  y "   open auto-PR #$AUTO from a previous run."
  y "   IMPORTANT: merge it, do not close it."
  y "   Closing an auto-PR without merging left the integration silent for 10+"
  y "   minutes on a later spec change (observed 2026-08-02). Merging keeps it"
  y "   in the state it expects."
  y "   Then re-add custom code, because merging the auto-PR deletes it:"
  d "       gh pr merge $AUTO --merge"
  d "       git checkout -b restore-custom && \\"
  d "         python3 harness/reapply-custom-code.py && \\"
  d "         git commit -am 'Restore custom code' && git push -u origin restore-custom"
  d "       gh pr create --fill && gh pr merge --merge"
else
  g "   no open auto-PR"
fi

# ---------------------------------------------------------------- 6
echo
echo "6. Build path warm-up"
if $CHECK_ONLY; then
  d "   (skipped)"
else
  S=$(date +%s)
  if postman sdk generate "$SPEC_ID" -l typescript -o /tmp/warm-$$ --yes >/dev/null 2>&1; then
    EL=$(( $(date +%s) - S )); rm -rf /tmp/warm-$$
    if [ "$EL" -le 20 ]; then g "   generation healthy (${EL}s)"; else y "   SLOW: ${EL}s — normal is ~6s. Consider the backup recording."; fi
  else
    r "   generation FAILED — do not demo until this is understood"
  fi
fi

echo
echo "=============================================================="
echo " Reminders"
echo "   - Beat 6 latency is ~6 minutes. Make the spec change during"
echo "     Beat 1 and return to it at Beat 6. Do not wait live."
echo "   - Beat 6 shows AUTOMATION only. It does NOT preserve custom"
echo "     code — verified. Preservation is Beat 4's claim."
echo "   - Never run 'harness/run.py conflict' live."
echo "=============================================================="
