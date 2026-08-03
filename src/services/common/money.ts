import { z } from 'zod';
import { Currency, currency } from '../payments/models/currency';

/**
 * Zod schema for the Money model.
 * Defines the structure and validation rules for this data type.
 * This is the shape used in application code - what developers interact with.
 */
export const money = z.lazy(() => {
  return z.object({
    amountMinor: z.number(),
    currency: currency,
  });
});

/**
 *
 * @typedef  {Money} money
 * @property {number} - Amount in the minor unit of the currency (e.g. cents).
 * @property {Currency} - ISO 4217 currency code.
 */
export type Money = z.infer<typeof money>;

/**
 * Zod schema for mapping API responses to the Money application shape.
 * Handles any property name transformations from the API schema.
 * If property names match the API schema exactly, this is identical to the application shape.
 */
export const moneyResponse = z.lazy(() => {
  return z
    .object({
      amountMinor: z.number(),
      currency: currency,
    })
    .transform((data) => ({
      amountMinor: data['amountMinor'],
      currency: data['currency'],
    }));
});

/**
 * Zod schema for mapping the Money application shape to API requests.
 * Handles any property name transformations required by the API schema.
 * If property names match the API schema exactly, this is identical to the application shape.
 */
export const moneyRequest = z.lazy(() => {
  return z
    .object({
      amountMinor: z.number(),
      currency: currency,
    })
    .transform((data) => ({
      amountMinor: data['amountMinor'],
      currency: data['currency'],
    }));
});
