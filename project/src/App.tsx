// import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';


import Login from './pages/Login';
import Register from './pages/Register';
import EmployeeDashboard from './pages/employee/Dashboard';
import LeaveList from './pages/employee/LeaveList';
import ApplyLeave from './pages/employee/ApplyLeave';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminLeaves from './pages/admin/AdminLeaves';
import AdminUsers from './pages/admin/AdminUsers';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                fontSize: '14px',
              },
              success: {
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#FFFFFF',
                },
              },
              error: {
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#FFFFFF',
                },
              },
            }}
          />
          
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            

            <Route path="/dashboard" element={
              <ProtectedRoute requiredRole="employee">
                <Layout>
                  <EmployeeDashboard />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/leaves" element={
              <ProtectedRoute requiredRole="employee">
                <Layout>
                  <LeaveList />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/apply" element={
              <ProtectedRoute requiredRole="employee">
                <Layout>
                  <ApplyLeave />
                </Layout>
              </ProtectedRoute>
            } />
            

            <Route path="/admin" element={
              <ProtectedRoute requiredRole="admin">
                <Layout>
                  <AdminDashboard />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/admin/leaves" element={
              <ProtectedRoute requiredRole="admin">
                <Layout>
                  <AdminLeaves />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute requiredRole="admin">
                <Layout>
                  <AdminUsers />
                </Layout>
              </ProtectedRoute>
            } />
            

            <Route path="/" element={<Navigate to="/login\" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;