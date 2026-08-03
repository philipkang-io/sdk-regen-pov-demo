#!/usr/bin/env python3
"""
Apply spec mutations cumulatively to the Payments API baseline.

    python3 apply_mutation.py 0            -> baseline, unchanged
    python3 apply_mutation.py 5            -> baseline + m01..m05
    python3 apply_mutation.py 12           -> all twelve, still non-breaking
    python3 apply_mutation.py breaking     -> all twelve + the breaking change

Writes to stdout by default, or to --out.

Every mutation m01-m12 is ADDITIVE and therefore non-breaking: an existing
generated client keeps compiling. That is deliberate. The breaking change is
held separately so Phase 4 can prove the gate fires on it.

YAML is dumped with an effectively infinite line width. Long lines that get
folded have broken downstream generators before (see the swagger2openapi
line-folding note in MARVIN memory), so we do not let PyYAML wrap.
"""

import argparse
import copy
import sys
from pathlib import Path

import yaml

BASELINE = Path(__file__).resolve().parent.parent / "spec" / "payments-api.yaml"


# ----------------------------------------------------------------------
# helpers
# ----------------------------------------------------------------------

def schemas(spec):
    return spec["components"]["schemas"]


def bump(spec, label):
    """Advance the patch version and record which mutation produced it."""
    major, minor, patch = (int(p) for p in spec["info"]["version"].split("."))
    spec["info"]["version"] = f"{major}.{minor + 1}.0"
    spec["info"].setdefault("x-mutation-log", []).append(label)


# ----------------------------------------------------------------------
# mutations - each takes the spec and edits it in place
# ----------------------------------------------------------------------

def m01_add_optional_field(spec):
    """Add an optional scalar to an existing response model."""
    schemas(spec)["Payment"]["properties"]["merchantReference"] = {
        "type": "string",
        "nullable": True,
        "description": "Merchant's own reference for this payment.",
    }


def m02_add_endpoint(spec):
    """Add a whole new operation."""
    spec["paths"]["/refunds/{refundId}"] = {
        "parameters": [
            {
                "name": "refundId",
                "in": "path",
                "required": True,
                "description": "Identifier of the refund.",
                "schema": {"type": "string"},
            }
        ],
        "get": {
            "tags": ["Refunds"],
            "operationId": "getRefund",
            "summary": "Retrieve a refund",
            "responses": {
                "200": {
                    "description": "The requested refund.",
                    "content": {
                        "application/json": {
                            "schema": {"$ref": "#/components/schemas/Refund"}
                        }
                    },
                },
                "404": {"$ref": "#/components/responses/NotFound"},
            },
        },
    }


def m03_add_card_brand(spec):
    """Widen one enum - the card network list."""
    schemas(spec)["CardBrand"]["enum"].append("discover")


def m04_add_union_variant(spec):
    """
    Add a FOURTH variant to the discriminated union.

    This is the highest-value mutation in the set. If custom code survives
    a change to the polymorphic type itself, it survives anything.
    """
    schemas(spec)["CryptoInstrument"] = {
        "type": "object",
        "required": ["instrumentType", "asset", "network"],
        "properties": {
            "instrumentType": {"type": "string", "enum": ["crypto"]},
            "asset": {"type": "string", "description": "Asset ticker, e.g. BTC."},
            "network": {"type": "string", "description": "Settlement network."},
            "walletAddressLast6": {
                "type": "string",
                "nullable": True,
                "description": "Last six characters of the destination address.",
            },
        },
    }
    inst = schemas(spec)["PaymentInstrument"]
    inst["oneOf"].append({"$ref": "#/components/schemas/CryptoInstrument"})
    inst["discriminator"]["mapping"]["crypto"] = "#/components/schemas/CryptoInstrument"


def m05_deprecate_field(spec):
    """Mark a field deprecated without removing it."""
    desc = schemas(spec)["Payment"]["properties"]["description"]
    desc["deprecated"] = True
    desc["description"] = "Deprecated. Use merchantReference instead."


