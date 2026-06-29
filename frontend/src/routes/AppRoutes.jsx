import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import LoginPage from '../features/auth/LoginPage';
// import RegisterPage from '../features/auth/RegisterPage';
import HomePage from '../features/home/HomePage';

export const AppRoutes = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" />} />
    </Routes>
  );
};