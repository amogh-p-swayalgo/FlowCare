import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import JoinQueue from './pages/patient/JoinQueue';
import Dashboard from './pages/doctor/Dashboard';

export default function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          {/* Patient Portal (Default) */}
          <Route path="/" element={<JoinQueue />} />
          
          {/* Doctor Dashboard */}
          <Route path="/doctor" element={<Dashboard />} />
        </Routes>
      </div>
    </Router>
  );
}