def m06_reword_descriptions(spec):
    """
    Pure prose change - no shape change at all.

    Included because it is the change API teams make most often and assume
    is free. It should be a no-op for the SDK surface.
    """
    spec["paths"]["/payments"]["get"]["description"] = (
        "Returns a page of payments, most recent first. Results are scoped "
        "to the authenticated merchant."
    )
    schemas(spec)["Money"]["properties"]["amountMinor"]["description"] = (
        "Amount in the minor unit of the currency. For USD this is cents."
    )


def m07_add_nested_object(spec):
    """Add a nested object property, not just a scalar."""
    schemas(spec)["RiskAssessment"] = {
        "type": "object",
        "required": ["score"],
        "properties": {
            "score": {
                "type": "integer",
                "format": "int32",
                "minimum": 0,
                "maximum": 100,
                "description": "Risk score, higher is riskier.",
            },
            "rulesTriggered": {
                "type": "array",
                "items": {"type": "string"},
                "description": "Identifiers of the risk rules that fired.",
            },
        },
    }
    # `nullable` requires a sibling `type` in OpenAPI 3.0. The allOf-with-one-ref
    # idiom is the usual way to make a $ref nullable, but it is only valid with
    # the explicit `type: object` alongside it. Omitting it lints clean in some
    # tools and silently degrades the generated property to `any` in others.
    schemas(spec)["Payment"]["properties"]["risk"] = {
        "type": "object",
        "nullable": True,
        "allOf": [{"$ref": "#/components/schemas/RiskAssessment"}],
        "description": "Risk assessment, when scoring ran.",
    }


def m08_widen_status_enum(spec):
    """Widen a DIFFERENT enum, one that appears in a query parameter."""
    schemas(spec)["PaymentStatus"]["enum"].extend(["refunded", "partially_refunded"])


def m09_add_response_code(spec):
    """Add a documented failure mode to an existing operation."""
    spec["paths"]["/payments"]["post"]["responses"]["429"] = {
        "description": "Rate limit exceeded for this merchant.",
        "content": {
            "application/json": {"schema": {"$ref": "#/components/schemas/Error"}}
        },
    }


def m10_add_query_param(spec):
    """Add an optional query parameter to an existing operation."""
    spec["paths"]["/payments"]["get"]["parameters"].append(
        {
            "name": "createdAfter",
            "in": "query",
            "required": False,
            "description": "Only return payments created at or after this time.",
            "schema": {"type": "string", "format": "date-time"},
        }
    )


def m11_add_header_param(spec):
    """Add an optional header parameter."""
    spec["paths"]["/payments"]["post"].setdefault("parameters", []).append(
        {
            "name": "X-Request-Id",
            "in": "header",
            "required": False,
            "description": "Client-generated request identifier, echoed in logs.",
            "schema": {"type": "string"},
        }
    )


