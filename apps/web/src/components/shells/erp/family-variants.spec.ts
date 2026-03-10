import { getDefaultFamilyVariant, getSupportedFamilyVariants, isSupportedFamilyVariant } from './family-variants';

describe('family variants', () => {
  it('accepts supported T2 variants', () => {
    expect(isSupportedFamilyVariant('T2', 'search-list')).toBe(true);
  });

  it('rejects unsupported variants', () => {
    expect(isSupportedFamilyVariant('T2', 'home')).toBe(false);
  });

  it('returns default variant for each family', () => {
    expect(getDefaultFamilyVariant('T1')).toBe('default');
    expect(getDefaultFamilyVariant('T2')).toBe('simple-list');
    expect(getDefaultFamilyVariant('T3')).toBe('record-detail');
    expect(getDefaultFamilyVariant('T4')).toBe('linear-wizard');
  });

  it('lists supported variants in stable order', () => {
    expect(getSupportedFamilyVariants('T1')).toEqual(['default', 'home', 'subnav']);
    expect(getSupportedFamilyVariants('T4')).toEqual(['linear-wizard', 'posting-flow', 'review-submit', 'evidence-flow']);
  });
});
