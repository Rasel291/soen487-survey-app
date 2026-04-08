import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminHome from './pages/AdminHome';
import AdminSurveys from './pages/AdminSurveys';
import SurveyForm from './pages/SurveyForm';
import ProtectedRoute from './components/ProtectedRoute';
import Register from "./pages/Register";
import Login from './pages/Login';
import SurveyAcess from './pages/Survey';
import SurveyAnalytics from "./pages/SurveyAnalytics";
import ParticipantManagement from './pages/ParticipantManagement';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        }
        <Route path="/admin" element={<AdminHome />} /> 
        <Route
          path="/admin/surveys"
          element={
            <ProtectedRoute redirectTo="/login">
              <AdminSurveys />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/surveys/new"
          element={
            <ProtectedRoute redirectTo="/login">
              <SurveyForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/surveys/edit/:id"
          element={
            <ProtectedRoute redirectTo="/login">
              <SurveyForm />
            </ProtectedRoute>
          }
        />
        <Route path="/surveys/:id" element={<SurveyAcess />} />
        <Route path="/survey/:id" element={<SurveyAcess />} />
        <Route path="/" element={<Navigate to="/admin/surveys" />} />
        <Route
          path="/admin/surveys/:id/analytics"
          element={<SurveyAnalytics />}
        />
        <Route
          path="/survey/:id"
          element={<SurveyAcess />}
          />
        <Route path="/" element={<Navigate to="/admin/surveys" />} />
        <Route
          path="/admin/participants"
          element={
            <ProtectedRoute redirectTo="/login">
              <ParticipantManagement />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
