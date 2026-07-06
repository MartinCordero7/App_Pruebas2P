import React from 'react';
import { Navigate } from 'react-router-dom';

export function Finance() {
  return <Navigate to="/billing" replace />;
}
