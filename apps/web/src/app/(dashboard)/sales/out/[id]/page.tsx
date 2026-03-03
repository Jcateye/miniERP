import { DetailAssembly } from '@/components/business/erp-page-assemblies';
import { outDetailConfig } from '@/components/business/erp-page-config';

export default async function OutDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <DetailAssembly config={outDetailConfig} entityId={id} />;
}
