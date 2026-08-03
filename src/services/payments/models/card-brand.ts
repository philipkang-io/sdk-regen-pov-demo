import { z } from 'zod';

export const cardBrand = z.union([z.literal('visa'), z.literal('mastercard'), z.literal('amex')]);

export type CardBrand = z.infer<typeof cardBrand>;
