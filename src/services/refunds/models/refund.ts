import { z } from 'zod';
import { Money, money, moneyRequest, moneyResponse } from '../../common/money';

/**
 * Zod schema for the Refund model.
 * Defines the structure and validation rules for this data type.
 * This is the shape used in application code - what developers interact with.
 */
export const refund = z.lazy(() => {
  return z.object({
    id: z.string(),
    paymentId: z.string(),
    amount: money,
    reason: z.string().optional().nullable(),
    createdAt: z.string(),
  });
});

/**
 *
 * @typedef  {Refund} refund
 * @property {string}
 * @property {string}
 * @property {Money}
 * @property {string}
 * @property {string}
 */
export type Refund = z.infer<typeof refund>;

/**
 * Zod schema for mapping API responses to the Refund application shape.
 * Handles any property name transformations from the API schema.
 * If property names match the API schema exactly, this is identical to the application shape.
 */
export const refundResponse = z.lazy(() => {
  return z
    .object({
      id: z.string(),
      paymentId: z.string(),
      amount: moneyResponse,
      reason: z.string().optional().nullable(),
      createdAt: z.string(),
    })
    .transform((data) => ({
      id: data['id'],
      paymentId: data['paymentId'],
      amount: data['amount'],
      reason: data['reason'],
      createdAt: data['createdAt'],
    }));
});

/**
 * Zod schema for mapping the Refund application shape to API requests.
 * Handles any property name transformations required by the API schema.
 * If property names match the API schema exactly, this is identical to the application shape.
 */
export const refundRequest = z.lazy(() => {
  return z
    .object({
      id: z.string(),
      paymentId: z.string(),
      amount: moneyRequest,
      reason: z.string().optional().nullable(),
      createdAt: z.string(),
    })
    .transform((data) => ({
      id: data['id'],
      paymentId: data['paymentId'],
      amount: data['amount'],
      reason: data['reason'],
      createdAt: data['createdAt'],
    }));
});
