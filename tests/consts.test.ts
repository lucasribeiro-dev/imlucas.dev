import { describe, it, expect } from 'vitest';
import { SITE, NAV_LINKS, SOCIAL_LINKS } from '../src/consts';

describe('SITE config', () => {
  it('has required fields', () => {
    expect(SITE.title).toBe('imlucas.dev');
    expect(SITE.description).toBeTruthy();
    expect(SITE.author).toBeTruthy();
  });

  it('has GA and GSC fields', () => {
    expect(SITE).toHaveProperty('gaId');
    expect(SITE).toHaveProperty('gscVerification');
  });
});

describe('NAV_LINKS', () => {
  it('has at least 3 links', () => {
    expect(NAV_LINKS.length).toBeGreaterThanOrEqual(3);
  });

  it('each link has href and label', () => {
    for (const link of NAV_LINKS) {
      expect(link.href).toBeTruthy();
      expect(link.label).toBeTruthy();
    }
  });

  it('first link is home', () => {
    expect(NAV_LINKS[0].href).toBe('/');
  });
});

describe('SOCIAL_LINKS', () => {
  it('has github and linkedin', () => {
    expect(SOCIAL_LINKS.github).toContain('github.com');
    expect(SOCIAL_LINKS.linkedin).toContain('linkedin.com');
  });

  it('links use https', () => {
    expect(SOCIAL_LINKS.github).toMatch(/^https:\/\//);
    expect(SOCIAL_LINKS.linkedin).toMatch(/^https:\/\//);
  });
});
