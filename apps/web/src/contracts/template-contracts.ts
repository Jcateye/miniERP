import type { ReactNode } from 'react';

import type { BigIntString, DocumentType } from '@minierp/shared';

export type TemplateFamily = 'T1' | 'T2' | 'T3' | 'T4';
export type TemplateFamilyVariant =
  | 'default'
  | 'home'
  | 'subnav'
  | 'simple-list'
  | 'search-list'
  | 'filter-list'
  | 'action-list'
  | 'tree-list'
  | 'record-detail'
  | 'document-detail'
  | 'masterdata-detail'
  | 'tabbed-detail'
  | 'linear-wizard'
  | 'posting-flow'
  | 'review-submit'
  | 'evidence-flow';
export type TemplateTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info';
export type TemplateActionTone = 'primary' | 'secondary' | 'ghost' | 'danger';
export type TemplateStepStatus = 'completed' | 'current' | 'upcoming';
export type TemplateFieldTone = 'default' | 'muted' | 'highlight' | 'risk';
export type TemplateFilterKind =
  | 'search'
  | 'select'
  | 'multi-select'
  | 'date'
  | 'date-range'
  | 'toggle'
  | 'custom';
export type TemplateReadinessLabel = 'DFP-READY' | 'BE-READY' | 'FE-E-READY' | 'FE-F-READY';

export interface TemplateAction {
  key: string;
  label: string;
  tone?: TemplateActionTone;
  href?: string;
  disabled?: boolean;
  hint?: string;
}

export interface TemplateMetric {
  key: string;
  label: string;
  value: string;
  hint?: string;
  tone?: TemplateTone;
}

export interface TemplateTag {
  key: string;
  label: string;
  tone?: TemplateTone;
}

export interface TemplateTab {
  key: string;
  label: string;
  badge?: string;
}

export interface TemplateStep {
  key: string;
  title: string;
  description?: string;
  status: TemplateStepStatus;
}

export interface TemplateField {
  key: string;
  label: string;
  value: string;
  tone?: TemplateFieldTone;
  helperText?: string;
}

export interface TemplateFieldGroup {
  key: string;
  title: string;
  description?: string;
  fields: TemplateField[];
}

export interface TemplateFilterOption {
  label: string;
  value: string;
}

export interface TemplateFilter {
  key: string;
  label: string;
  kind: TemplateFilterKind;
  value?: string | string[] | boolean;
  placeholder?: string;
  options?: TemplateFilterOption[];
}

export interface TemplateSectionDescriptor {
  key: string;
  title: string;
  description?: string;
}

export interface TemplateSlotContract {
  key: string;
  title: string;
  description: string;
  required?: boolean;
}

export interface TemplateHeader {
  title: string;
  description?: string;
  docNo?: string;
  docType?: DocumentType;
  entityId?: BigIntString;
  statusTag?: TemplateTag;
  primaryAction?: TemplateAction;
  secondaryActions?: TemplateAction[];
}

export interface TemplatePageContractBase {
  family: TemplateFamily;
  variant?: TemplateFamilyVariant;
  route: string;
  title: string;
  summary: string;
  readiness?: TemplateReadinessLabel[];
  header: TemplateHeader;
}

export interface OverviewTemplateContract extends TemplatePageContractBase {
  family: 'T1';
  metrics: TemplateMetric[];
  navigationLabel: string;
  slots: {
    search?: TemplateSlotContract;
    todo: TemplateSlotContract;
    quickActions?: TemplateSlotContract;
    timeline?: TemplateSlotContract;
  };
}

export interface WorkbenchTemplateContract extends TemplatePageContractBase {
  family: 'T2';
  filters: TemplateFilter[];
  slots: {
    toolbar: TemplateSlotContract;
    results: TemplateSlotContract;
    detailDrawer?: TemplateSlotContract;
    bulkBar?: TemplateSlotContract;
  };
}

export interface DetailTemplateContract extends TemplatePageContractBase {
  family: 'T3';
  sections: {
    primary: TemplateSectionDescriptor;
    secondary: TemplateSectionDescriptor;
    tertiary?: TemplateSectionDescriptor;
  };
  tabs: TemplateTab[];
  slots: {
    tabContent: TemplateSlotContract;
    quickActions?: TemplateSlotContract;
  };
}

export interface WizardTemplateContract extends TemplatePageContractBase {
  family: 'T4';
  steps: TemplateStep[];
  summaryMetrics: TemplateMetric[];
  footerActions: TemplateAction[];
  slots: {
    editor: TemplateSlotContract;
    summary: TemplateSlotContract;
  };
}

export type TemplatePageContract =
  | OverviewTemplateContract
  | WorkbenchTemplateContract
  | DetailTemplateContract
  | WizardTemplateContract;

export interface OverviewLayoutProps {
  contract: OverviewTemplateContract;
  searchSlot?: ReactNode;
  todoSlot: ReactNode;
  quickActionsSlot?: ReactNode;
  timelineSlot?: ReactNode;
}

export interface WorkbenchLayoutProps {
  contract: WorkbenchTemplateContract;
  toolbarSlot: ReactNode;
  resultsSlot: ReactNode;
  detailSlot?: ReactNode;
  bulkBarSlot?: ReactNode;
}

export interface DetailLayoutProps {
  contract: DetailTemplateContract;
  primarySlot: ReactNode;
  secondarySlot: ReactNode;
  tertiarySlot?: ReactNode;
  activeTabKey: string;
  tabContentSlot: ReactNode;
  quickActionsSlot?: ReactNode;
}

export interface WizardLayoutProps {
  contract: WizardTemplateContract;
  editorSlot: ReactNode;
  summarySlot: ReactNode;
}
