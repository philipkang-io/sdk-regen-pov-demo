import { z } from 'zod';

export const walletInstrumentInstrumentType = z.literal('wallet');

export type WalletInstrumentInstrumentType = z.infer<typeof walletInstrumentInstrumentType>;
