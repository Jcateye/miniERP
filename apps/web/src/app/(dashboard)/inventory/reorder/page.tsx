import { WorkbenchAssembly } from '@/components/business/erp-page-assemblies';
import { inventoryReorderConfig } from '@/components/business/erp-page-config';

export default function InventoryReorderPage() {
  return <WorkbenchAssembly config={inventoryReorderConfig} />;
}
