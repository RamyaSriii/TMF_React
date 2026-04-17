import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import PredictionPage from './pages/PredictionPage';
import Navbar from './components/Navbar';
import './styles/global.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/predict" element={<PredictionPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
