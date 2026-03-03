import { DetailAssembly } from '@/components/business/erp-page-assemblies';
import { soDetailConfig } from '@/components/business/erp-page-config';

export default async function SalesOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <DetailAssembly config={soDetailConfig} entityId={id} />;
}
