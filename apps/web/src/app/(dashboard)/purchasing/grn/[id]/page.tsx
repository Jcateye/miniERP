import { DetailAssembly } from '@/components/business/erp-page-assemblies';
import { grnDetailConfig } from '@/components/business/erp-page-config';

export default async function GrnDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <DetailAssembly config={grnDetailConfig} entityId={id} />;
}
