#!/usr/bin/env python3
"""
Regeneration-safety harness for Postman SDK Generator.

Answers one question with a number: when the API spec changes repeatedly,
does hand-written custom code in the generated SDK survive?

    ./run.py survive          push 12 spec revisions, regenerate after each,
                              assert the custom code is still there and still
                              compiles.  -> "N/N regenerations preserved..."

    ./run.py counterfactual   the same thing with --no-merge, and assert the
                              custom code is GONE. Proves the survival result
                              above is not a tautology.
                              (--no-merge, NOT --no-track-changes. See the
                              note on generate() — they differ, and picking
                              the wrong one makes the counterfactual a no-op.)

    ./run.py conflict         edit lines the generator also touches, then
                              show mark / ours / theirs resolution.

    ./run.py reset            put the cloud spec back to the baseline.

Point it at your own spec with --spec-id and it works the same way; that is
what makes it a leave-behind rather than a demo prop.
"""

import argparse
import json
import os
import re
import shutil
import subprocess
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MUTATE = ROOT / "mutations" / "apply_mutation.py"
SNIPPET = ROOT / "harness" / "custom-code.ts.snippet"

# The service file we graft custom code onto, relative to the SDK root.
TARGET = "src/services/payments/payments-service.ts"

# Markers the assertions look for.
SENTINELS = ["==== CUSTOM CODE", "createAndFetchPayment", "describeInstrument"]

DEFAULT_SPEC_ID = "9e1f61e5-b8f7-42d4-9f78-7b1fb30ec978"
API = "https://api.getpostman.com"

C = {"g": "\033[32m", "r": "\033[31m", "y": "\033[33m", "d": "\033[2m", "b": "\033[1m", "x": "\033[0m"}


def say(msg, colour=None):
    print(f"{C.get(colour,'')}{msg}{C['x']}", flush=True)


# ----------------------------------------------------------------------
# Postman API + CLI
# ----------------------------------------------------------------------

def api_key():
    k = os.environ.get("POSTMAN_API_KEY")
    if k:
        return k
    # fall back to the CLI's own credentials so the harness works standalone
    rc = Path.home() / ".postman" / "postmanrc"
    if rc.exists():
        profiles = json.loads(rc.read_text())["login"]["_profiles"]
        return profiles[0]["postmanApiKey"]
    sys.exit("No POSTMAN_API_KEY in the environment and no ~/.postman/postmanrc.")


def push_spec(spec_id, content, root_file):
    """Update the root file of a cloud spec. NOTE: PATCH, not PUT — PUT 404s."""
    req = urllib.request.Request(
        f"{API}/specs/{spec_id}/files/{root_file}",
        data=json.dumps({"content": content}).encode(),
        method="PATCH",
        headers={"x-api-key": api_key(), "Content-Type": "application/json"},
    )
    urllib.request.urlopen(req)


def root_file_of(spec_id):
    req = urllib.request.Request(f"{API}/specs/{spec_id}/files",
                                 headers={"x-api-key": api_key()})
    files = json.load(urllib.request.urlopen(req))["files"]
    for f in files:
        if f.get("type") == "ROOT":
            return f["path"]
    return files[0]["path"]


def revision(n):
    r = subprocess.run([sys.executable, str(MUTATE), str(n)],
                       capture_output=True, text=True)
    if r.returncode:
        sys.exit(f"mutation {n} failed:\n{r.stderr}")
    return r.stdout


def generate(spec_id, lang, outdir, merge=True):
    """
    Run the generator. Returns (ok, stdout, merge_detected).

    NOTE on flags, verified 2026-08-02 — these are NOT interchangeable:
      --no-merge          skips the custom-code merge for THIS run and
                          overwrites. This is the real counterfactual.
      --no-track-changes  stops writing file hashes, so the NEXT run cannot
                          detect edits. It does not stop the merge now.
    Using --no-track-changes as the counterfactual silently does nothing
    visible, which is worse than no counterfactual at all.
    """
    cmd = ["postman", "sdk", "generate", spec_id, "-l", lang, "-o", str(outdir), "--yes"]
    if not merge:
        cmd.append("--no-merge")
    r = subprocess.run(cmd, capture_output=True, text=True)
    out = r.stdout + r.stderr
    merged = "Detected user edits" in out
    return r.returncode == 0, out, merged


# ----------------------------------------------------------------------
# custom code + assertions
# ----------------------------------------------------------------------

def inject(sdk_root):
    """Graft the custom snippet onto the end of the target service class."""
    f = sdk_root / TARGET
    if not f.exists():
        sys.exit(f"target file missing: {f}")
    src = f.read_text()
    if SENTINELS[0] in src:
        return False
    i = src.rstrip().rfind("\n}")
    f.write_text(src[:i] + "\n" + SNIPPET.read_text() + src[i:])
    return True


