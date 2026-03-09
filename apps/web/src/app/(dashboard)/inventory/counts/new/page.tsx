import {
  buildNewInventoryCountSections,
  buildNewInventoryCountSteps,
  NEW_INVENTORY_COUNT_PAGE_PRESENTATION,
} from './new-inventory-count-page';
import { NewInventoryCountPageScaffold } from './new-inventory-count-page-view';

export default function NewInventoryCountPage() {
  return (
    <NewInventoryCountPageScaffold
      title={NEW_INVENTORY_COUNT_PAGE_PRESENTATION.title}
      summary={NEW_INVENTORY_COUNT_PAGE_PRESENTATION.summary}
      backLabel={NEW_INVENTORY_COUNT_PAGE_PRESENTATION.backLabel}
      backHref={NEW_INVENTORY_COUNT_PAGE_PRESENTATION.backHref}
      primaryActionLabel={NEW_INVENTORY_COUNT_PAGE_PRESENTATION.primaryActionLabel}
      steps={buildNewInventoryCountSteps()}
      sections={buildNewInventoryCountSections()}
    />
  );
}
