import { Routes, Route } from 'react-router-dom';

import Home from './views/Home';
import Login from './views/Login';
import Register from './views/Register';
import Faq from './views/Faq';
import NotFound from './views/Notfound';

import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/faq" element={<Faq />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
