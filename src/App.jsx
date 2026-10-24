import React, { useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterSelectPage from './pages/RegisterSelectPage';
import PatientRegisterPage from './pages/PatientRegisterPage';
import DoctorRegisterPage from './pages/DoctorRegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import Toast from './components/auth/Toast';
import './styles/auth.css';

export default function App() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ title, message, type = 'info', duration = 4500 }) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    const newToast = { id, title, message, type };

    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <BrowserRouter>
      {/* Toast Notification Container */}
      <Toast toasts={toasts} onRemove={removeToast} />

      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage onToast={addToast} />} />
        <Route path="/register" element={<RegisterSelectPage onToast={addToast} />} />
        <Route path="/register/patient" element={<PatientRegisterPage onToast={addToast} />} />
        <Route path="/register/doctor" element={<DoctorRegisterPage onToast={addToast} />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage onToast={addToast} />} />
        <Route path="/reset-password" element={<ResetPasswordPage onToast={addToast} />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
