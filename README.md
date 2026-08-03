# SDK regeneration safety — demo rig

One question, answered with a number:

> **When the API spec changes repeatedly, does hand-written custom code in a
> generated SDK survive?**

Latest run: **12/12 regenerations preserved customization, 0 manual
interventions, 113 seconds.**

This exists because the objection it answers is a statistic — *"at least 60%
of the time you deploy an updated API, something is going to fail on SDK
generation"* — and a statistic is not refuted by one clean demo run.

## Layout

| Path | What it is |
|---|---|
| `spec/payments-api.yaml` | OpenAPI 3.0.3. Carries a real `oneOf` + `discriminator` — polymorphism is where generators fail |
| `mutations/apply_mutation.py` | 12 ordered spec changes, applied cumulatively, plus a held-out breaking change |
| `harness/run.py` | The test rig — `survive`, `counterfactual`, `conflict`, `reset` |
| `sdk/typescript/` | The generated SDK, committed so regeneration diffs are reviewable |
| `.github/workflows/api-compat.yml` | Breaking-change gate (oasdiff) |

## Run it against your own spec

```bash
export POSTMAN_API_KEY=...            # or just `postman login`
python3 harness/run.py survive --spec-id <your-spec-id>
```

It pushes each mutation to the cloud spec, regenerates, and after every
round asserts three things independently:

1. the custom code is still present,
2. there are no unresolved conflict markers,
3. the SDK still type-checks.

`counterfactual` runs the same change with `--no-merge` and asserts the
custom code is **gone** — without that, the survival number proves nothing.

## Things worth knowing (learned the hard way)

- **`type: object` alongside `oneOf` silently breaks the union.** The
  TypeScript generator emits `z.any()` and produces no variant models. The
  spec stays valid OpenAPI and lints clean. Remove `type`.
- **`--no-merge` is not `--no-track-changes`.** The former skips the merge
  now; the latter stops recording hashes for next time. Only the first is a
  real counterfactual.
- **Spec files update over the API with `PATCH`, not `PUT`.** `PUT` 404s.
- **The `discriminator` keyword is currently ignored** by the TypeScript
  generator — `z.union`, not `z.discriminatedUnion`. Narrowing still works,
  because each variant carries a literal type.
- The generated SDK ships an empty `node_modules/.cache`, so probing for
  `node_modules` to decide whether to `npm install` skips the install.
