import React from 'react';

export const PageActions: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="page-actions" data-testid="page-actions">{children}</div>
);
