export interface WorkspaceDescriptor {
  key: 'fopx';
  name: string;
  shortName: string;
  accent: 'violet';
  icon: string;
  modules: string[];
  routePrefix: string;
}

export const FOPX_WORKSPACE: WorkspaceDescriptor = {
  key: 'fopx',
  name: 'FOPX One',
  shortName: 'FOPX',
  accent: 'violet',
  icon: 'trending-up',
  modules: ['clients', 'opportunities', 'trust', 'verification', 'credit', 'reference-data', 'moderation'],
  routePrefix: '/admin/fopx',
};

