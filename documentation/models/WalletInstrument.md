# WalletInstrument

**Properties**

| Name           | Type                                | Required | Description                   |
| :------------- | :---------------------------------- | :------- | :---------------------------- |
| instrumentType | WalletInstrumentInstrumentType      | ✅       |                               |
| provider       | [WalletProvider](WalletProvider.md) | ✅       | Wallet provider.              |
| accountHandle  | string                              | ❌       | Masked wallet account handle. |

# WalletInstrumentInstrumentType

**Properties**

| Name   | Type   | Required | Description |
| :----- | :----- | :------- | :---------- |
| WALLET | string | ✅       | "wallet"    |
