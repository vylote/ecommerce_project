import { ROLE_ADMIN, ROLE_SELLER } from "../shared/constants";
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import LoginPage from '../modules/account/auth/LoginPage';
import HomePage from '../modules/storefront/home/HomePage';
import RegisterPage from '../modules/account/auth/RegisterPage';
import DailyDiscovery from '../modules/storefront/catalog/DailyDiscovery';
import CategoryPage from '../modules/storefront/catalog/CategoryPage';
import SearchPage from '../modules/storefront/catalog/SearchPage';
import ProductDetailPage from '../modules/storefront/catalog/ProductDetailPage';
import CartPage from '../modules/cart/CartPage';
import CheckoutPage from '../modules/checkout/CheckoutPage'; 
import OrdersPage from '../modules/orders/OrderPage';
import ProfilePage from '../modules/account/profile/ProfilePage';
import AddressPage from '../modules/account/profile/AddressPage';
import SellerOnboarding from '../modules/seller/SellerOnboarding';
import SellerLayout from '../modules/seller/SellerLayout';
import SellerDashboard from '../modules/seller/SellerDashboard';
import AddProduct from '../modules/seller/AddProduct';
import SellerProductPage from '../modules/seller/SellerProductPage';
import SellerProfilePage from '../modules/seller/SellerProfilePage';
import SellerOrderPage from '../modules/seller/SellerOrderPage';

import AdminLayout from '../modules/admin/AdminLayout';
import AdminDashboard from '../modules/admin/AdminDashboard';
import UserManagementPage from '../modules/admin/UserManagementPage';
import CommissionPage from '../modules/admin/CommissionPage';
import SpecificationManagementPage from '../modules/admin/SpecificationManagementPage';
import RolePermissionPage from '../modules/admin/RolePermissionPage';
import CategoryManagementPage from '../modules/admin/CategoryManagementPage';
import ShopManagementPage from '../modules/admin/ShopManagementPage';

export const AppRoutes = () => {
  const { user } = useSelector((state) => state.auth);


  const isSeller = user?.roles?.some(r => r.name === ROLE_SELLER);

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
        <Route path="profile" element={<SellerProfilePage />} />
        <Route path="products" element={<SellerProductPage />} />
        <Route path="product/add" element={<AddProduct />} />
        <Route path="orders" element={<SellerOrderPage />} />
      </Route>

      {/* ADMIN ROUTES */}
      <Route 
        path="/admin" 
        element={
          !user ? <Navigate to="/login" /> :
          user.roles?.some(r => r.name === ROLE_ADMIN) ? <AdminLayout /> :
          <Navigate to="/" />
        }
      >
        <Route index element={<Navigate to="dashboard" />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<UserManagementPage />} />
        <Route path="shops" element={<ShopManagementPage />} />
        <Route path="commissions" element={<CommissionPage />} />
        <Route path="specifications" element={<SpecificationManagementPage />} />
        <Route path="roles" element={<RolePermissionPage />} />
        <Route path="categories" element={<CategoryManagementPage />} />
      </Route>
    </Routes>
  );
};