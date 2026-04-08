import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, ShieldCheck, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { requestOTP, verifyOTP } from '../../api/auth';
import { joinQueue, getQueueStatus } from '../../api/queue';

export default function JoinQueue() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [queueStatus, setQueueStatus] = useState(null);
  const [error, setError] = useState(null);

  const CLINIC_ID = 1;

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    if (!phoneNumber) return;
    setLoading(true);
    setError(null);
    try {
      await requestOTP(phoneNumber);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to send OTP. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await verifyOTP(phoneNumber, otpCode);
      setUserData(data.user);
      setStep(3);
      checkStatus(data.user.id);
    } catch (err) {
      setError("Invalid code. Please check your terminal for the simulator code.");
    } finally {
      setLoading(false);
    }
  };

  const checkStatus = async (userId) => {
    try {
      const status = await getQueueStatus(CLINIC_ID, userId);
      setQueueStatus(status);
    } catch (err) {
      console.log("Not in queue yet");
    }
  };

  const handleJoinQueue = async () => {
    setLoading(true);
    try {
      await joinQueue(CLINIC_ID, userData.id);
      checkStatus(userData.id);
    } catch (err) {
      setError("Could not join queue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '20px' }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card"
        style={{ width: '100%', maxWidth: '420px', padding: '40px', position: 'relative', overflow: 'hidden' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ background: 'rgba(0, 112, 243, 0.1)', width: '64px', height: '64px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 3 }}>
              <ShieldCheck size={32} color="var(--primary)" />
            </motion.div>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', letterSpacing: '-0.5px' }}>FlowCare</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Smart Queue Management</p>
        </div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{ background: 'rgba(255, 77, 79, 0.1)', padding: '12px', borderRadius: '8px', color: 'var(--error)', fontSize: '14px', display: 'flex', gap: '8px', marginBottom: '20px', border: '1px solid rgba(255, 77, 79, 0.2)' }}
            >
              <AlertCircle size={18} /> {error}
            </motion.div>
          )}

          {step === 1 && (
            <motion.form 
              key="step1"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              onSubmit={handleRequestOTP}
            >
              <div style={{ marginBottom: '24px' }}>
                <label style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: 'block' }}>Phone Number</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} />
                  <input
                    type="tel"
                    placeholder="+91 99999 00000"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    style={{ paddingLeft: '44px' }}
                    required
                  />
                </div>
              </div>
              <button type="submit" className="primary" style={{ width: '100%' }} disabled={loading}>
                {loading ? <div className="loader" /> : <>Get Verification Code <ArrowRight size={18} /></>}
              </button>
            </motion.form>
          )}

          {step === 2 && (
            <motion.form 
              key="step2"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              onSubmit={handleVerifyOTP}
            >
              <div style={{ marginBottom: '24px' }}>
                <label style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: 'block' }}>Verification Code</label>
                <input
                  type="text"
                  placeholder="000 000"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  style={{ textAlign: 'center', letterSpacing: '8px', fontSize: '24px', fontWeight: '700' }}
                  required
                />
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '12px', textAlign: 'center' }}>
                  Check your backend console for the simulator code
                </p>
              </div>
              <button type="submit" className="primary" style={{ width: '100%', background: 'var(--success)' }} disabled={loading}>
                {loading ? <div className="loader" /> : <>Verify & Continue <CheckCircle2 size={18} /></>}
              </button>
              <button type="button" onClick={() => setStep(1)} style={{ width: '100%', background: 'transparent', color: 'var(--text-muted)', marginTop: '12px' }}>
                Change Phone Number
              </button>
            </motion.form>
          )}

          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{ textAlign: 'center' }}
            >
              {queueStatus ? (
                <div>
                  <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '4px' }}>Your Token</div>
                  <motion.h1 initial={{ scale: 0.5 }} animate={{ scale: 1 }} style={{ fontSize: '80px', fontWeight: '800', margin: '0', color: 'var(--primary)' }}>
                    {queueStatus.my_token}
                  </motion.h1>
                  <p style={{ fontWeight: '600', fontSize: '18px', marginBottom: '24px' }}>
                    {queueStatus.people_in_front} people ahead of you
                  </p>
                  <div style={{ padding: '12px', background: 'rgba(82, 196, 26, 0.1)', color: 'var(--success)', borderRadius: '12px', fontWeight: '600' }}>
                    Status: {queueStatus.status.toUpperCase()}
                  </div>
                </div>
              ) : (
                <div>
                  <p style={{ marginBottom: '24px', color: 'var(--text-muted)' }}>You aren't in the queue yet. Join now to save your spot!</p>
                  <button onClick={handleJoinQueue} className="primary" style={{ width: '100%', height: '60px', fontSize: '18px' }} disabled={loading}>
                    {loading ? <div className="loader" /> : "Join Queue Now"}
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
