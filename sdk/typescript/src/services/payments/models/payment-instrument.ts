import { z } from 'zod';
import { cardInstrument, cardInstrumentRequest, cardInstrumentResponse } from './card-instrument';
import {
  bankTransferInstrument,
  bankTransferInstrumentRequest,
  bankTransferInstrumentResponse,
} from './bank-transfer-instrument';
import {
  walletInstrument,
  walletInstrumentRequest,
  walletInstrumentResponse,
} from './wallet-instrument';

/**
 * Zod schema for the PaymentInstrument model.
 * Defines the structure and validation rules for this data type.
 * This is the shape used in application code - what developers interact with.
 */
export const paymentInstrument = z.lazy(() => {
  return z.union([cardInstrument, bankTransferInstrument, walletInstrument]);
});

/**
 * A means of payment. The concrete shape is selected by the instrumentType discriminator.
 * @typedef  {PaymentInstrument} paymentInstrument - A means of payment. The concrete shape is selected by the instrumentType discriminator. - A means of payment. The concrete shape is selected by the instrumentType discriminator.
 * @property {CardInstrument}
 * @property {BankTransferInstrument}
 * @property {WalletInstrument}
 */
export type PaymentInstrument = z.infer<typeof paymentInstrument>;

/**
 * The shape of the model mapping from the api schema into the application shape.
 * Is equal to application shape if all property names match the api schema
 */
export const paymentInstrumentResponse = z.lazy(() => {
  return z.union([
    cardInstrumentResponse,
    bankTransferInstrumentResponse,
    walletInstrumentResponse,
  ]);
});

/**
 * The shape of the model mapping from the application shape into the api schema.
 * Is equal to application shape if all property names match the api schema
 */
export const paymentInstrumentRequest = z.lazy(() => {
  return z.union([cardInstrumentRequest, bankTransferInstrumentRequest, walletInstrumentRequest]);
});
