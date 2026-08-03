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
