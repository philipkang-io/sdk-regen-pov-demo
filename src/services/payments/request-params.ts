import { PaymentStatus, paymentStatus } from './models/payment-status';

export interface ListPaymentsParams {
  status?: PaymentStatus;
  limit?: number;
  cursor?: string;
}
