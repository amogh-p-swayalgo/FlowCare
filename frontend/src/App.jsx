import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SignupPage from './pages/SignupPage';
import DoctorDashboard from './pages/DoctorDashboard';
import ClinicLanding from './pages/ClinicLanding';
import QueueStatus from './pages/QueueStatus';
import PrescriptionView from './pages/PrescriptionView';
import PatientPortal from './pages/PatientPortal';

export default function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          {/* Clinic Signup & Auth */}
          <Route path="/" element={<SignupPage />} />
          
          {/* Doctor Experience */}
          <Route path="/clinic/:clinic_id/doctor" element={<DoctorDashboard />} />

          {/* Patient Experience */}
          <Route path="/clinic/:clinic_id" element={<ClinicLanding />} />
          <Route path="/clinic/:clinic_id/portal/:phone" element={<PatientPortal />} />
          <Route path="/clinic/:clinic_id/status/:entry_id" element={<QueueStatus />} />
          <Route path="/clinic/:clinic_id/prescription/:entry_id" element={<PrescriptionView />} />
        </Routes>
      </div>
    </Router>
  );
}
