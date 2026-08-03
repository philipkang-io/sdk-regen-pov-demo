# BankTransferInstrument

**Properties**

| Name             | Type                                 | Required | Description                                      |
| :--------------- | :----------------------------------- | :------- | :----------------------------------------------- |
| instrumentType   | BankTransferInstrumentInstrumentType | ✅       |                                                  |
| accountLast4     | string                               | ✅       |                                                  |
| bankName         | string                               | ✅       |                                                  |
| mandateReference | string                               | ❌       | Direct-debit mandate reference, when one exists. |

# BankTransferInstrumentInstrumentType

**Properties**

| Name          | Type   | Required | Description     |
| :------------ | :----- | :------- | :-------------- |
| BANK_TRANSFER | string | ✅       | "bank_transfer" |
