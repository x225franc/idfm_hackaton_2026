import { useState, useEffect, createContext, useContext } from 'react';
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

import CookieBanner from './components/CookieBanner';
import './App.css';

export const AuthContext = createContext({ user: null, refreshUser: () => Promise.resolve(), logout: () => {} });

const GuestRoute = ({ children }) => {
  const { state } = useLocation();
  const { user } = useContext(AuthContext);
  if (user?.scope === 'full' && state?.startStep == null) return <Navigate to="/dashboard" replace />;
  return children;
};

const isTokenExpired = (user) => user?.exp && Date.now() / 1000 > user.exp;

const PrivateRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/login" replace />;
  if (isTokenExpired(user)) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return <Navigate to="/login" replace />;
  }
  if (user.scope !== 'full') return <Navigate to="/login" replace />;
  return children;
};

const AdminRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/login" replace />;
  if (isTokenExpired(user)) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return <Navigate to="/login" replace />;
  }
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
};

export default function App() {
  const [sessionChecked, setSessionChecked] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const refreshUser = () => {
    const token = localStorage.getItem('token');
    if (!token) { setCurrentUser(null); return Promise.resolve(); }
    return apiFetch('/api/auth/me')
      .then((user) => setCurrentUser(user))
      .catch(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setCurrentUser(null);
      });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
  };

  useEffect(() => {
    refreshUser().finally(() => setSessionChecked(true));
  }, []);

  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith('/admin');

  if (!sessionChecked) return null;

  return (
    <AuthContext.Provider value={{ user: currentUser, refreshUser, logout }}>
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
      <CookieBanner />
    </AuthContext.Provider>
  );
}

