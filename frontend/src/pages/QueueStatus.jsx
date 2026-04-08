import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, FileText, ArrowRight, CheckCircle, Activity } from 'lucide-react';
import { getQueueStatus } from '../api/queue';

export default function QueueStatus() {
    const { clinic_id, entry_id } = useParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStatus();
        const interval = setInterval(fetchStatus, 5000); 
        return () => clearInterval(interval);
    }, [entry_id]);

    const fetchStatus = async () => {
        try {
            const data = await getQueueStatus(entry_id);
            setStatus(data);
        } catch (err) {
            console.error("Status fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="loader" style={{ borderTopColor: 'var(--primary)' }} /></div>;

    if (!status) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Error loading status</div>;

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: '20px' }}>
            <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card" 
                style={{ width: '100%', maxWidth: '460px', padding: '48px', textAlign: 'center' }}
            >
                <header style={{ marginBottom: '40px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}>
                        <div className="pulse-indicator" />
                        <span className="badge badge-primary" style={{ fontSize: '10px' }}>Live Connection</span>
                    </div>
                    <h2 style={{ fontSize: '32px', fontWeight: '800', fontFamily: 'Outfit', marginBottom: '8px' }}>Hello, {status.name}</h2>
                    <div style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: '600' }}>Patient Token: <span style={{ color: 'var(--primary)' }}>#{status.token_number}</span></div>
                </header>

                <div style={{ background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)', borderRadius: '32px', padding: '48px 32px', marginBottom: '40px', border: '1px solid var(--border)' }}>
                    {status.status === 'waiting' ? (
                        <>
                            <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>Current Position</div>
                            <div style={{ fontSize: '84px', fontWeight: '900', color: 'var(--primary)', lineHeight: 0.9, fontFamily: 'Outfit', letterSpacing: '-4px' }}>{status.position}</div>
                            <div style={{ fontSize: '15px', color: 'var(--text-muted)', marginTop: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                                <Activity size={18} color="var(--primary)" /> Smart Queue Active
                            </div>
                        </>
                    ) : status.status === 'called' ? (
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} style={{ color: 'var(--success)' }}>
                            <div style={{ background: 'white', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 10px 20px rgba(16, 185, 129, 0.2)' }}>
                                <CheckCircle size={48} />
                            </div>
                            <h3 style={{ fontSize: '24px', fontWeight: '800', fontFamily: 'Outfit', marginBottom: '8px' }}>It's Your Turn!</h3>
                            <p style={{ fontSize: '16px', fontWeight: '500' }}>Please proceed to the doctor's room now.</p>
                        </motion.div>
                    ) : (
                        <div style={{ color: 'var(--primary)' }}>
                            <div style={{ background: 'white', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 10px 20px rgba(0, 71, 171, 0.1)' }}>
                                <FileText size={40} />
                            </div>
                            <h3 style={{ fontSize: '24px', fontWeight: '800', fontFamily: 'Outfit', marginBottom: '8px' }}>Visit Completed</h3>
                            <p style={{ fontSize: '15px', color: 'var(--text-muted)', marginBottom: '32px' }}>Your digital prescription is ready for download.</p>
                            <button 
                                className="primary" 
                                style={{ width: '100%', height: '56px' }}
                                onClick={() => navigate(`/clinic/${clinic_id}/prescription/${entry_id}?phone=${status.phone}`)}
                            >
                                View Prescription <ArrowRight size={20} />
                            </button>
                        </div>
                    )}
                </div>

                <div style={{ display: 'grid', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 20px', background: 'white', borderRadius: '16px', border: '1px solid var(--border)', textAlign: 'left' }}>
                        <div style={{ background: 'var(--primary-light)', padding: '10px', borderRadius: '12px' }}>
                            <Clock size={20} color="var(--primary)" />
                        </div>
                        <div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700' }}>Est. Waiting Time</div>
                            <div style={{ fontSize: '15px', fontWeight: '800' }}>~{status.position * 10} minutes</div>
                        </div>
                    </div>
                </div>

                <footer style={{ marginTop: '40px', fontSize: '12px', color: '#cbd5e1', fontWeight: '600' }}>
                    Powered by <span style={{ color: '#94a3b8' }}>FlowCare Smart Clinic</span>
                </footer>
            </motion.div>
        </div>
    );
}
