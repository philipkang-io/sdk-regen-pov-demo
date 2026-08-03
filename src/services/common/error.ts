import { z } from 'zod';
import { ThrowableError } from '../../http/errors/throwable-error';

export type IErrorSchema = {
  code: string;
  message: string;
  details?: string | null;
};

export const errorResponse = z.lazy(() => {
  return z
    .object({
      code: z.string(),
      message: z.string(),
      details: z.string().optional().nullable(),
    })
    .transform((data) => ({
      code: data['code'],
      message: data['message'],
      details: data['details'],
    }));
});

export class Error extends ThrowableError {
  public code!: string;

  public details?: string | null;
  constructor(
    public message: string,
    protected response?: unknown,
  ) {
    super(message);
  }

  static from(message: string, response?: unknown): Error {
    const error = new Error(message, response);
    const result = errorResponse.safeParse(response);
    const parsedResponse = (result.success ? result.data : response || {}) as z.infer<
      typeof errorResponse
    >;

    error.code = parsedResponse.code;
    error.message = parsedResponse.message || '';
    error.details = parsedResponse.details;

    return error;
  }

  public throw() {
    const error = Error.from(this.message, this.response);
    error.metadata = this.metadata;
    throw error;
  }
}
