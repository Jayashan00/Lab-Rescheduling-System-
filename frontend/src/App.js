import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Requests from './pages/Requests';
import Appeals from './pages/Appeals';
import ReviewedAppeals from './pages/ReviewedAppeals';
import Users from './pages/Users';
import Modules from './pages/Modules';
import CreateRequest from './pages/CreateRequest';
import CreateAppeal from './pages/CreateAppeal';
import InstructorManagement from './pages/InstructorManagement';
import LabRoomManagement from './pages/LabRoomManagement';
import TeachingAssistantManagement from './pages/TeachingAssistantManagement';

function ProtectedRoute({ children, roles = [] }) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (roles.length > 0 && !roles.some(role => user?.roles?.includes(role))) {
    return <Navigate to="/dashboard" />;
  }

  return children;
}

function AppContent() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="App">
      {isAuthenticated && <Navbar />}
      <Routes>
        <Route
          path="/"
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <Home />}
        />
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />}
        />
        <Route
          path="/register"
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register />}
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/requests"
          element={
            <ProtectedRoute>
              <Requests />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-request"
          element={
            <ProtectedRoute roles={['ROLE_STUDENT']}>
              <CreateRequest />
            </ProtectedRoute>
          }
        />
        <Route
          path="/appeals"
          element={
            <ProtectedRoute>
              <Appeals />
            </ProtectedRoute>
          }
        />
        <Route
          path="/appeals/reviewed"
          element={
            <ProtectedRoute roles={['ROLE_ADMIN']}>
              <ReviewedAppeals />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-appeal"
          element={
            <ProtectedRoute roles={['ROLE_STUDENT']}>
              <CreateAppeal />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute roles={['ROLE_ADMIN']}>
              <Users />
            </ProtectedRoute>
          }
        />
        <Route
          path="/modules"
          element={
            <ProtectedRoute roles={['ROLE_ADMIN', 'ROLE_MODULE_COORDINATOR', 'ROLE_LAB_COORDINATOR']}>
              <Modules />
            </ProtectedRoute>
          }
        />
        <Route
          path="/instructors"
          element={
            <ProtectedRoute roles={['ROLE_LAB_COORDINATOR', 'ROLE_ADMIN']}>
              <InstructorManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lab-rooms"
          element={
            <ProtectedRoute roles={['ROLE_LAB_COORDINATOR', 'ROLE_ADMIN']}>
              <LabRoomManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teaching-assistants"
          element={
            <ProtectedRoute roles={['ROLE_LAB_COORDINATOR', 'ROLE_ADMIN']}>
              <TeachingAssistantManagement />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;