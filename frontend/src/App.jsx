import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import ChatBox from './components/Chatbot/ChatBox';
import { apiFetch } from './utils';

import Login from './views/Login';
import Register from './views/Register';
import ResetPassword from './views/Reset-password';
import ForgotPassword from './views/Forgot-password';
import Faq from './views/Faq';
import OffersCatalog from './views/OffersCatalog';
import NotFound from './views/Notfound';
import Admin from './views/admin/Home';
import Onboarding from './views/onboarding/Onboarding';
import Tableau from './views/app/Tableau';
import Passes from './views/app/Passes';
import Ask from './views/app/Ask';
import Profil from './views/app/Profil';

import './App.css';

const GuestRoute = ({ children }) => {
  const { state } = useLocation();
  if (localStorage.getItem('token') && localStorage.getItem('user') && state?.startStep == null)
    return <Navigate to="/dashboard" replace />;
  return children;
};

const PrivateRoute = ({ children }) => {
  if (!localStorage.getItem('token') || !localStorage.getItem('user'))
    return <Navigate to="/login" replace />;
  return children;
};

const AdminRoute = ({ children }) => {
  if (!localStorage.getItem('token') || !localStorage.getItem('user'))
    return <Navigate to="/login" replace />;

  try {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user.role === 'admin') {
      return children;
    } else {
      return <Navigate to="/" replace />;
    }
  } catch (error) {
    return <Navigate to="/login" replace />;
  }
};

export default function App() {
  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user  = JSON.parse(localStorage.getItem('user') || 'null');

    if (!token || !user?.id) {
      setSessionChecked(true);
      return;
    }

    apiFetch(`/api/get/user/${user.id}`)
      .then((data) => {
        if (data.email !== user.email) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      })
      .catch(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      })
      .finally(() => setSessionChecked(true));
  }, []);

  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith('/admin');

  if (!sessionChecked) return null;

  return (
    <>
      <Routes>
        <Route path="/" element={<GuestRoute><Onboarding /></GuestRoute>} />
        <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route path="/admin" element={<AdminRoute><Navigate to="/admin/users" replace /></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute><Admin /></AdminRoute>} />

        <Route path="/faq" element={<Faq />} />
        <Route path="/offres" element={<OffersCatalog />} />

        <Route path="/dashboard" element={<PrivateRoute><Tableau /></PrivateRoute>} />
        <Route path="/passes"    element={<PrivateRoute><Passes /></PrivateRoute>} />
        <Route path="/ask"       element={<PrivateRoute><Ask /></PrivateRoute>} />
        <Route path="/profil"    element={<PrivateRoute><Profil /></PrivateRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {!isAdmin && <ChatBox />}
    </>
  );
}

