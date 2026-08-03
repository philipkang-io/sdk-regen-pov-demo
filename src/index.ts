import { Environment } from './http/environment';
import { SdkConfig } from './http/types';
import { PaymentsService } from './services/payments';
import { RefundsService } from './services/refunds';

export * from './services/payments';
export * from './services/refunds';
export * from './services/common';

export * from './http';
export { Environment } from './http/environment';

export class PaymentsApiSdk {
  public readonly payments: PaymentsService;

  public readonly refunds: RefundsService;

  constructor(public config: SdkConfig) {
    this.payments = new PaymentsService(this.config);

    this.refunds = new RefundsService(this.config);
  }

  set baseUrl(baseUrl: string) {
    this.payments.baseUrl = baseUrl;
    this.refunds.baseUrl = baseUrl;
  }

  set environment(environment: Environment) {
    this.payments.baseUrl = environment;
    this.refunds.baseUrl = environment;
  }

  set timeoutMs(timeoutMs: number) {
    this.payments.timeoutMs = timeoutMs;
    this.refunds.timeoutMs = timeoutMs;
  }

  set token(token: string) {
    this.payments.token = token;
    this.refunds.token = token;
  }
}

// c029837e0e474b76bc487506e8799df5e3335891efe4fb02bda7a1441840310c
