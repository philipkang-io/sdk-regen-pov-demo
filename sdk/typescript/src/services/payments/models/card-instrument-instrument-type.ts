import { z } from 'zod';

export const cardInstrumentInstrumentType = z.literal('card');

export type CardInstrumentInstrumentType = z.infer<typeof cardInstrumentInstrumentType>;
