import { Routes, Route, Navigate } from 'react-router-dom';

import Login from './views/Login';
import Register from './views/Register';
import ResetPassword from './views/Reset-password';
import ForgotPassword from './views/Forgot-password';
import Faq from './views/Faq';
import NotFound from './views/Notfound';
import Admin from './views/admin/Home';
import Onboarding from './views/onboarding/Onboarding';
import ChatBox from './components/Chatbot/ChatBox';

import './App.css';

// Composant de sécurité : Vérifie le rôle avant d'afficher la page
const AdminRoute = ({ children }) => {
  const userStr = localStorage.getItem('user');

  if (!userStr) {
    // Non connecté -> Redirection vers login
    return <Navigate to="/login" replace />;
  }

  try {
    const user = JSON.parse(userStr);
    if (user.role === 'admin') {
      return children;
    } else {
      return <Navigate to="/" replace />;
    }
  } catch (error) {
    return <Navigate to="/login" replace />;
  }
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<Onboarding />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/admin" element={<AdminRoute> <Admin /> </AdminRoute>} />
      <Route path="/admin/users" element={<AdminUsers />} />
      <Route path="/souscription" element={<Home />} />
      <Route path="/faq" element={<Faq />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;