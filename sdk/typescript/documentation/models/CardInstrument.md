# CardInstrument

**Properties**

| Name           | Type                         | Required | Description                                             |
| :------------- | :--------------------------- | :------- | :------------------------------------------------------ |
| instrumentType | CardInstrumentInstrumentType | ✅       |                                                         |
| last4          | string                       | ✅       | Last four digits of the card number.                    |
| brand          | [CardBrand](CardBrand.md)    | ✅       | Card network.                                           |
| expiryMonth    | number                       | ✅       |                                                         |
| expiryYear     | number                       | ✅       |                                                         |
| holderName     | string                       | ❌       | Cardholder name as printed. Absent for tokenized cards. |

# CardInstrumentInstrumentType

**Properties**

| Name | Type   | Required | Description |
| :--- | :----- | :------- | :---------- |
| CARD | string | ✅       | "card"      |
