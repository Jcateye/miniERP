import { Injectable } from '@nestjs/common';
import type { DocumentStatusCode } from '@minierp/shared';
import {
  getCanonicalTradingDocumentType,
  getTradingModuleBoundary,
  isTradingBoundaryStatus,
  type TradingBoundaryStatus,
  type TradingLegacyDocumentType,
  type TradingModule,
} from '../domain/trading-document.catalog';

@Injectable()
export class TradingDocumentCatalogService {
  getBoundary(module: TradingModule) {
    return getTradingModuleBoundary(module);
  }

  getCanonicalType(legacyType: TradingLegacyDocumentType) {
    return getCanonicalTradingDocumentType(legacyType);
  }

  isBoundaryStatus<M extends TradingModule>(
    module: M,
    status: DocumentStatusCode,
  ): status is TradingBoundaryStatus<M> {
    return isTradingBoundaryStatus(module, status);
  }
}
