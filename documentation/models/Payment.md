# Payment

**Properties**

| Name              | Type                                      | Required | Description                                                                             |
| :---------------- | :---------------------------------------- | :------- | :-------------------------------------------------------------------------------------- |
| id                | string                                    | ✅       |                                                                                         |
| status            | [PaymentStatus](PaymentStatus.md)         | ✅       | Lifecycle state of a payment.                                                           |
| amount            | [Money](Money.md)                         | ✅       |                                                                                         |
| instrument        | [PaymentInstrument](PaymentInstrument.md) | ✅       | A means of payment. The concrete shape is selected by the instrumentType discriminator. |
| createdAt         | string                                    | ✅       |                                                                                         |
| description       | string                                    | ❌       |                                                                                         |
| capturedAt        | string                                    | ❌       | When the payment was captured. Null until capture.                                      |
| merchantReference | string                                    | ❌       | Merchant's own reference for this payment.                                              |
