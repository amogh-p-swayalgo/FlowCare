import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Building2, Phone, History, Calendar, ChevronRight, 
    Clock, Users, LogOut, CheckCircle, FileText, XCircle, Play
} from 'lucide-react';
import { getActiveByPhone, leaveQueue, joinQueue, getQueueStatus } from '../api/queue';
import { getPatientHistory } from '../api/prescriptions';
import { toast } from 'react-hot-toast';

export default function PatientPortal() {
    const { clinic_id, phone } = useParams();
    const navigate = useNavigate();
    
    const [activeEntry, setActiveEntry] = useState(null);
    const [statusData, setStatusData] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    
    // Identity state for new users
    const [newName, setNewName] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('');

    useEffect(() => {
        fetchPortalData();
        const interval = setInterval(fetchPortalData, 10000); // Poll status every 10s
        return () => clearInterval(interval);
    }, [clinic_id, phone]);

    const fetchPortalData = async () => {
        try {
            // 1. Get active queue status
            const active = await getActiveByPhone(clinic_id, phone);
            setActiveEntry(active);
            
            if (active) {
                const status = await getQueueStatus(active.id);
                setStatusData(status);
            } else {
                setStatusData(null);
            }

            // 2. Get history
            const historyData = await getPatientHistory(phone, clinic_id);
            const prescriptions = historyData.prescriptions;
            setHistory(prescriptions);

            // 3. Pre-populate demographics if available
            if (active) {
                setAge(active.age || '');
                setGender(active.gender || '');
            } else if (prescriptions.length > 0) {
                const latest = prescriptions[0];
                setAge(latest.patient_age || '');
                setGender(latest.patient_gender || '');
            }
        } catch (err) {
            console.error("Portal fetch error:", err);
        } finally {
            setLoading(false);
        }
    };


    const handleLeaveQueue = async () => {
        if (!activeEntry) return;
        setActionLoading(true);
        try {
            await leaveQueue(activeEntry.id);
            toast.success("You have left the queue.");
            fetchPortalData();
        } catch (err) {
            toast.error("Failed to leave queue.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleJoinNow = async (e) => {
        e.preventDefault();
        const finalName = activeEntry?.name || history[0]?.patient_name || newName;
        
        if (!finalName) {
            toast.error("Please enter your name first.");
            return;
        }

        setActionLoading(true);
        try {
            await joinQueue({ 
                clinic_id, 
                name: finalName, 
                phone, 
                age: age ? parseInt(age) : null, 
                gender 
            });
            toast.success(`Welcome ${finalName}! You are in the queue.`);
            fetchPortalData();
        } catch (err) {
            toast.error("Failed to join queue.");
        } finally {
            setActionLoading(false);
        }
    };

    const displayName = activeEntry?.name || history[0]?.patient_name || "New Patient";

    if (loading) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="loader" style={{ borderTopColor: 'var(--primary)' }} /></div>;

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc', paddingBottom: '60px' }}>
            {/* Header */}
            <header style={{ background: 'white', borderBottom: '1px solid #e2e8f0', padding: '20px 0', position: 'sticky', top: 0, zIndex: 10 }}>
                <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--primary)' }} onClick={() => navigate(`/clinic/${clinic_id}`)} className="cursor-pointer">
                        <Building2 size={24} />
                        <span style={{ fontWeight: '800', fontSize: '18px', fontFamily: 'Outfit' }}>FlowCare Portal</span>
                    </div>
                    <button onClick={() => navigate(`/clinic/${clinic_id}`)} style={{ background: 'none', color: 'var(--text-muted)', fontSize: '14px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <LogOut size={16} /> Exit
                    </button>
                </div>
            </header>

            <main style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px' }}>
                <div style={{ marginBottom: '40px' }}>
                    <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '8px', fontFamily: 'Outfit' }}>Welcome, {displayName}</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Managed Care • {phone}</p>
                </div>

                {/* ACTIVE QUEUE CARD */}
                <section style={{ marginBottom: '48px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: activeEntry ? 'var(--success)' : '#cbd5e1' }} />
                        <h3 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Live Queue Status</h3>
                    </div>

                    <AnimatePresence mode="wait">
                        {activeEntry ? (
                            <motion.div 
                                key="active-status"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="glass-card" 
                                style={{ padding: '40px', background: 'white', border: '1px solid var(--primary-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                                    <div style={{ width: '70px', height: '70px', borderRadius: '20px', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: '900', boxShadow: '0 8px 16px rgba(0,71,171,0.2)' }}>
                                        {activeEntry.token_number}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '14px', color: 'var(--primary)', fontWeight: '700', marginBottom: '4px' }}>
                                            {activeEntry.status === 'called' ? "DOCTOR IS WAITING FOR YOU" : "YOUR POSITION IN LINE"}
                                        </div>
                                        <h2 style={{ fontSize: '24px', fontWeight: '800' }}>
                                            {activeEntry.status === 'called' ? "Please enter the room" : statusData?.position === 1 ? "You are next!" : `${statusData?.position} person(s) ahead`}
                                        </h2>
                                    </div>
                                </div>
                                <button 
                                    onClick={handleLeaveQueue}
                                    style={{ background: 'none', color: '#f87171', fontWeight: '700', fontSize: '14px', border: '1px solid #fee2e2', padding: '10px 20px', borderRadius: '12px' }}
                                    disabled={actionLoading}
                                >
                                    <XCircle size={18} /> Cancel Visit
                                </button>
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="join-prompt"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="glass-card" 
                                style={{ 
                                    padding: '60px 40px', 
                                    textAlign: 'center', 
                                    background: 'white', 
                                    border: '2px dashed #e2e8f0',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    minHeight: '350px'
                                }}
                            >
                                <div style={{ background: '#f8fafc', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                                    <Users size={32} style={{ color: '#94a3b8' }} />
                                </div>
                                <h3 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '12px', fontFamily: 'Outfit' }}>Ready for your visit?</h3>
                                <p style={{ color: 'var(--text-muted)', marginBottom: '32px', maxWidth: '300px', margin: '0 auto 32px', fontSize: '15px' }}>
                                    Join the waitlist now to see your doctor today.
                                </p>

                                <form onSubmit={handleJoinNow} style={{ width: '100%', maxWidth: '400px' }}>
                                    {(!activeEntry && history.length === 0) && (
                                        <div style={{ marginBottom: '16px' }}>
                                            <input 
                                                placeholder="Enter your full name" 
                                                value={newName} 
                                                onChange={e => setNewName(e.target.value)} 
                                                required 
                                                style={{ textAlign: 'center', fontSize: '18px', padding: '16px' }}
                                            />
                                        </div>
                                    )}

                                    {/* Age & Gender Row - Only show for truly new patients with no history */}
                                    {(!activeEntry && history.length === 0) && (
                                        <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '12px', marginBottom: '24px' }}>
                                            <input 
                                                type="number" 
                                                placeholder="Age" 
                                                value={age} 
                                                onChange={e => setAge(e.target.value)} 
                                                required 
                                                style={{ textAlign: 'center' }}
                                            />
                                            <div style={{ display: 'flex', gap: '8px', background: '#f1f5f9', padding: '4px', borderRadius: '12px' }}>
                                                {['Male', 'Female', 'Other'].map(g => (
                                                    <button 
                                                        key={g}
                                                        type="button"
                                                        onClick={() => setGender(g)}
                                                        style={{ 
                                                            flex: 1, padding: '8px 0', fontSize: '13px', borderRadius: '9px',
                                                            background: gender === g ? 'white' : 'transparent',
                                                            color: gender === g ? 'var(--primary)' : '#64748b',
                                                            boxShadow: gender === g ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
                                                            fontWeight: gender === g ? '800' : '600'
                                                        }}
                                                    >
                                                        {g}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}


                                    <button type="submit" className="primary" style={{ width: '100%', height: '56px', fontSize: '17px', borderRadius: '16px', boxShadow: '0 10px 20px rgba(0,71,171,0.15)' }} disabled={actionLoading}>
                                        {actionLoading ? <div className="loader" /> : <>Join The Queue Now</>}
                                    </button>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </section>

                {/* HISTORY SECTION */}
                <section>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                        <History size={20} color="var(--text-muted)" />
                        <h3 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Visit History</h3>
                    </div>

                    {history.length === 0 ? (
                        <div className="glass-card" style={{ padding: '60px', textAlign: 'center' }}>
                            <FileText size={40} style={{ opacity: 0.1, margin: '0 auto 16px' }} />
                            <p style={{ color: 'var(--text-muted)' }}>No medical records found for this clinic.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gap: '16px' }}>
                            {history.map((record) => (
                                <motion.div 
                                    key={record.id}
                                    whileHover={{ y: -2 }}
                                    onClick={() => navigate(`/clinic/${clinic_id}/prescription/${record.id}?is_presc=true`)}
                                    style={{ padding: '24px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                        <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px', color: 'var(--primary)' }}>
                                            <Calendar size={24} />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--primary)', marginBottom: '0px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{new Date(record.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                                            <div style={{ fontSize: '17px', fontWeight: '900', color: '#1E293B', marginTop: '-2px' }}>{record.diagnosis}</div>
                                        </div>

                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ textAlign: 'right', display: 'none' /* hidden on mobile? */ }}>
                                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700' }}>Records</div>
                                            <div style={{ fontSize: '13px', fontWeight: '600' }}>{record.medicines.length} Medicines</div>
                                        </div>
                                        <ChevronRight size={20} color="#cbd5e1" />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </section>
            </main>

            <footer style={{ textAlign: 'center', padding: '40px 0', opacity: 0.5 }}>
                <CheckCircle size={16} /> Secure Health Records • Managed by FlowCare
            </footer>
        </div>
    );
}
