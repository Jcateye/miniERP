import { DetailAssembly } from '@/components/business/erp-page-assemblies';
import { stocktakeDetailConfig } from '@/components/business/erp-page-config';

export default async function StocktakeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <DetailAssembly config={stocktakeDetailConfig} entityId={id} />;
}
