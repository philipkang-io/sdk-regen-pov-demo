#!/usr/bin/env python3
"""
Re-apply the custom snippet to the generated SDK at the repo root.

Needed after merging an auto-PR, because automatic regeneration deletes
custom code (verified 2026-08-02 — it is documented to preserve it, and
does not).
"""
from pathlib import Path

TARGET = Path("src/services/payments/payments-service.ts")
SNIPPET = Path("harness/custom-code.ts.snippet")

s = TARGET.read_text()
if "==== CUSTOM CODE" in s:
    print("already present — nothing to do")
else:
    i = s.rstrip().rfind("\n}")
    TARGET.write_text(s[:i] + "\n" + SNIPPET.read_text() + s[i:])
    print(f"custom code re-applied to {TARGET}")
