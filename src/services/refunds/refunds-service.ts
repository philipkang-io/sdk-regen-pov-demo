import { z } from 'zod';
import { BaseService } from '../base-service';
import { ContentType, HttpResponse, SdkConfig } from '../../http/types';
import { RequestBuilder } from '../../http/transport/request-builder';
import { SerializationStyle } from '../../http/serialization/base-serializer';
import { ThrowableError } from '../../http/errors/throwable-error';
import { Environment } from '../../http/environment';
import { CreateRefundRequest, createRefundRequestRequest } from './models/create-refund-request';
import { Refund, refundResponse } from './models/refund';
import { Error } from '../common/error';

/**
 * Service class for RefundsService operations.
 * Provides methods to interact with RefundsService-related API endpoints.
 * All methods return promises and handle request/response serialization automatically.
 */
export class RefundsService extends BaseService {
  protected refundPaymentConfig?: Partial<SdkConfig>;

  /**
   * Sets method-level configuration for refundPayment.
   * @param config - Partial configuration to override service-level defaults
   * @returns This service instance for method chaining
   */
  setRefundPaymentConfig(config: Partial<SdkConfig>): this {
    this.refundPaymentConfig = config;
    return this;
  }

  /**
   * Refunds all or part of a captured payment. Partial refunds are permitted up to the captured amount.
   * @param {string} paymentId - Identifier of the payment being refunded.
   * @param {Partial<SdkConfig>} [requestConfig] - The request configuration for retry and validation.
   * @returns {Promise<HttpResponse<Refund>>} - The created refund.
   */
  async refundPayment(
    paymentId: string,
    body: CreateRefundRequest,
    requestConfig?: Partial<SdkConfig>,
  ): Promise<Refund> {
    const resolvedConfig = this.getResolvedConfig(this.refundPaymentConfig, requestConfig);
    const request = new RequestBuilder()
      .setConfig(resolvedConfig)
      .setBaseUrl(resolvedConfig)
      .setMethod('POST')
      .setPath('/payments/{paymentId}/refunds')
      .setRequestSchema(createRefundRequestRequest)
      .addAccessTokenAuth(resolvedConfig?.token)
      .setRequestContentType(ContentType.Json)
      .addResponse({
        schema: refundResponse,
        contentType: ContentType.Json,
        status: 201,
      })
      .addError({
        error: Error,
        contentType: ContentType.Json,
        status: 404,
      })
      .addError({
        error: Error,
        contentType: ContentType.Json,
        status: 422,
      })
      .addPathParam({
        key: 'paymentId',
        value: paymentId,
      })
      .addHeaderParam({ key: 'Content-Type', value: 'application/json' })
      .addBody(body)
      .build();
    return this.client.callDirect<Refund>(request);
  }
}