def check(sdk_root, expect_present=True):
    """Returns (ok, [reasons]). The whole judgement lives here."""
    reasons = []
    f = sdk_root / TARGET

    if not f.exists():
        return False, [f"{TARGET} missing entirely"]
    src = f.read_text()

    present = [s for s in SENTINELS if s in src]
    if expect_present:
        missing = [s for s in SENTINELS if s not in src]
        if missing:
            reasons.append(f"custom code lost: {', '.join(missing)}")
    else:
        if present:
            reasons.append(f"custom code unexpectedly SURVIVED: {', '.join(present)}")

    markers = len(re.findall(r"^(<{7}|={7}|>{7})", src, re.M))
    if markers:
        reasons.append(f"{markers} unresolved conflict marker(s)")

    if expect_present:
        rc, out = typecheck(sdk_root)
        if rc != 0:
            first = next((l for l in out.splitlines() if "error" in l.lower()), "")
            reasons.append(f"typecheck failed: {first[:110]}")

    return not reasons, reasons


def typecheck(sdk_root):
    # The generated SDK ships a node_modules/.cache directory, so testing for
    # node_modules alone is not enough — it exists and is empty, npm install
    # gets skipped, and tsc is missing. Probe for the compiler itself.
    if not (sdk_root / "node_modules" / "typescript").exists():
        r = subprocess.run(["npm", "install", "--silent", "--no-audit", "--no-fund"],
                           cwd=sdk_root, capture_output=True, text=True)
        if r.returncode != 0:
            return r.returncode, "npm install failed:\n" + (r.stdout + r.stderr)[-800:]
    r = subprocess.run(["npm", "test"], cwd=sdk_root, capture_output=True, text=True)
    return r.returncode, r.stdout + r.stderr


# ----------------------------------------------------------------------
# modes
# ----------------------------------------------------------------------

def prepare(args, label):
    """Reset spec to baseline, generate a clean SDK, inject custom code."""
    rootfile = root_file_of(args.spec_id)
    say(f"\n{C['b']}== {label} =={C['x']}")
    say(f"spec {args.spec_id}  root file {rootfile}  language {args.language}", "d")

    say("\n[setup] pushing baseline (r0) to the cloud spec", "d")
    push_spec(args.spec_id, revision(0), rootfile)

    out = Path(args.workdir)
    if out.exists():
        shutil.rmtree(out)
    out.mkdir(parents=True)

    say("[setup] first generation", "d")
    ok, log, _ = generate(args.spec_id, args.language, out / "sdks")
    if not ok:
        say(log[-1500:], "r")
        sys.exit("first generation failed")
    sdk = out / "sdks" / args.language

    inject(sdk)
    say("[setup] custom code injected", "d")
    say("[setup] installing dependencies (once)", "d")
    rc, out = typecheck(sdk)
    if rc != 0:
        say(out[-1200:], "r")
        sys.exit("baseline does not typecheck with custom code — fix before running")
    say("[setup] baseline green\n", "g")
    return sdk, rootfile


def mode_survive(args):
    sdk, rootfile = prepare(args, "SURVIVAL: does custom code outlive repeated spec changes?")
    results, t0 = [], time.time()

    for n in range(1, args.mutations + 1):
        spec = revision(n)
        # x-mutation-log is cumulative, so take the LAST entry — the change
        # this iteration actually introduced.
        tags = re.findall(r"-\s*'?(m\d+: [^'\n]+)'?", spec)
        label = tags[-1].strip() if tags else f"m{n:02d}"
        push_spec(args.spec_id, spec, rootfile)

        ok, log, merged = generate(args.spec_id, args.language, Path(args.workdir) / "sdks")
        if not ok:
            results.append((n, label, False, ["generation failed"], merged))
            say(f"  {n:2d}/{args.mutations}  FAIL  {label} — generation failed", "r")
            if args.stop_on_fail:
                break
            continue

        good, reasons = check(sdk, expect_present=True)
        results.append((n, label, good, reasons, merged))
        mark = f"{C['g']}pass{C['x']}" if good else f"{C['r']}FAIL{C['x']}"
        merge_note = "" if merged else f"  {C['y']}(no merge detected){C['x']}"
        print(f"  {n:2d}/{args.mutations}  {mark}  {label}{merge_note}")
        for r in reasons:
            say(f"           {r}", "r")
        if not good and args.stop_on_fail:
            break

    return report(results, time.time() - t0, args)


def mode_counterfactual(args):
    """Same change, merge skipped. The custom code MUST disappear."""
    sdk, rootfile = prepare(args, "COUNTERFACTUAL: --no-merge should destroy custom code")
    push_spec(args.spec_id, revision(1), rootfile)
    ok, log, merged = generate(args.spec_id, args.language,
                               Path(args.workdir) / "sdks", merge=False)
    if not ok:
        say(log[-1200:], "r")
        sys.exit("generation failed")

    good, reasons = check(sdk, expect_present=False)
    print()
    if good:
        say("  PASS — custom code was destroyed, exactly as expected.", "g")
        say("  This is what a generator without change tracking does by default.", "d")
    else:
        for r in reasons:
            say(f"  FAIL — {r}", "r")
        say("  The counterfactual did not fire. The survival result above proves nothing", "r")
        say("  until this does. Investigate before demoing.", "r")
    if merged:
        say("  note: a merge was still detected despite --no-merge", "y")
    return 0 if good else 1


