import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { LoginForm } from '../components/auth/LoginForm'
import { Layout } from '../components/Layout'
import { DashboardContent } from '../components/DashboardContent'
import { ExamManagement } from '../components/exams/ExamManagement'
import { UserManagement } from '../components/users/UserManagement'
import { Analytics } from '../components/analytics/Analytics'
import { IncidentManagement } from '../components/incidents/IncidentManagement'
import { ScriptManagement } from '../components/scripts/ScriptManagement'

interface ProtectedRouteProps {
  children: React.ReactNode
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const isAuthenticated = useAuthStore((state: any) => state.isAuthenticated)
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

interface PublicRouteProps {
  children: React.ReactNode
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const isAuthenticated = useAuthStore((state: any) => state.isAuthenticated)
  
  return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" replace />
}

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <LoginForm />
          </PublicRoute>
        } 
      />
      
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardContent />} />
        <Route path="exams" element={<ExamManagement />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="scripts" element={<ScriptManagement />} />
        <Route path="incidents" element={<IncidentManagement />} />
        <Route path="analytics" element={<Analytics />} />
      </Route>
      
      <Route 
        path="*" 
        element={<Navigate to="/dashboard" replace />} 
      />
    </Routes>
  )
}
