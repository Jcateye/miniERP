import { DetailAssembly } from '@/components/business/erp-page-assemblies';
import { quotationDetailConfig } from '@/components/business/erp-page-config';

export default async function QuotationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <DetailAssembly config={quotationDetailConfig} entityId={id} />;
}
