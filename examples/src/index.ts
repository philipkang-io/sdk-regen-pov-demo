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
