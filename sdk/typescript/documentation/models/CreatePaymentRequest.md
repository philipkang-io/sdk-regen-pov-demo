# CreatePaymentRequest

**Properties**

| Name           | Type                                      | Required | Description                                                                             |
| :------------- | :---------------------------------------- | :------- | :-------------------------------------------------------------------------------------- |
| amount         | [Money](Money.md)                         | ✅       |                                                                                         |
| instrument     | [PaymentInstrument](PaymentInstrument.md) | ✅       | A means of payment. The concrete shape is selected by the instrumentType discriminator. |
| description    | string                                    | ❌       | Free-text description shown on the customer statement.                                  |
| idempotencyKey | string                                    | ❌       | Client-supplied key to make retries safe.                                               |
