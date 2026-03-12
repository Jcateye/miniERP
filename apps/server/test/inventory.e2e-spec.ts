import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types';
import { ApiExceptionFilter } from '../src/common/filters/api-exception.filter';
import { ApiResponseInterceptor } from '../src/common/interceptors/api-response.interceptor';
import { TenantContextService } from '../src/common/tenant/tenant-context.service';
import { InventoryPostingService } from '../src/modules/inventory/application/inventory-posting.service';
import { InventoryController } from '../src/modules/inventory/controllers/inventory.controller';
import { InMemoryInventoryConsistencyStore } from '../src/modules/inventory/infrastructure/in-memory-inventory-consistency.store';

jest.setTimeout(20_000);

interface InventoryMovementBody {
  readonly data: {
    readonly referenceType: 'GRN' | 'OUT';
    readonly quantity: number;
    readonly balance: {
      readonly onHand: number;
    };
  };
}

interface InventoryBalancesBody {
  readonly data: ReadonlyArray<{
    readonly skuId: string;
    readonly warehouseId: string;
    readonly onHand: number;
  }>;
}

interface InventoryLedgerBody {
  readonly data: ReadonlyArray<{
    readonly referenceType: 'GRN' | 'OUT';
    readonly quantityDelta: number;
    readonly skuId: string;
    readonly warehouseId: string;
  }>;
}

interface InventoryErrorBody {
  readonly error: {
    readonly category: string;
    readonly code: string;
    readonly message: string;
    readonly details: Record<string, unknown>;
  };
}

function getRequestApp(app: INestApplication): App {
  return app.getHttpServer() as App;
}

describe('Inventory in/out loop (e2e)', () => {
  let app: INestApplication | undefined;
  let tenantContextService: {
    getRequiredContext: jest.Mock;
  };

  beforeAll(async () => {
    tenantContextService = {
      getRequiredContext: jest.fn(),
    };

    const inventoryStore = new InMemoryInventoryConsistencyStore();
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [InventoryController],
      providers: [
        InventoryPostingService,
        {
          provide: TenantContextService,
          useValue: tenantContextService,
        },
        {
          provide: 'InventoryConsistencyStore',
          useValue: inventoryStore,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalInterceptors(new ApiResponseInterceptor());
    app.useGlobalFilters(new ApiExceptionFilter());
    await app.init();
  });

  beforeEach(() => {
    tenantContextService.getRequiredContext.mockImplementation(() => ({
      tenantId: 'tenant-default',
      actorId: 'user-001',
      requestId: 'req-default',
    }));
  });

  afterAll(async () => {
    await app?.close();
    app = undefined;
  });

  it('completes inbound 100 then outbound 30 and keeps ledger queryable', async () => {
    const skuId = 'SKU-LOOP';
    const warehouseId = 'WH-LOOP';
    const http = request(getRequestApp(app!));

    tenantContextService.getRequiredContext
      .mockReturnValueOnce({
        tenantId: 'tenant-loop',
        actorId: 'user-001',
        requestId: 'req-inbound-100',
      })
      .mockReturnValueOnce({
        tenantId: 'tenant-loop',
        actorId: 'user-001',
        requestId: 'req-balance-100',
      })
      .mockReturnValueOnce({
        tenantId: 'tenant-loop',
        actorId: 'user-001',
        requestId: 'req-outbound-30',
      })
      .mockReturnValueOnce({
        tenantId: 'tenant-loop',
        actorId: 'user-001',
        requestId: 'req-balance-70',
      })
      .mockReturnValueOnce({
        tenantId: 'tenant-loop',
        actorId: 'user-001',
        requestId: 'req-ledger-loop',
      });

    await http
      .post('/api/v1/inventory/inbound')
      .set('idempotency-key', 'idem-inbound-100')
      .send({ skuId, warehouseId, quantity: 100 })
      .expect(201)
      .expect((response) => {
        const body = response.body as InventoryMovementBody;

        expect(body.data.referenceType).toBe('GRN');
        expect(body.data.quantity).toBe(100);
        expect(body.data.balance.onHand).toBe(100);
      });

    await http
      .get('/api/v1/inventory/balances')
      .query({ skuId, warehouseId })
      .expect(200)
      .expect((response) => {
        const body = response.body as InventoryBalancesBody;

        expect(body.data).toEqual([{ skuId, warehouseId, onHand: 100 }]);
      });

    await http
      .post('/api/v1/inventory/outbound')
      .set('idempotency-key', 'idem-outbound-30')
      .send({ skuId, warehouseId, quantity: 30 })
      .expect(201)
      .expect((response) => {
        const body = response.body as InventoryMovementBody;

        expect(body.data.referenceType).toBe('OUT');
        expect(body.data.quantity).toBe(30);
        expect(body.data.balance.onHand).toBe(70);
      });

    await http
      .get('/api/v1/inventory/balances')
      .query({ skuId, warehouseId })
      .expect(200)
      .expect((response) => {
        const body = response.body as InventoryBalancesBody;

        expect(body.data).toEqual([{ skuId, warehouseId, onHand: 70 }]);
      });

    await http
      .get('/api/v1/inventory/ledger')
      .query({ skuId, warehouseId })
      .expect(200)
      .expect((response) => {
        const body = response.body as InventoryLedgerBody;

        expect(body.data).toHaveLength(2);
        expect(body.data[0]).toEqual(
          expect.objectContaining({
            referenceType: 'OUT',
            quantityDelta: -30,
            skuId,
            warehouseId,
          }),
        );
        expect(body.data[1]).toEqual(
          expect.objectContaining({
            referenceType: 'GRN',
            quantityDelta: 100,
            skuId,
            warehouseId,
          }),
        );
      });
  });

  it('returns clear conflict when outbound quantity exceeds on-hand', async () => {
    const skuId = 'SKU-INSUFFICIENT';
    const warehouseId = 'WH-INSUFFICIENT';
    const http = request(getRequestApp(app!));

    tenantContextService.getRequiredContext
      .mockReturnValueOnce({
        tenantId: 'tenant-insufficient',
        actorId: 'user-001',
        requestId: 'req-insufficient-seed',
      })
      .mockReturnValueOnce({
        tenantId: 'tenant-insufficient',
        actorId: 'user-001',
        requestId: 'req-insufficient-out',
      });

    await http
      .post('/api/v1/inventory/inbound')
      .set('idempotency-key', 'idem-seed-10')
      .send({ skuId, warehouseId, quantity: 10 })
      .expect(201);

    await http
      .post('/api/v1/inventory/outbound')
      .set('idempotency-key', 'idem-outbound-11')
      .send({ skuId, warehouseId, quantity: 11 })
      .expect(409)
      .expect((response) => {
        const body = response.body as InventoryErrorBody;

        expect(body.error.category).toBe('conflict');
        expect(body.error.code).toBe('CONFLICT_INSUFFICIENT_STOCK');
        expect(body.error.message).toBe('库存不足');
        expect(body.error.details).toEqual({
          skuId,
          warehouseId,
          available: 10,
          required: 11,
        });
      });
  });
});
