import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const now = new Date();

  await prisma.tenant.upsert({
    where: { code: 'TENANT-1001' },
    update: { name: 'MiniERP Default Tenant', updatedBy: 'seed' },
    create: {
      code: 'TENANT-1001',
      name: 'MiniERP Default Tenant',
      createdBy: 'seed',
      updatedBy: 'seed',
    },
  });

  const tenant = await prisma.tenant.findUniqueOrThrow({ where: { code: 'TENANT-1001' } });
  const tenantId = tenant.id;

  await prisma.user.upsert({
    where: { tenantId_username: { tenantId, username: 'admin' } },
    update: { updatedBy: 'seed' },
    create: {
      tenantId,
      username: 'admin',
      email: 'admin@minierp.local',
      passwordHash: 'seed-hash',
      createdBy: 'seed',
      updatedBy: 'seed',
    },
  });

  const [wh, supplier, customer] = await Promise.all([
    prisma.warehouse.upsert({
      where: { tenantId_code: { tenantId, code: 'WH-001' } },
      update: { name: 'Main Warehouse', updatedBy: 'seed' },
      create: {
        tenantId,
        code: 'WH-001',
        name: 'Main Warehouse',
        createdBy: 'seed',
        updatedBy: 'seed',
      },
    }),
    prisma.supplier.upsert({
      where: { tenantId_code: { tenantId, code: 'SUP-001' } },
      update: { name: 'Default Supplier', updatedBy: 'seed' },
      create: {
        tenantId,
        code: 'SUP-001',
        name: 'Default Supplier',
        createdBy: 'seed',
        updatedBy: 'seed',
      },
    }),
    prisma.customer.upsert({
      where: { tenantId_code: { tenantId, code: 'CUS-001' } },
      update: { name: 'Default Customer', updatedBy: 'seed' },
      create: {
        tenantId,
        code: 'CUS-001',
        name: 'Default Customer',
        createdBy: 'seed',
        updatedBy: 'seed',
      },
    }),
  ]);

  const [sku1, sku2] = await Promise.all([
    prisma.sku.upsert({
      where: { tenantId_skuCode: { tenantId, skuCode: 'CAB-HDMI-2M' } },
      update: { name: 'HDMI Cable 2m', updatedBy: 'seed' },
      create: {
        tenantId,
        skuCode: 'CAB-HDMI-2M',
        name: 'HDMI Cable 2m',
        unit: 'PCS',
        createdBy: 'seed',
        updatedBy: 'seed',
      },
    }),
    prisma.sku.upsert({
      where: { tenantId_skuCode: { tenantId, skuCode: 'ADP-USB-C-DP' } },
      update: { name: 'USB-C to DP Adapter', updatedBy: 'seed' },
      create: {
        tenantId,
        skuCode: 'ADP-USB-C-DP',
        name: 'USB-C to DP Adapter',
        unit: 'PCS',
        createdBy: 'seed',
        updatedBy: 'seed',
      },
    }),
  ]);

  const po = await prisma.purchaseOrder.upsert({
    where: { tenantId_docNo: { tenantId, docNo: 'DOC-PO-20260305-001' } },
    update: { status: 'confirmed', updatedBy: 'seed' },
    create: {
      tenantId,
      docNo: 'DOC-PO-20260305-001',
      docDate: now,
      status: 'confirmed',
      supplierId: supplier.id,
      warehouseId: wh.id,
      totalQty: new Prisma.Decimal('200'),
      totalAmount: new Prisma.Decimal('72000'),
      createdBy: 'seed',
      updatedBy: 'seed',
    },
  });

  await prisma.purchaseOrderLine.createMany({
    data: [
      {
        tenantId,
        poId: po.id,
        lineNo: 1,
        skuId: sku1.id,
        qty: new Prisma.Decimal('120'),
        unitPrice: new Prisma.Decimal('320'),
        amount: new Prisma.Decimal('38400'),
      },
      {
        tenantId,
        poId: po.id,
        lineNo: 2,
        skuId: sku2.id,
        qty: new Prisma.Decimal('80'),
        unitPrice: new Prisma.Decimal('420'),
        amount: new Prisma.Decimal('33600'),
      },
    ],
    skipDuplicates: true,
  });

  const so = await prisma.salesOrder.upsert({
    where: { tenantId_docNo: { tenantId, docNo: 'DOC-SO-20260305-001' } },
    update: { status: 'confirmed', updatedBy: 'seed' },
    create: {
      tenantId,
      docNo: 'DOC-SO-20260305-001',
      docDate: now,
      status: 'confirmed',
      customerId: customer.id,
      warehouseId: wh.id,
      totalQty: new Prisma.Decimal('54'),
      totalAmount: new Prisma.Decimal('22680'),
      createdBy: 'seed',
      updatedBy: 'seed',
    },
  });

  await prisma.salesOrderLine.createMany({
    data: [
      {
        tenantId,
        soId: so.id,
        lineNo: 1,
        skuId: sku1.id,
        qty: new Prisma.Decimal('24'),
        unitPrice: new Prisma.Decimal('320'),
        amount: new Prisma.Decimal('7680'),
      },
      {
        tenantId,
        soId: so.id,
        lineNo: 2,
        skuId: sku2.id,
        qty: new Prisma.Decimal('30'),
        unitPrice: new Prisma.Decimal('500'),
        amount: new Prisma.Decimal('15000'),
      },
    ],
    skipDuplicates: true,
  });

  const asset = await prisma.evidenceAsset.upsert({
    where: { tenantId_objectKey: { tenantId, objectKey: 'seed/grn-3001-label.jpg' } },
    update: { status: 'active' },
    create: {
      tenantId,
      objectKey: 'seed/grn-3001-label.jpg',
      fileName: 'grn-label.jpg',
      contentType: 'image/jpeg',
      sizeBytes: BigInt(1024),
      status: 'active',
      uploadedBy: 'seed',
    },
  });

  await prisma.evidenceLink.createMany({
    data: [
      {
        tenantId,
        assetId: asset.id,
        entityType: 'grn',
        entityId: '3001',
        scope: 'document',
        lineRef: null,
        tag: 'label',
        createdBy: 'seed',
      },
    ],
    skipDuplicates: true,
  });

  await prisma.inventoryBalance.upsert({
    where: {
      tenantId_skuId_warehouseId: {
        tenantId,
        skuId: 'CAB-HDMI-2M',
        warehouseId: 'WH-001',
      },
    },
    update: { onHand: 120 },
    create: {
      tenantId,
      skuId: 'CAB-HDMI-2M',
      warehouseId: 'WH-001',
      onHand: 120,
    },
  });

  await prisma.inventoryLedger.create({
    data: {
      tenantId,
      skuId: 'CAB-HDMI-2M',
      warehouseId: 'WH-001',
      quantityDelta: 120,
      referenceType: 'GRN',
      referenceId: '3001',
      requestId: 'seed-request',
      postedAt: now,
    },
  });

  console.log('Seed completed for tenant', tenantId.toString());
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
