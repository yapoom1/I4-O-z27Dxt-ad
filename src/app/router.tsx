import React, { useState, useEffect } from 'react';
import { createBrowserRouter, RouterProvider, Navigate, Outlet, useLocation } from 'react-router-dom';
import { AdminLayout } from '@/shared/layouts/AdminLayout';
import { Dashboard } from '@/modules/dashboard/Dashboard';
import { ProductList } from '@/modules/products/ProductList';
import { ProductCreate } from '@/modules/products/ProductCreate';
import { ProductDetails } from '@/modules/products/ProductDetails';
import { Categories } from '@/modules/categories/Categories';
import { CategoryCreate } from '@/modules/categories/CategoryCreate';
import { CategoryDetails } from '@/modules/categories/CategoryDetails';
import { OrderList } from '@/modules/orders/OrderList';
import { OrderDetails } from '@/modules/orders/OrderDetails';
import { CustomerList } from '@/modules/customers/CustomerList';
import { CustomerDetails } from '@/modules/customers/CustomerDetails';
import { DeliveryRules } from '@/modules/delivery/DeliveryRules';
import { Settings } from '@/modules/settings/Settings';
import { Login } from '@/modules/auth/Login';
import { getStoredToken } from '@/shared/auth';

/**
 * RequireAuth
 * -----------
 * Route guard that redirects to /login if no auth token is present.
 *
 * The initial token state is read synchronously from localStorage so there
 * is no flicker. The storage event listener ensures the guard reacts to
 * cross-tab login/logout without needing to re-run on every navigation.
 */
const RequireAuth: React.FC = () => {
  const location = useLocation();
  const [token, setToken] = useState<string | null>(() => getStoredToken());

  // Only re-evaluate on cross-tab storage changes (e.g. logout in another tab).
  // Do NOT depend on location.pathname – that caused a re-check loop on every nav.
  useEffect(() => {
    const handleStorageChange = () => {
      setToken(getStoredToken());
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []); // empty deps: register once, react via storage events only

  if (!token) {
    // Preserve the attempted URL so we can redirect back after login.
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
};

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    // All protected routes are children of RequireAuth.
    path: '/',
    element: <RequireAuth />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="/dashboard" replace />,
          },
          {
            path: 'dashboard',
            element: <Dashboard />,
          },
          {
            path: 'products',
            children: [
              {
                index: true,
                element: <ProductList />,
              },
              {
                path: 'create',
                element: <ProductCreate />,
              },
              {
                path: ':id',
                element: <ProductDetails />,
              },
              {
                path: ':id/edit',
                element: <ProductCreate />,
              },
            ],
          },
          {
            path: 'categories',
            children: [
              {
                index: true,
                element: <Categories />,
              },
              {
                path: 'create',
                element: <CategoryCreate />,
              },
              {
                path: ':id',
                element: <CategoryDetails />,
              },
              {
                path: ':id/edit',
                element: <CategoryCreate />,
              },
            ],
          },
          {
            path: 'orders',
            children: [
              {
                index: true,
                element: <OrderList />,
              },
              {
                path: ':id',
                element: <OrderDetails />,
              },
            ],
          },
          {
            path: 'customers',
            children: [
              {
                index: true,
                element: <CustomerList />,
              },
              {
                path: ':id',
                element: <CustomerDetails />,
              },
            ],
          },
          {
            path: 'delivery',
            element: <DeliveryRules />,
          },
          {
            path: 'settings',
            element: <Settings />,
          },
        ],
      },
    ],
  },
  {
    // Catch-all: redirect unknown paths to dashboard (RequireAuth handles the guard).
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
]);

export const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;
