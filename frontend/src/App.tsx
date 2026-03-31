import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminSurveys from './pages/AdminSurveys';
import SurveyForm from './pages/SurveyForm';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import SurveyAcess from './pages/Survey';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        {
        <Route path="/login" element={<Login />} />
        }
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
        <Route
            path="/surveys/:id"
            element={
              <ProtectedRoute redirectTo="/login">
                <SurveyAcess />
              </ProtectedRoute>
            }
          />
        <Route path="/" element={<Navigate to="/admin/surveys" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;