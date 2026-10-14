import React from 'react';
import { Navigate } from 'react-router-dom';
import { usePermissions } from '@/context/AuthContext';
import { canAccessPolicy, RoutePolicy } from '@/core/routePolicy';
import { AccessDenied } from '@/components/common/EnterpriseStates';

export const RouteGuard: React.FC<{ policy: RoutePolicy; children: React.ReactElement }> = ({ policy, children }) => {
  const { isAuthenticated, permissions } = usePermissions();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!canAccessPolicy(policy, permissions, isAuthenticated)) return <AccessDenied />;
  return children;
};

