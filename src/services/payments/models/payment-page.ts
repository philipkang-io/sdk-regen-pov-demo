import { z } from 'zod';
import { Payment, payment, paymentRequest, paymentResponse } from './payment';

/**
 * Zod schema for the PaymentPage model.
 * Defines the structure and validation rules for this data type.
 * This is the shape used in application code - what developers interact with.
 */
export const paymentPage = z.lazy(() => {
  return z.object({
    data: z.array(payment),
    nextCursor: z.string().optional().nullable(),
  });
});

/**
 *
 * @typedef  {PaymentPage} paymentPage
 * @property {Payment[]}
 * @property {string} - Cursor for the next page, or null on the last page.
 */
export type PaymentPage = z.infer<typeof paymentPage>;

/**
 * Zod schema for mapping API responses to the PaymentPage application shape.
 * Handles any property name transformations from the API schema.
 * If property names match the API schema exactly, this is identical to the application shape.
 */
export const paymentPageResponse = z.lazy(() => {
  return z
    .object({
      data: z.array(paymentResponse),
      nextCursor: z.string().optional().nullable(),
    })
    .transform((data) => ({
      data: data['data'],
      nextCursor: data['nextCursor'],
    }));
});

/**
 * Zod schema for mapping the PaymentPage application shape to API requests.
 * Handles any property name transformations required by the API schema.
 * If property names match the API schema exactly, this is identical to the application shape.
 */
export const paymentPageRequest = z.lazy(() => {
  return z
    .object({
      data: z.array(paymentRequest),
      nextCursor: z.string().optional().nullable(),
    })
    .transform((data) => ({
      data: data['data'],
      nextCursor: data['nextCursor'],
    }));
});
