import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// USER
import UserHomePage from './pages/user/UserHomePage';
import UserProfilePage from './pages/user/UserProfilePage';
import UserStatisticsPage from './pages/user/UserStatisticsPage';

// ADMIN
import AdminHomePage from './pages/admin/AdminHomePage';
import UsersManagementPage from './pages/admin/UsersManagementPage';
import AdminProfilePage from './pages/admin/AdminProfilePage';

// INVESTIGATOR
import InvestigatorHomePage from './pages/investigador/InvestigatorHomePage';
import StudiesManagementPage from './pages/investigador/StudiesManagementPage';
import CategoriesManagementPage from './pages/investigador/CategoriesManagementPage';
import QuestionsManagementPage from './pages/investigador/QuestionsManagementPage';
import PostsManagementPage from './pages/investigador/PostsManagementPage';
import GroupsManagementPage from './pages/investigador/GroupsManagementPage';
import InvestigatorStatisticsPage from './pages/investigador/InvestigatorStatisticsPage';
import InvestigatorProfilePage from './pages/investigador/InvestigatorProfilePage';

import './styles/AuthBackground.css';
import { AuthContext } from './context/AuthContext';

const ProtectedRoute = ({ children, onlyFor }) => {
  const { userType, loading } = useContext(AuthContext);

  if (loading) {
    return <div style={{ textAlign: 'center', paddingTop: '100px' }}>A carregar...</div>;
  }

  if (!userType) return <Navigate to="/" />;
  if (onlyFor && !onlyFor.includes(userType)) return <Navigate to="/home" />;
  return children;
};

const App = () => {
  const { userType } = useContext(AuthContext);

  return (
    <Router>
      <Routes>
        {/* AUTH */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* USER */}
        <Route
          path="/home"
          element={
            <ProtectedRoute onlyFor={['user', 'admin', 'investigator']}>
              {userType === 'admin' && <AdminHomePage />}
              {userType === 'investigator' && <InvestigatorHomePage />}
              {userType === 'user' && <UserHomePage />}
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute onlyFor={['user', 'admin', 'investigator']}>
              {userType === 'user' && <UserProfilePage />}
              {userType === 'admin' && <AdminHomePage />}
              {userType === 'investigator' && <InvestigatorHomePage />}
            </ProtectedRoute>
          }
        />
        <Route
          path="/statistics"
          element={
            <ProtectedRoute onlyFor={['user', 'investigator']}>
              {userType === 'user' && <UserStatisticsPage />}
              {userType === 'investigator' && <InvestigatorStatisticsPage />}
            </ProtectedRoute>
          }
        />

        {/* ADMIN */}
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute onlyFor={['admin']}>
              <UsersManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/profile"
          element={
            <ProtectedRoute onlyFor={['admin']}>
              <AdminProfilePage />
            </ProtectedRoute>
          }
        />

        {/* INVESTIGATOR */}
        <Route
          path="/investigator/studies"
          element={
            <ProtectedRoute onlyFor={['investigator']}>
              <StudiesManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/investigator/categories"
          element={
            <ProtectedRoute onlyFor={['investigator']}>
              <CategoriesManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/investigator/questions"
          element={
            <ProtectedRoute onlyFor={['investigator']}>
              <QuestionsManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/investigator/posts"
          element={
            <ProtectedRoute onlyFor={['investigator']}>
              <PostsManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/investigator/groups"
          element={
            <ProtectedRoute onlyFor={['investigator']}>
              <GroupsManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/investigator/profile"
          element={
            <ProtectedRoute onlyFor={['investigator']}>
              <InvestigatorProfilePage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
