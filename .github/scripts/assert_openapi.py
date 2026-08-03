#!/usr/bin/env python3
"""
Assert that a file is a parseable OpenAPI document with at least one path.

Used by the compatibility gate before oasdiff runs. If either side of the
comparison is unparseable or empty, oasdiff can still exit 0 — a green
result produced by comparing nothing. This turns that into a hard failure.

    python3 assert_openapi.py spec/payments-api.yaml
"""
import sys

import yaml


def main(path):
    try:
        doc = yaml.safe_load(open(path))
    except Exception as e:
        sys.exit(f"{path}: not parseable YAML — {e}")

    if not isinstance(doc, dict):
        sys.exit(f"{path}: top level is {type(doc).__name__}, expected a mapping")
    if not doc.get("openapi"):
        sys.exit(f"{path}: no `openapi` version key — not an OpenAPI document")
    paths = doc.get("paths") or {}
    if not paths:
        sys.exit(f"{path}: no paths — nothing to compare")

    schemas = (doc.get("components") or {}).get("schemas") or {}
    print(f"{path}: OpenAPI {doc['openapi']}, {len(paths)} paths, {len(schemas)} schemas")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    main(sys.argv[1])
