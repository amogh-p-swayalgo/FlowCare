import React, { useState } from 'react';
import { requestOTP, verifyOTP } from '../../api/auth';

export default function JoinQueue() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [step, setStep] = useState(1); // 1: Phone, 2: OTP
  const [loading, setLoading] = useState(false);

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    if (!phoneNumber) return;
    
    setLoading(true);
    try {
      await requestOTP(phoneNumber);
      setStep(2);
    } catch (error) {
      alert("Failed to send OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otpCode) return;

    setLoading(true);
    try {
      const data = await verifyOTP(phoneNumber, otpCode);
      alert(`Welcome ${data.user.phone_number}! You are now logged in.`);
      // Redirect logic here if using a router
    } catch (error) {
      alert("Invalid OTP code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '400px', margin: 'auto', textAlign: 'center', marginTop: '50px' }}>
      <h1>FlowCare</h1>
      <p>Instant Clinic Queue</p>

      {step === 1 ? (
        <form onSubmit={handleRequestOTP}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '8px' }}>Enter Phone Number</label>
            <input
              type="tel"
              placeholder="+91 99999 99999"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              style={{ padding: '12px', width: '100%', borderRadius: '4px', border: '1px solid #ccc' }}
              disabled={loading}
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            style={{ padding: '12px 24px', width: '100%', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            {loading ? 'Sending...' : 'Get OTP Code'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOTP}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '8px' }}>Enter 6-Digit Code</label>
            <input
              type="text"
              placeholder="000000"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              style={{ padding: '12px', width: '100%', borderRadius: '4px', border: '1px solid #ccc', textAlign: 'center', letterSpacing: '4px' }}
              disabled={loading}
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            style={{ padding: '12px 24px', width: '100%', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            {loading ? 'Verifying...' : 'Join Queue'}
          </button>
          <button 
            type="button"
            onClick={() => setStep(1)}
            style={{ marginTop: '1rem', background: 'none', border: 'none', color: '#007bff', cursor: 'pointer' }}
          >
            Change Phone Number
          </button>
        </form>
      )}
    </div>
  );
}
