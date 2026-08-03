import { z } from 'zod';
import {
  BankTransferInstrumentInstrumentType,
  bankTransferInstrumentInstrumentType,
} from './bank-transfer-instrument-instrument-type';

/**
 * Zod schema for the BankTransferInstrument model.
 * Defines the structure and validation rules for this data type.
 * This is the shape used in application code - what developers interact with.
 */
export const bankTransferInstrument = z.lazy(() => {
  return z.object({
    instrumentType: bankTransferInstrumentInstrumentType,
    accountLast4: z.string().min(4).max(4),
    bankName: z.string(),
    mandateReference: z.string().optional().nullable(),
  });
});

/**
 *
 * @typedef  {BankTransferInstrument} bankTransferInstrument
 * @property {BankTransferInstrumentInstrumentType}
 * @property {string}
 * @property {string}
 * @property {string} - Direct-debit mandate reference, when one exists.
 */
export type BankTransferInstrument = z.infer<typeof bankTransferInstrument>;

/**
 * Zod schema for mapping API responses to the BankTransferInstrument application shape.
 * Handles any property name transformations from the API schema.
 * If property names match the API schema exactly, this is identical to the application shape.
 */
export const bankTransferInstrumentResponse = z.lazy(() => {
  return z
    .object({
      instrumentType: bankTransferInstrumentInstrumentType,
      accountLast4: z.string().min(4).max(4),
      bankName: z.string(),
      mandateReference: z.string().optional().nullable(),
    })
    .transform((data) => ({
      instrumentType: data['instrumentType'],
      accountLast4: data['accountLast4'],
      bankName: data['bankName'],
      mandateReference: data['mandateReference'],
    }));
});

/**
 * Zod schema for mapping the BankTransferInstrument application shape to API requests.
 * Handles any property name transformations required by the API schema.
 * If property names match the API schema exactly, this is identical to the application shape.
 */
export const bankTransferInstrumentRequest = z.lazy(() => {
  return z
    .object({
      instrumentType: bankTransferInstrumentInstrumentType,
      accountLast4: z.string().min(4).max(4),
      bankName: z.string(),
      mandateReference: z.string().optional().nullable(),
    })
    .transform((data) => ({
      instrumentType: data['instrumentType'],
      accountLast4: data['accountLast4'],
      bankName: data['bankName'],
      mandateReference: data['mandateReference'],
    }));
});
