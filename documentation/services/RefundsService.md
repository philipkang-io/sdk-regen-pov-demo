# RefundsService

A list of all methods in the `RefundsService` service. Click on the method name to view detailed information about that method.

| Methods                         | Description                                                                                         |
| :------------------------------ | :-------------------------------------------------------------------------------------------------- |
| [refundPayment](#refundpayment) | Refunds all or part of a captured payment. Partial refunds are permitted up to the captured amount. |

## refundPayment

Refunds all or part of a captured payment. Partial refunds are permitted up to the captured amount.

- HTTP Method: `POST`
- Endpoint: `/payments/{paymentId}/refunds`

**Parameters**

| Name      | Type                                                    | Required | Description                               |
| :-------- | :------------------------------------------------------ | :------- | :---------------------------------------- |
| body      | [CreateRefundRequest](../models/CreateRefundRequest.md) | ✅       | The request body.                         |
| paymentId | string                                                  | ✅       | Identifier of the payment being refunded. |

**Return Type**

`Refund`

**Example Usage Code Snippet**

```typescript
import { CreateRefundRequest, Money, PaymentsApiSdk } from 'payments-api-sdk';

(async () => {
  const paymentsApiSdk = new PaymentsApiSdk({
    token: 'YOUR_TOKEN',
  });

  const currency = 'USD';

  const money: Money = {
    amountMinor: 3,
    currency: currency,
  };

  const createRefundRequest: CreateRefundRequest = {
    amount: money,
    reason: 'reason',
  };

  const data = await paymentsApiSdk.refunds.refundPayment('paymentId', createRefundRequest);

  console.log(data);
})();
```
