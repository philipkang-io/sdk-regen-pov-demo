import { z } from 'zod';
import {
  CardInstrumentInstrumentType,
  cardInstrumentInstrumentType,
} from './card-instrument-instrument-type';
import { CardBrand, cardBrand } from './card-brand';

/**
 * Zod schema for the CardInstrument model.
 * Defines the structure and validation rules for this data type.
 * This is the shape used in application code - what developers interact with.
 */
export const cardInstrument = z.lazy(() => {
  return z.object({
    instrumentType: cardInstrumentInstrumentType,
    last4: z.string().min(4).max(4),
    brand: cardBrand,
    expiryMonth: z.number().gte(1).lte(12),
    expiryYear: z.number(),
    holderName: z.string().optional().nullable(),
  });
});

/**
 *
 * @typedef  {CardInstrument} cardInstrument
 * @property {CardInstrumentInstrumentType}
 * @property {string} - Last four digits of the card number.
 * @property {CardBrand} - Card network.
 * @property {number}
 * @property {number}
 * @property {string} - Cardholder name as printed. Absent for tokenized cards.
 */
export type CardInstrument = z.infer<typeof cardInstrument>;

/**
 * Zod schema for mapping API responses to the CardInstrument application shape.
 * Handles any property name transformations from the API schema.
 * If property names match the API schema exactly, this is identical to the application shape.
 */
export const cardInstrumentResponse = z.lazy(() => {
  return z
    .object({
      instrumentType: cardInstrumentInstrumentType,
      last4: z.string().min(4).max(4),
      brand: cardBrand,
      expiryMonth: z.number().gte(1).lte(12),
      expiryYear: z.number(),
      holderName: z.string().optional().nullable(),
    })
    .transform((data) => ({
      instrumentType: data['instrumentType'],
      last4: data['last4'],
      brand: data['brand'],
      expiryMonth: data['expiryMonth'],
      expiryYear: data['expiryYear'],
      holderName: data['holderName'],
    }));
});

/**
 * Zod schema for mapping the CardInstrument application shape to API requests.
 * Handles any property name transformations required by the API schema.
 * If property names match the API schema exactly, this is identical to the application shape.
 */
export const cardInstrumentRequest = z.lazy(() => {
  return z
    .object({
      instrumentType: cardInstrumentInstrumentType,
      last4: z.string().min(4).max(4),
      brand: cardBrand,
      expiryMonth: z.number().gte(1).lte(12),
      expiryYear: z.number(),
      holderName: z.string().optional().nullable(),
    })
    .transform((data) => ({
      instrumentType: data['instrumentType'],
      last4: data['last4'],
      brand: data['brand'],
      expiryMonth: data['expiryMonth'],
      expiryYear: data['expiryYear'],
      holderName: data['holderName'],
    }));
});
