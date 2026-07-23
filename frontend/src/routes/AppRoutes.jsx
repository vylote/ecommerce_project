import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import LoginPage from '../features/auth/LoginPage';
import HomePage from '../features/home/HomePage';
import RegisterPage from '../features/auth/RegisterPage';
import DailyDiscovery from '../features/product/DailyDiscovery';
import CategoryPage from '../features/product/CategoryPage';
import SearchPage from '../features/product/SearchPage';
import ProductDetailPage from '../features/product/ProductDetailPage';
import CartPage from '../features/cart/CartPage';
import CheckoutPage from '../features/order/CheckoutPage'; 
import OrdersPage from '../features/order/OrderPage';
import ProfilePage from '../features/profile/ProfilePage';
import AddressPage from '../features/profile/AddressPage';
import SellerOnboarding from '../features/seller/SellerOnboarding';
import SellerLayout from '../features/seller/SellerLayout';
import SellerDashboard from '../features/seller/SellerDashboard';
import AddProduct from '../features/seller/AddProduct';
import SellerProductPage from '../features/seller/SellerProductPage';
import SellerOrderPage from '../features/seller/SellerOrderPage';

export const AppRoutes = () => {
  const { user } = useSelector((state) => state.auth);

  if (user) {
    window.currentUser = user; 
  }

  const isSeller = user?.roles?.some(r => r.name === 'ROLE_SELLER');

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" />} />
      <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to="/" />} />
      <Route path="/daily-discovery" element={<DailyDiscovery />} />
      <Route path="/category/:id" element={<CategoryPage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/product/:id" element={<ProductDetailPage />} />
      <Route path="/cart" element={user ? <CartPage /> : <Navigate to="/login" />} />
      <Route path="/checkout" element={user ? <CheckoutPage /> : <Navigate to="/login" />} />
      <Route path="/orders" element={user ? <OrdersPage /> : <Navigate to="/login" />} />
      <Route path="/profile" element={user ? <ProfilePage /> : <Navigate to="/login" />} />
      <Route path="/profile/addresses" element={user ? <AddressPage /> : <Navigate to="/login" />} />
      <Route 
        path="/seller/onboarding" 
        element={
          !user ? <Navigate to="/login" /> : 
          isSeller ? <Navigate to="/seller/dashboard" /> : 
          <SellerOnboarding />
        } 
      />
      <Route 
        path="/seller" 
        element={
          !user ? <Navigate to="/login" /> :
          isSeller ? <SellerLayout /> : 
          <Navigate to="/seller/onboarding" />
        }
      >
        <Route index element={<Navigate to="dashboard" />} />
        <Route path="dashboard" element={<SellerDashboard />} />
        <Route path="products" element={<SellerProductPage />} />
        <Route path="product/add" element={<AddProduct />} />
        <Route path="orders" element={<SellerOrderPage />} />
      </Route>
    </Routes>
  );
};