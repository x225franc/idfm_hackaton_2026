import { Routes, Route, Navigate } from 'react-router-dom';

import Home from './views/Home';
import Login from './views/Login';
import Register from './views/Register';
import Faq from './views/Faq';
import NotFound from './views/Notfound';
import AdminUsers from './views/admin/Users';
import Onboarding from './views/onboarding/Onboarding';
import ChatBox from './components/Chatbot/ChatBox';

import './App.css';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Onboarding />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/souscription" element={<Home />} />
        <Route path="/admin" element={<Navigate to="/admin/users" replace />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/faq" element={<Faq />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <ChatBox />
    </>
  );
}

export default App;