def mode_conflict(args):
    """
    Force a REAL conflict and show the three resolution strategies.

    A conflict needs all three of: a common base, a local edit, and a
    generator-side edit to the SAME line. So per strategy we must
    regenerate at r5, edit the JSDoc line, THEN push r6 (m06 rewords that
    exact description) and regenerate. Pushing the spec once up front and
    regenerating twice from it produces no generator-side change and
    therefore no conflict - which is what an earlier version of this did.
    """
    rootfile = root_file_of(args.spec_id)
    say(f"\n{C['b']}== CONFLICT: mark / ours / theirs =={C['x']}")

    BASE_TEXT = "Returns a page of payments, most recent first."
    LOCAL = BASE_TEXT + " [LOCALLY EDITED]"
    out = Path(args.workdir)

    for strategy in ("mark", "ours", "theirs"):
        if out.exists():
            shutil.rmtree(out)
        out.mkdir(parents=True)

        # 1. common base: generate at r5
        push_spec(args.spec_id, revision(5), rootfile)
        ok, log, _ = generate(args.spec_id, args.language, out / "sdks")
        if not ok:
            say(log[-800:], "r")
            return 1
        sdk = out / "sdks" / args.language
        f = sdk / TARGET
        inject(sdk)

        # 2. local edit on a line the generator owns
        src = f.read_text()
        if BASE_TEXT not in src:
            say(f"base text not found in generated output: {BASE_TEXT!r}", "r")
            return 1
        f.write_text(src.replace(BASE_TEXT, LOCAL))

        # 3. generator-side edit to the same line: m06 rewords it
        push_spec(args.spec_id, revision(6), rootfile)
        r = subprocess.run(
            ["postman", "sdk", "generate", args.spec_id, "-l", args.language,
             "-o", str(out / "sdks"), "--yes", "--conflict-strategy", strategy],
            capture_output=True, text=True)

        s2 = f.read_text()
        markers = len(re.findall(r"^<{7}", s2, re.M))
        mine = "[LOCALLY EDITED]" in s2
        theirs = "scoped to the authenticated merchant" in s2
        custom_ok = all(x in s2 for x in SENTINELS)

        verdict = {
            "mark":   "markers inserted for you to resolve" if markers else "no conflict raised",
            "ours":   "kept your edit" if mine and not theirs else ("took generated" if theirs else "?"),
            "theirs": "took generated" if theirs and not mine else ("kept yours" if mine else "?"),
        }[strategy]
        colour = "g" if r.returncode == 0 else "r"
        say(f"  --conflict-strategy {strategy:<7} markers={markers}  yours={mine}  "
            f"generated={theirs}  custom-code-intact={custom_ok}", colour)
        say(f"      -> {verdict}", "d")

    say("\n  Note: custom code in the untouched region survives regardless of", "d")
    say("  strategy. The strategy only governs the lines you and the generator", "d")
    say("  both changed.", "d")
    return 0


def report(results, secs, args):
    total = len(results)
    passed = sum(1 for *_, ok, _, _ in [(r[0], r[1], r[2], r[3], r[4]) for r in results] if ok)
    passed = sum(1 for r in results if r[2])
    no_merge = [r[0] for r in results if not r[4]]

    print()
    print("=" * 68)
    verdict = C["g"] if passed == total else C["r"]
    print(f"{verdict}{C['b']}  {passed}/{total} regenerations preserved customization{C['x']}")
    print(f"  0 manual interventions" if passed == total else
          f"  {total - passed} required intervention")
    print(f"  {secs:.0f}s wall clock  ·  spec {args.spec_id}  ·  {args.language}")
    print("=" * 68)

    if no_merge:
        say(f"  note: no merge step detected on mutation(s) {no_merge}", "y")
    for n, label, ok, reasons, _ in results:
        if not ok:
            say(f"  m{n:02d} {label}: {'; '.join(reasons)}", "r")
    print()
    return 0 if passed == total else 1


def mode_reset(args):
    rootfile = root_file_of(args.spec_id)
    push_spec(args.spec_id, revision(0), rootfile)
    say(f"cloud spec {args.spec_id} reset to baseline (r0)", "g")
    return 0


# ----------------------------------------------------------------------

def main():
    ap = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("mode", choices=["survive", "counterfactual", "conflict", "reset"])
    ap.add_argument("--spec-id", default=DEFAULT_SPEC_ID)
    ap.add_argument("--language", default="typescript")
    ap.add_argument("--mutations", type=int, default=12)
    ap.add_argument("--workdir", default=str(ROOT / ".tmp" / "harness"))
    ap.add_argument("--stop-on-fail", action="store_true",
                    help="halt at the first failure instead of completing the tally")
    args = ap.parse_args()

    try:
        return {"survive": mode_survive,
                "counterfactual": mode_counterfactual,
                "conflict": mode_conflict,
                "reset": mode_reset}[args.mode](args)
    except urllib.error.HTTPError as e:
        sys.exit(f"Postman API {e.code}: {e.read().decode()[:300]}")


if __name__ == "__main__":
    sys.exit(main())
