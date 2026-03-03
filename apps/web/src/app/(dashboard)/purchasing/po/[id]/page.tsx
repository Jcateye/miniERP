import { DetailAssembly } from '@/components/business/erp-page-assemblies';
import { poDetailConfig } from '@/components/business/erp-page-config';

export default async function PurchaseOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <DetailAssembly config={poDetailConfig} entityId={id} />;
}
