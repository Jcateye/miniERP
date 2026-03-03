import { WorkbenchAssembly } from '@/components/business/erp-page-assemblies';
import { inventoryLedgerConfig } from '@/components/business/erp-page-config';

export default function InventoryLedgerPage() {
  return <WorkbenchAssembly config={inventoryLedgerConfig} />;
}
