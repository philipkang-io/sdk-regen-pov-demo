import { z } from 'zod';
import { PaymentStatus, paymentStatus } from './payment-status';
import { Money, money, moneyRequest, moneyResponse } from '../../common/money';
import {
  PaymentInstrument,
  paymentInstrument,
  paymentInstrumentRequest,
  paymentInstrumentResponse,
} from './payment-instrument';

/**
 * Zod schema for the Payment model.
 * Defines the structure and validation rules for this data type.
 * This is the shape used in application code - what developers interact with.
 */
export const payment = z.lazy(() => {
  return z.object({
    id: z.string(),
    status: paymentStatus,
    amount: money,
    instrument: paymentInstrument,
    description: z.string().optional().nullable(),
    createdAt: z.string(),
    capturedAt: z.string().optional().nullable(),
  });
});

/**
 *
 * @typedef  {Payment} payment
 * @property {string}
 * @property {PaymentStatus} - Lifecycle state of a payment.
 * @property {Money}
 * @property {PaymentInstrument} - A means of payment. The concrete shape is selected by the instrumentType discriminator.
 * @property {string}
 * @property {string}
 * @property {string} - When the payment was captured. Null until capture.
 */
export type Payment = z.infer<typeof payment>;

/**
 * Zod schema for mapping API responses to the Payment application shape.
 * Handles any property name transformations from the API schema.
 * If property names match the API schema exactly, this is identical to the application shape.
 */
export const paymentResponse = z.lazy(() => {
  return z
    .object({
      id: z.string(),
      status: paymentStatus,
      amount: moneyResponse,
      instrument: paymentInstrumentResponse,
      description: z.string().optional().nullable(),
      createdAt: z.string(),
      capturedAt: z.string().optional().nullable(),
    })
    .transform((data) => ({
      id: data['id'],
      status: data['status'],
      amount: data['amount'],
      instrument: data['instrument'],
      description: data['description'],
      createdAt: data['createdAt'],
      capturedAt: data['capturedAt'],
    }));
});

/**
 * Zod schema for mapping the Payment application shape to API requests.
 * Handles any property name transformations required by the API schema.
 * If property names match the API schema exactly, this is identical to the application shape.
 */
export const paymentRequest = z.lazy(() => {
  return z
    .object({
      id: z.string(),
      status: paymentStatus,
      amount: moneyRequest,
      instrument: paymentInstrumentRequest,
      description: z.string().optional().nullable(),
      createdAt: z.string(),
      capturedAt: z.string().optional().nullable(),
    })
    .transform((data) => ({
      id: data['id'],
      status: data['status'],
      amount: data['amount'],
      instrument: data['instrument'],
      description: data['description'],
      createdAt: data['createdAt'],
      capturedAt: data['capturedAt'],
    }));
});
