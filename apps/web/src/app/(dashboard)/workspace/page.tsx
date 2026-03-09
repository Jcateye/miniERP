'use client';

import {
  WORKSPACE_HOME_KPIS,
  WORKSPACE_HOME_PAGE_PRESENTATION,
  WORKSPACE_HOME_RIGHT_PANEL_SECTIONS,
  WORKSPACE_HOME_TODO_ITEMS,
} from './workspace-home-page';
import { WorkspaceHomePageScaffold } from './workspace-home-page-view';

export default function WorkspaceHomePage() {
  return (
    <WorkspaceHomePageScaffold
      title={WORKSPACE_HOME_PAGE_PRESENTATION.title}
      summary={WORKSPACE_HOME_PAGE_PRESENTATION.summary}
      searchPlaceholder={WORKSPACE_HOME_PAGE_PRESENTATION.searchPlaceholder}
      kpis={WORKSPACE_HOME_KPIS}
      todoItems={WORKSPACE_HOME_TODO_ITEMS}
      rightPanelSections={WORKSPACE_HOME_RIGHT_PANEL_SECTIONS}
    />
  );
}
