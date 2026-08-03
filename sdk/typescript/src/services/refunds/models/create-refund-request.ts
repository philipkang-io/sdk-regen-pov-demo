import { z } from 'zod';
import { Money, money, moneyRequest, moneyResponse } from '../../common/money';

/**
 * Zod schema for the CreateRefundRequest model.
 * Defines the structure and validation rules for this data type.
 * This is the shape used in application code - what developers interact with.
 */
export const createRefundRequest = z.lazy(() => {
  return z.object({
    amount: money,
    reason: z.string().optional(),
  });
});

/**
 *
 * @typedef  {CreateRefundRequest} createRefundRequest
 * @property {Money}
 * @property {string} - Operator-supplied reason for the refund.
 */
export type CreateRefundRequest = z.infer<typeof createRefundRequest>;

/**
 * Zod schema for mapping API responses to the CreateRefundRequest application shape.
 * Handles any property name transformations from the API schema.
 * If property names match the API schema exactly, this is identical to the application shape.
 */
export const createRefundRequestResponse = z.lazy(() => {
  return z
    .object({
      amount: moneyResponse,
      reason: z.string().optional(),
    })
    .transform((data) => ({
      amount: data['amount'],
      reason: data['reason'],
    }));
});

/**
 * Zod schema for mapping the CreateRefundRequest application shape to API requests.
 * Handles any property name transformations required by the API schema.
 * If property names match the API schema exactly, this is identical to the application shape.
 */
export const createRefundRequestRequest = z.lazy(() => {
  return z
    .object({
      amount: moneyRequest,
      reason: z.string().optional(),
    })
    .transform((data) => ({
      amount: data['amount'],
      reason: data['reason'],
    }));
});
