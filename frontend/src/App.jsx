import { Routes, Route } from 'react-router-dom';

// Composants
import Header from './components/Header';
import Footer from './components/Footer';

// Vues
import Home from './views/Home';
import NotFound from './views/Notfound';

import './App.css'; 

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 p-8 font-sans">
      
      <Header />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer />

    </div>
  );
}

export default App;