import { z } from 'zod';
import {
  WalletInstrumentInstrumentType,
  walletInstrumentInstrumentType,
} from './wallet-instrument-instrument-type';
import { WalletProvider, walletProvider } from './wallet-provider';

/**
 * Zod schema for the WalletInstrument model.
 * Defines the structure and validation rules for this data type.
 * This is the shape used in application code - what developers interact with.
 */
export const walletInstrument = z.lazy(() => {
  return z.object({
    instrumentType: walletInstrumentInstrumentType,
    provider: walletProvider,
    accountHandle: z.string().optional().nullable(),
  });
});

/**
 *
 * @typedef  {WalletInstrument} walletInstrument
 * @property {WalletInstrumentInstrumentType}
 * @property {WalletProvider} - Wallet provider.
 * @property {string} - Masked wallet account handle.
 */
export type WalletInstrument = z.infer<typeof walletInstrument>;

/**
 * Zod schema for mapping API responses to the WalletInstrument application shape.
 * Handles any property name transformations from the API schema.
 * If property names match the API schema exactly, this is identical to the application shape.
 */
export const walletInstrumentResponse = z.lazy(() => {
  return z
    .object({
      instrumentType: walletInstrumentInstrumentType,
      provider: walletProvider,
      accountHandle: z.string().optional().nullable(),
    })
    .transform((data) => ({
      instrumentType: data['instrumentType'],
      provider: data['provider'],
      accountHandle: data['accountHandle'],
    }));
});

/**
 * Zod schema for mapping the WalletInstrument application shape to API requests.
 * Handles any property name transformations required by the API schema.
 * If property names match the API schema exactly, this is identical to the application shape.
 */
export const walletInstrumentRequest = z.lazy(() => {
  return z
    .object({
      instrumentType: walletInstrumentInstrumentType,
      provider: walletProvider,
      accountHandle: z.string().optional().nullable(),
    })
    .transform((data) => ({
      instrumentType: data['instrumentType'],
      provider: data['provider'],
      accountHandle: data['accountHandle'],
    }));
});
