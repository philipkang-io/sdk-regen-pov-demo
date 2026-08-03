import { z } from 'zod';
import { Money, money, moneyRequest, moneyResponse } from '../../common/money';
import {
  PaymentInstrument,
  paymentInstrument,
  paymentInstrumentRequest,
  paymentInstrumentResponse,
} from './payment-instrument';

/**
 * Zod schema for the CreatePaymentRequest model.
 * Defines the structure and validation rules for this data type.
 * This is the shape used in application code - what developers interact with.
 */
export const createPaymentRequest = z.lazy(() => {
  return z.object({
    amount: money,
    instrument: paymentInstrument,
    description: z.string().optional(),
    idempotencyKey: z.string().optional(),
  });
});

/**
 *
 * @typedef  {CreatePaymentRequest} createPaymentRequest
 * @property {Money}
 * @property {PaymentInstrument} - A means of payment. The concrete shape is selected by the instrumentType discriminator.
 * @property {string} - Free-text description shown on the customer statement.
 * @property {string} - Client-supplied key to make retries safe.
 */
export type CreatePaymentRequest = z.infer<typeof createPaymentRequest>;

/**
 * Zod schema for mapping API responses to the CreatePaymentRequest application shape.
 * Handles any property name transformations from the API schema.
 * If property names match the API schema exactly, this is identical to the application shape.
 */
export const createPaymentRequestResponse = z.lazy(() => {
  return z
    .object({
      amount: moneyResponse,
      instrument: paymentInstrumentResponse,
      description: z.string().optional(),
      idempotencyKey: z.string().optional(),
    })
    .transform((data) => ({
      amount: data['amount'],
      instrument: data['instrument'],
      description: data['description'],
      idempotencyKey: data['idempotencyKey'],
    }));
});

/**
 * Zod schema for mapping the CreatePaymentRequest application shape to API requests.
 * Handles any property name transformations required by the API schema.
 * If property names match the API schema exactly, this is identical to the application shape.
 */
export const createPaymentRequestRequest = z.lazy(() => {
  return z
    .object({
      amount: moneyRequest,
      instrument: paymentInstrumentRequest,
      description: z.string().optional(),
      idempotencyKey: z.string().optional(),
    })
    .transform((data) => ({
      amount: data['amount'],
      instrument: data['instrument'],
      description: data['description'],
      idempotencyKey: data['idempotencyKey'],
    }));
});
