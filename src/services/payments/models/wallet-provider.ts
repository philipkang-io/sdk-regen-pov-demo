import { z } from 'zod';

export const walletProvider = z.union([z.literal('apple_pay'), z.literal('google_pay')]);

export type WalletProvider = z.infer<typeof walletProvider>;
