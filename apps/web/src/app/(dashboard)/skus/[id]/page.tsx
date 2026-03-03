import { DetailAssembly } from '@/components/business/erp-page-assemblies';
import { skuDetailConfig } from '@/components/business/erp-page-config';

export default async function SkuDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <DetailAssembly config={skuDetailConfig} entityId={id} />;
}
