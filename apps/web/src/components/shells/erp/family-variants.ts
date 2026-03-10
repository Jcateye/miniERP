import type { TemplateFamily, TemplateFamilyVariant } from '@/contracts';

const FAMILY_VARIANT_MAP = {
  T1: ['default', 'home', 'subnav'],
  T2: ['simple-list', 'search-list', 'filter-list', 'action-list', 'tree-list'],
  T3: ['record-detail', 'document-detail', 'masterdata-detail', 'tabbed-detail'],
  T4: ['linear-wizard', 'posting-flow', 'review-submit', 'evidence-flow'],
} satisfies Record<TemplateFamily, readonly TemplateFamilyVariant[]>;

export function getSupportedFamilyVariants(family: TemplateFamily): readonly TemplateFamilyVariant[] {
  return FAMILY_VARIANT_MAP[family];
}

export function getDefaultFamilyVariant(family: TemplateFamily): TemplateFamilyVariant {
  return FAMILY_VARIANT_MAP[family][0];
}

export function isSupportedFamilyVariant(family: TemplateFamily, variant: string): variant is TemplateFamilyVariant {
  return FAMILY_VARIANT_MAP[family].some((candidate) => candidate === variant);
}
