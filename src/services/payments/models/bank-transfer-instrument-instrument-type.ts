import { z } from 'zod';

export const bankTransferInstrumentInstrumentType = z.literal('bank_transfer');

export type BankTransferInstrumentInstrumentType = z.infer<
  typeof bankTransferInstrumentInstrumentType
>;
