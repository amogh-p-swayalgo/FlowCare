import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle, MapPin, Building2, LayoutDashboard, Settings, LogOut, Users, Play, UserPlus } from 'lucide-react';
import { createClinic } from '../../api/clinic';
import { listQueue, callNext } from '../../api/queue';

export default function Dashboard() {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [clinicId, setClinicId] = useState(localStorage.getItem('clinic_id'));
  const [waitlist, setWaitlist] = useState([]);
  const [activePatient, setActivePatient] = useState(null);

  // Poll for updates if in manager mode
  useEffect(() => {
    if (clinicId) {
      const interval = setInterval(() => fetchQueue(), 5000);
      fetchQueue();
      return () => clearInterval(interval);
    }
  }, [clinicId]);

  const fetchQueue = async () => {
    try {
      const data = await listQueue(clinicId);
      setWaitlist(data.filter(p => p.status === 'waiting'));
      setActivePatient(data.find(p => p.status === 'called'));
    } catch (err) {
      console.error("Queue fetch failed", err);
    }
  };

  const handleCreateClinic = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await createClinic({ name, address });
      localStorage.setItem('clinic_id', data.id);
      setClinicId(data.id);
    } catch (err) {
      alert("Setup failed. Check backend.");
    } finally {
      setLoading(false);
    }
  };

  const handleCallNext = async () => {
    setLoading(true);
    try {
      await callNext(clinicId);
      await fetchQueue();
    } catch (err) {
      alert("Could not call next patient.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <div style={{ width: '260px', background: 'white', borderRight: '1px solid var(--border)', padding: '32px 24px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '48px', padding: '0 8px' }}>
          <div style={{ background: 'var(--primary)', padding: '8px', borderRadius: '10px' }}>
            <Building2 color="white" size={24} />
          </div>
          <span style={{ fontWeight: '700', fontSize: '20px' }}>FlowCare</span>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ padding: '12px 16px', borderRadius: '10px', background: 'rgba(0, 112, 243, 0.05)', color: 'var(--primary)', fontWeight: '600', display: 'flex', gap: '12px', marginBottom: '4px' }}>
            <LayoutDashboard size={20} /> Dashboard
          </div>
          <div onClick={() => { localStorage.removeItem('clinic_id'); setClinicId(null); }} style={{ padding: '12px 16px', borderRadius: '10px', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', gap: '12px' }}>
            <Settings size={20} /> Reset Setup
          </div>
        </div>
        <button style={{ background: 'transparent', color: 'var(--error)', justifyContent: 'flex-start' }}><LogOut size={20} /> Logout</button>
      </div>

      <div style={{ flex: 1, padding: '48px 64px', backgroundColor: '#fcfcfc' }}>
        <AnimatePresence mode="wait">
          {!clinicId ? (
            <motion.div key="setup" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
              <header style={{ marginBottom: '40px' }}>
                <h1 style={{ fontSize: '32px', fontWeight: '800' }}>Clinic Setup</h1>
                <p style={{ color: 'var(--text-muted)' }}>You must register your clinic before you can manage patients.</p>
              </header>
              <div className="glass-card" style={{ maxWidth: '600px', padding: '32px' }}>
                <form onSubmit={handleCreateClinic}>
                  <div style={{ display: 'grid', gap: '20px', marginBottom: '24px' }}>
                    <input placeholder="Clinic Name" value={name} onChange={e => setName(e.target.value)} required />
                    <input placeholder="Physical Address" value={address} onChange={e => setAddress(e.target.value)} required />
                  </div>
                  <button type="submit" className="primary" style={{ width: '100%' }} disabled={loading}>
                    {loading ? <div className="loader" /> : "Complete Setup"}
                  </button>
                </form>
              </div>
            </motion.div>
          ) : (
            <motion.div key="manager" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                  <h1 style={{ fontSize: '32px', fontWeight: '800' }}>Queue Manager</h1>
                  <p style={{ color: 'var(--text-muted)' }}>Manage live patient flow for Clinic ID: #{clinicId}</p>
                </div>
                <div style={{ background: 'var(--success)', color: 'white', padding: '8px 16px', borderRadius: '30px', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '8px', height: '8px', background: 'white', borderRadius: '50%', animation: 'pulse 2s infinite' }} /> Live System
                </div>
              </header>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '32px' }}>
                {/* Main Queue Management */}
                <div>
                  <div className="glass-card" style={{ padding: '32px', marginBottom: '32px', background: 'linear-gradient(135deg, white 0%, #f0f7ff 100%)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Currently Calling</span>
                        <h2 style={{ fontSize: '64px', fontWeight: '900', margin: '4px 0' }}>
                          {activePatient ? `#${activePatient.token_number}` : 'None'}
                        </h2>
                        {activePatient && <p style={{ color: 'var(--text-muted)' }}>Patient ID: {activePatient.user_id}</p>}
                      </div>
                      <button 
                        onClick={handleCallNext} 
                        className="primary" 
                        style={{ height: '72px', padding: '0 32px', fontSize: '18px', borderRadius: '16px', boxShadow: '0 8px 20px rgba(0, 112, 243, 0.2)' }}
                        disabled={loading || waitlist.length === 0}
                      >
                        {loading ? <div className="loader" /> : <><Play fill="currentColor" /> Call Next Patient</>}
                      </button>
                    </div>
                  </div>

                  <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
                    <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
                      <h3 style={{ fontWeight: '700', display: 'flex', gap: '10px' }}><Users size={20} color="var(--primary)" /> Waiting List</h3>
                      <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{waitlist.length} patients waiting</span>
                    </div>
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                      {waitlist.length > 0 ? waitlist.map((p, i) => (
                        <div key={p.id} style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: i === waitlist.length - 1 ? 'none' : '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : '#fafafa' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ width: '40px', height: '40px', background: '#eee', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '14px' }}>
                              #{p.token_number}
                            </div>
                            <div>
                              <div style={{ fontWeight: '600' }}>Patient #{p.user_id}</div>
                              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Joined {new Date(p.joined_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                            </div>
                          </div>
                          <div style={{ fontSize: '13px', px: '10px', py: '4px', background: '#eee', borderRadius: '4px', color: '#666', fontWeight: '600' }}>WAITING</div>
                        </div>
                      )) : (
                        <div style={{ padding: '64px', textAlign: 'center', color: '#ccc' }}>
                          <UserPlus size={48} style={{ margin: '0 auto 16px' }} />
                          <p>No patients in line yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Side Analytics (Placeholders) */}
                <div style={{ display: 'grid', gap: '24px' }}>
                  <div className="glass-card" style={{ padding: '24px' }}>
                    <h4 style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px' }}>Quick Stats</h4>
                    <div style={{ display: 'grid', gap: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Total Today</span><strong>{waitlist.length + (activePatient ? 1 : 0)}</strong></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Avg. Wait</span><strong>12 min</strong></div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
