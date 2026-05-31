import { describe, expect, it } from 'vitest';
import { crudPaths } from './use-crud';

describe('crudPaths', () => {
  it('builds resource paths', () => {
    expect(crudPaths('categories').list).toBe('/categories?page=1&limit=200');
    expect(crudPaths('categories').one('x')).toBe('/categories/x');
  });
});
