# PaymentsService

A list of all methods in the `PaymentsService` service. Click on the method name to view detailed information about that method.

| Methods                         | Description                                                                          |
| :------------------------------ | :----------------------------------------------------------------------------------- |
| [listPayments](#listpayments)   | Returns a page of payments, most recent first.                                       |
| [createPayment](#createpayment) | Creates and attempts to authorize a payment against the supplied payment instrument. |
| [getPayment](#getpayment)       |                                                                                      |

## listPayments

Returns a page of payments, most recent first.

- HTTP Method: `GET`
- Endpoint: `/payments`

**Parameters**

| Name   | Type                                        | Required | Description                                           |
| :----- | :------------------------------------------ | :------- | :---------------------------------------------------- |
| status | [PaymentStatus](../models/PaymentStatus.md) | ❌       | Filter by payment status.                             |
| limit  | number                                      | ❌       | Maximum number of payments to return.                 |
| cursor | string                                      | ❌       | Opaque pagination cursor returned by a previous call. |

**Return Type**

`PaymentPage`

**Example Usage Code Snippet**

```typescript
import { PaymentsApiSdk } from 'payments-api-sdk';

(async () => {
  const paymentsApiSdk = new PaymentsApiSdk({
    token: 'YOUR_TOKEN',
  });

  const paymentStatus = 'pending';

  const data = await paymentsApiSdk.payments.listPayments({
    status: paymentStatus,
    limit: 25,
    cursor: 'cursor',
  });

  console.log(data);
})();
```

## createPayment

Creates and attempts to authorize a payment against the supplied payment instrument.

- HTTP Method: `POST`
- Endpoint: `/payments`

**Parameters**

| Name | Type                                                      | Required | Description       |
| :--- | :-------------------------------------------------------- | :------- | :---------------- |
| body | [CreatePaymentRequest](../models/CreatePaymentRequest.md) | ✅       | The request body. |

**Return Type**

`Payment`

**Example Usage Code Snippet**

```typescript
import { CardInstrument, CreatePaymentRequest, Money, PaymentsApiSdk } from 'payments-api-sdk';

(async () => {
  const paymentsApiSdk = new PaymentsApiSdk({
    token: 'YOUR_TOKEN',
  });

  const currency = 'USD';

  const money: Money = {
    amountMinor: 3,
    currency: currency,
  };

  const cardInstrumentInstrumentType = 'card';

  const cardBrand = 'visa';

  const cardInstrument: CardInstrument = {
    instrumentType: cardInstrumentInstrumentType,
    last4: 'Ut c',
    brand: cardBrand,
    expiryMonth: 7,
    expiryYear: 9,
    holderName: 'holderName',
  };

  const createPaymentRequest: CreatePaymentRequest = {
    amount: money,
    instrument: cardInstrument,
    description: 'description',
    idempotencyKey: 'idempotencyKey',
  };

  const data = await paymentsApiSdk.payments.createPayment(createPaymentRequest);

  console.log(data);
})();
```

## getPayment

- HTTP Method: `GET`
- Endpoint: `/payments/{paymentId}`

**Parameters**

| Name      | Type   | Required | Description                |
| :-------- | :----- | :------- | :------------------------- |
| paymentId | string | ✅       | Identifier of the payment. |

**Return Type**

`Payment`

**Example Usage Code Snippet**

```typescript
import { PaymentsApiSdk } from 'payments-api-sdk';

(async () => {
  const paymentsApiSdk = new PaymentsApiSdk({
    token: 'YOUR_TOKEN',
  });

  const data = await paymentsApiSdk.payments.getPayment('paymentId');

  console.log(data);
})();
```
