import { z } from 'zod';

export const currency = z.union([z.literal('USD'), z.literal('EUR'), z.literal('GBP')]);

export type Currency = z.infer<typeof currency>;