def m12_add_second_union(spec):
    """
    Add a SECOND, independent discriminated union plus an operation using it.

    Proves the generator handles more than one polymorphic type in a spec,
    which is where some generators start colliding type names.
    """
    schemas(spec)["BankAccountDestination"] = {
        "type": "object",
        "required": ["destinationType", "accountLast4"],
        "properties": {
            "destinationType": {"type": "string", "enum": ["bank_account"]},
            "accountLast4": {"type": "string", "minLength": 4, "maxLength": 4},
        },
    }
    schemas(spec)["CardDestination"] = {
        "type": "object",
        "required": ["destinationType", "last4"],
        "properties": {
            "destinationType": {"type": "string", "enum": ["card"]},
            "last4": {"type": "string", "minLength": 4, "maxLength": 4},
        },
    }
    # No `type: object` alongside `oneOf` - see the note on PaymentInstrument
    # in the baseline spec. It silently degrades the union to `any`.
    schemas(spec)["PayoutDestination"] = {
        "description": "Where a payout is sent.",
        "oneOf": [
            {"$ref": "#/components/schemas/BankAccountDestination"},
            {"$ref": "#/components/schemas/CardDestination"},
        ],
        "discriminator": {
            "propertyName": "destinationType",
            "mapping": {
                "bank_account": "#/components/schemas/BankAccountDestination",
                "card": "#/components/schemas/CardDestination",
            },
        },
    }
    schemas(spec)["CreatePayoutRequest"] = {
        "type": "object",
        "required": ["amount", "destination"],
        "properties": {
            "amount": {"$ref": "#/components/schemas/Money"},
            "destination": {"$ref": "#/components/schemas/PayoutDestination"},
        },
    }
    schemas(spec)["Payout"] = {
        "type": "object",
        "required": ["id", "amount", "destination", "createdAt"],
        "properties": {
            "id": {"type": "string"},
            "amount": {"$ref": "#/components/schemas/Money"},
            "destination": {"$ref": "#/components/schemas/PayoutDestination"},
            "createdAt": {"type": "string", "format": "date-time"},
        },
    }
    spec["tags"].append({"name": "Payouts", "description": "Send funds out"})
    spec["paths"]["/payouts"] = {
        "post": {
            "tags": ["Payouts"],
            "operationId": "createPayout",
            "summary": "Create a payout",
            "requestBody": {
                "required": True,
                "content": {
                    "application/json": {
                        "schema": {"$ref": "#/components/schemas/CreatePayoutRequest"}
                    }
                },
            },
            "responses": {
                "201": {
                    "description": "The created payout.",
                    "content": {
                        "application/json": {
                            "schema": {"$ref": "#/components/schemas/Payout"}
                        }
                    },
                },
                "400": {"$ref": "#/components/responses/BadRequest"},
            },
        }
    }


MUTATIONS = [
    ("m01", "add optional field to Payment", m01_add_optional_field),
    ("m02", "add GET /refunds/{refundId}", m02_add_endpoint),
    ("m03", "widen CardBrand enum", m03_add_card_brand),
    ("m04", "add 4th variant to the payment-instrument union", m04_add_union_variant),
    ("m05", "deprecate Payment.description", m05_deprecate_field),
    ("m06", "reword descriptions only", m06_reword_descriptions),
    ("m07", "add nested RiskAssessment object", m07_add_nested_object),
    ("m08", "widen PaymentStatus enum", m08_widen_status_enum),
    ("m09", "add 429 response to createPayment", m09_add_response_code),
    ("m10", "add createdAfter query param", m10_add_query_param),
    ("m11", "add X-Request-Id header param", m11_add_header_param),
    ("m12", "add second discriminated union + /payouts", m12_add_second_union),
]


def breaking(spec):
    """
    The breaking change, held out of the numbered set.

    Making an existing optional request-body property required is a
    textbook backward-incompatible change: every existing caller that
    omits it starts failing. oasdiff classifies it as breaking and exits
    non-zero, which is what Phase 4 gates on.
    """
    req = schemas(spec)["CreatePaymentRequest"]
    req.setdefault("required", []).append("description")
    bump(spec, "BREAKING: CreatePaymentRequest.description optional -> required")


# ----------------------------------------------------------------------

def build(upto):
    spec = yaml.safe_load(BASELINE.read_text())
    if upto == "breaking":
        for label, desc, fn in MUTATIONS:
            fn(spec)
            bump(spec, f"{label}: {desc}")
        breaking(spec)
        return spec
    for label, desc, fn in MUTATIONS[:int(upto)]:
        fn(spec)
        bump(spec, f"{label}: {desc}")
    return spec


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("upto", help="0-12, or 'breaking'")
    ap.add_argument("--out", help="write here instead of stdout")
    ap.add_argument("--list", action="store_true", help="list mutations and exit")
    args = ap.parse_args()

    if args.list:
        for label, desc, _ in MUTATIONS:
            print(f"{label}  {desc}")
        print("brk  CreatePaymentRequest.description optional -> required (BREAKING)")
        return

    spec = build(args.upto)
    out = yaml.safe_dump(
        spec,
        sort_keys=False,
        default_flow_style=False,
        allow_unicode=True,
        width=10 ** 9,   # never fold long lines
    )
    if args.out:
        Path(args.out).write_text(out)
        print(f"wrote {args.out}  version={spec['info']['version']}", file=sys.stderr)
    else:
        sys.stdout.write(out)


if __name__ == "__main__":
    main()
