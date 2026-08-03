import { z } from 'zod';

export const paymentStatus = z.union([
  z.literal('pending'),
  z.literal('authorized'),
  z.literal('captured'),
  z.literal('failed'),
]);

export type PaymentStatus = z.infer<typeof paymentStatus>;
