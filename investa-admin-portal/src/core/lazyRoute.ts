import { lazy, type ComponentType, type LazyExoticComponent } from 'react';

type ModuleRecord = Record<string, unknown>;

export const lazyNamedRoute = (
  loader: () => Promise<unknown>,
  exportName: string,
): LazyExoticComponent<ComponentType<any>> => lazy(async () => {
  const module = await loader() as ModuleRecord;
  const component = module[exportName];

  if (typeof component !== 'function') {
    throw new Error(`The administrative route module did not expose ${exportName}.`);
  }

  return { default: component as ComponentType<any> };
});
