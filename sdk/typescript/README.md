# PaymentsApi TypeScript SDK 1.0.0

Welcome to the PaymentsApi SDK documentation. This guide will help you get started with integrating and using the PaymentsApi SDK in your project.

## Versions

- SDK version: `1.0.0`

## About the API

Reference payments API used to demonstrate SDK generation and regeneration safety. Deliberately includes a discriminated union (paymentInstrument) because polymorphism is where SDK generators most often fail.

## Table of Contents

- [Setup & Configuration](#setup--configuration)
  - [Supported Language Versions](#supported-language-versions)
  - [Installation](#installation)
- [Authentication](#authentication)
  - [Access Token Authentication](#access-token-authentication)
- [Setting a Custom Timeout](#setting-a-custom-timeout)
- [Sample Usage](#sample-usage)
- [Services](#services)
- [Models](#models)

# Setup & Configuration

## Supported Language Versions

This SDK is compatible with the following versions: `TypeScript >= 4.8.4`

## Installation

To get started with the SDK, we recommend installing using `npm` or `yarn`:

```bash
npm install payments-api
```

or

```bash
yarn add payments-api
```

## Authentication

### Access Token Authentication

The PaymentsApi API uses an Access Token for authentication.

This token must be provided to authenticate your requests to the API.

#### Setting the Access Token

When you initialize the SDK, you can set the access token as follows:

```ts
const sdk = new PaymentsApi({ token: 'YOUR_TOKEN' });
```

If you need to set or update the access token after initializing the SDK, you can use:

```ts
const sdk = new PaymentsApi();
sdk.token = 'YOUR_TOKEN';
```

## Setting a Custom Timeout

You can set a custom timeout for the SDK's HTTP requests as follows:

```ts
const paymentsApi = new PaymentsApi({ timeout: 10000 });
```

# Sample Usage

Below is a comprehensive example demonstrating how to authenticate and call a simple endpoint:

```ts
import { PaymentsApi } from 'payments-api';

(async () => {
  const paymentsApi = new PaymentsApi({
    token: 'YOUR_TOKEN',
  });

  const paymentStatus = 'pending';

  const data = await paymentsApi.payments.listPayments({
    status: paymentStatus,
    limit: 25,
    cursor: 'cursor',
  });

  console.log(data);
})();
```

## Services

The SDK provides various services to interact with the API.

<details>
<summary>Below is a list of all available services with links to their detailed documentation:</summary>

| Name                                                         |
| :----------------------------------------------------------- |
| [PaymentsService](documentation/services/PaymentsService.md) |
| [RefundsService](documentation/services/RefundsService.md)   |

</details>

## Models

The SDK includes several models that represent the data structures used in API requests and responses. These models help in organizing and managing the data efficiently.

<details>
<summary>Below is a list of all available models with links to their detailed documentation:</summary>

| Name                                                                     | Description                   |
| :----------------------------------------------------------------------- | :---------------------------- |
| [PaymentPage](documentation/models/PaymentPage.md)                       |                               |
| [Payment](documentation/models/Payment.md)                               |                               |
| [PaymentStatus](documentation/models/PaymentStatus.md)                   | Lifecycle state of a payment. |
| [Money](documentation/models/Money.md)                                   |                               |
| [Currency](documentation/models/Currency.md)                             | ISO 4217 currency code.       |
| [CardInstrument](documentation/models/CardInstrument.md)                 |                               |
| [CardBrand](documentation/models/CardBrand.md)                           | Card network.                 |
| [BankTransferInstrument](documentation/models/BankTransferInstrument.md) |                               |
| [WalletInstrument](documentation/models/WalletInstrument.md)             |                               |
| [WalletProvider](documentation/models/WalletProvider.md)                 | Wallet provider.              |
| [Error](documentation/models/Error.md)                                   |                               |
| [CreatePaymentRequest](documentation/models/CreatePaymentRequest.md)     |                               |
| [Refund](documentation/models/Refund.md)                                 |                               |
| [Money](documentation/models/Money.md)                                   |                               |
| [CreateRefundRequest](documentation/models/CreateRefundRequest.md)       |                               |
| [Error](documentation/models/Error.md)                                   |                               |

</details>
