import { z } from 'zod';
import { BaseService } from '../base-service';
import { ContentType, HttpResponse, SdkConfig } from '../../http/types';
import { RequestBuilder } from '../../http/transport/request-builder';
import { SerializationStyle } from '../../http/serialization/base-serializer';
import { ThrowableError } from '../../http/errors/throwable-error';
import { Environment } from '../../http/environment';
import { PaymentPage, paymentPageResponse } from './models/payment-page';
import { Error } from '../common/error';
import { ListPaymentsParams } from './request-params';
import { CreatePaymentRequest, createPaymentRequestRequest } from './models/create-payment-request';
import { Payment, paymentResponse } from './models/payment';

/**
 * Service class for PaymentsService operations.
 * Provides methods to interact with PaymentsService-related API endpoints.
 * All methods return promises and handle request/response serialization automatically.
 */
export class PaymentsService extends BaseService {
  protected listPaymentsConfig?: Partial<SdkConfig>;

  protected createPaymentConfig?: Partial<SdkConfig>;

  protected getPaymentConfig?: Partial<SdkConfig>;

  /**
   * Sets method-level configuration for listPayments.
   * @param config - Partial configuration to override service-level defaults
   * @returns This service instance for method chaining
   */
  setListPaymentsConfig(config: Partial<SdkConfig>): this {
    this.listPaymentsConfig = config;
    return this;
  }

  /**
   * Sets method-level configuration for createPayment.
   * @param config - Partial configuration to override service-level defaults
   * @returns This service instance for method chaining
   */
  setCreatePaymentConfig(config: Partial<SdkConfig>): this {
    this.createPaymentConfig = config;
    return this;
  }

  /**
   * Sets method-level configuration for getPayment.
   * @param config - Partial configuration to override service-level defaults
   * @returns This service instance for method chaining
   */
  setGetPaymentConfig(config: Partial<SdkConfig>): this {
    this.getPaymentConfig = config;
    return this;
  }

  /**
   * Returns a page of payments, most recent first.
   * @param {PaymentStatus} [params.status] - Filter by payment status.
   * @param {number} [params.limit] - Maximum number of payments to return.
   * @param {string} [params.cursor] - Opaque pagination cursor returned by a previous call.
   * @param {Partial<SdkConfig>} [requestConfig] - The request configuration for retry and validation.
   * @returns {Promise<HttpResponse<PaymentPage>>} - A page of payments.
   */
  async listPayments(
    params?: ListPaymentsParams,
    requestConfig?: Partial<SdkConfig>,
  ): Promise<PaymentPage> {
    const resolvedConfig = this.getResolvedConfig(this.listPaymentsConfig, requestConfig);
    z.object({
      status: z.unknown().optional(),
      limit: z.number().optional(),
      cursor: z.string().optional(),
    }).parse(params ?? {});
    const request = new RequestBuilder()
      .setConfig(resolvedConfig)
      .setBaseUrl(resolvedConfig)
      .setMethod('GET')
      .setPath('/payments')
      .setRequestSchema(z.any())
      .addAccessTokenAuth(resolvedConfig?.token)
      .setRequestContentType(ContentType.Json)
      .addResponse({
        schema: paymentPageResponse,
        contentType: ContentType.Json,
        status: 200,
      })
      .addError({
        error: Error,
        contentType: ContentType.Json,
        status: 400,
      })
      .addQueryParam({
        key: 'status',
        value: params?.status,
      })
      .addQueryParam({
        key: 'limit',
        value: params?.limit,
      })
      .addQueryParam({
        key: 'cursor',
        value: params?.cursor,
      })
      .build();
    return this.client.callDirect<PaymentPage>(request);
  }

  /**
   * Creates and attempts to authorize a payment against the supplied payment instrument.
   * @param {Partial<SdkConfig>} [requestConfig] - The request configuration for retry and validation.
   * @returns {Promise<HttpResponse<Payment>>} - The created payment.
   */
  async createPayment(
    body: CreatePaymentRequest,
    requestConfig?: Partial<SdkConfig>,
  ): Promise<Payment> {
    const resolvedConfig = this.getResolvedConfig(this.createPaymentConfig, requestConfig);
    const request = new RequestBuilder()
      .setConfig(resolvedConfig)
      .setBaseUrl(resolvedConfig)
      .setMethod('POST')
      .setPath('/payments')
      .setRequestSchema(createPaymentRequestRequest)
      .addAccessTokenAuth(resolvedConfig?.token)
      .setRequestContentType(ContentType.Json)
      .addResponse({
        schema: paymentResponse,
        contentType: ContentType.Json,
        status: 201,
      })
      .addError({
        error: Error,
        contentType: ContentType.Json,
        status: 400,
      })
      .addError({
        error: Error,
        contentType: ContentType.Json,
        status: 422,
      })
      .addHeaderParam({ key: 'Content-Type', value: 'application/json' })
      .addBody(body)
      .build();
    return this.client.callDirect<Payment>(request);
  }

  /**
   *
   * @param {string} paymentId - Identifier of the payment.
   * @param {Partial<SdkConfig>} [requestConfig] - The request configuration for retry and validation.
   * @returns {Promise<HttpResponse<Payment>>} - The requested payment.
   */
  async getPayment(paymentId: string, requestConfig?: Partial<SdkConfig>): Promise<Payment> {
    const resolvedConfig = this.getResolvedConfig(this.getPaymentConfig, requestConfig);
    const request = new RequestBuilder()
      .setConfig(resolvedConfig)
      .setBaseUrl(resolvedConfig)
      .setMethod('GET')
      .setPath('/payments/{paymentId}')
      .setRequestSchema(z.any())
      .addAccessTokenAuth(resolvedConfig?.token)
      .setRequestContentType(ContentType.Json)
      .addResponse({
        schema: paymentResponse,
        contentType: ContentType.Json,
        status: 200,
      })
      .addError({
        error: Error,
        contentType: ContentType.Json,
        status: 404,
      })
      .addPathParam({
        key: 'paymentId',
        value: paymentId,
      })
      .build();
    return this.client.callDirect<Payment>(request);
  }

  // ==== CUSTOM CODE — hand-written, not generated ======================
  // Everything between these markers is the developer's own work. The
  // point of the harness is that it is still here, and still compiling,
  // after the spec has changed underneath it N times.

  /**
   * Convenience helper: create a payment and return the settled record.
   * Chains createPayment with a follow-up getPayment, so callers get the
   * current state rather than the initial 201 body.
   */
  async createAndFetchPayment(
    body: CreatePaymentRequest,
    requestConfig?: Partial<SdkConfig>,
  ): Promise<Payment> {
    const created = await this.createPayment(body, requestConfig);
    return this.getPayment(created.id, requestConfig);
  }

  /**
   * Domain helper over the discriminated union. Deliberately touches the
   * polymorphic type, so a union change (mutation m04 adds a fourth
   * variant) exercises this code path too.
   */
  static describeInstrument(instrument: Payment['instrument']): string {
    const i = instrument as { instrumentType?: string };
    switch (i?.instrumentType) {
      case 'card':
        return 'card';
      case 'bank_transfer':
        return 'bank transfer';
      case 'wallet':
        return 'wallet';
      default:
        // New variants land here rather than throwing — forward-compatible
        // by construction, which is the behaviour we want to preserve.
        return `other (${i?.instrumentType ?? 'unknown'})`;
    }
  }
  // ==== END CUSTOM CODE ================================================

  /** Second marker, landed via a MERGE COMMIT rather than a squash. */
  static mergeCommitMarker(): string { return 'preserved-via-merge-commit'; }

}
