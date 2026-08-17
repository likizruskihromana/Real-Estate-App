import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export function ProtectedRoute({children,admin=false}:{children:ReactNode;admin?:boolean}){const {user,loading}=useAuth();if(loading)return <div className="container page"><div className="skeleton detail-skeleton"/></div>;if(!user)return <Navigate to="/prijava" replace/>;if(admin&&user.systemRole==='USER')return <Navigate to="/" replace/>;return children}
