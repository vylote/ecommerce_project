import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import LoginPage from '../features/auth/LoginPage';
// import RegisterPage from '../features/auth/RegisterPage';
import HomePage from '../features/home/HomePage';
import RegisterPage from '../features/auth/RegisterPage';
import DailyDiscovery from '../features/product/DailyDiscovery';
import CategoryPage from '../features/product/CategoryPage';
import SearchPage from '../features/product/SearchPage';

export const AppRoutes = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" />} />
      <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to="/" />} />
      <Route path="/daily-discovery" element={<DailyDiscovery />} />
      <Route path="/category/:id" element={<CategoryPage />} />
      <Route path="/search" element={<SearchPage />} />
    </Routes>
  );
};