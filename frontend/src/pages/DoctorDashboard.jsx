import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    LayoutDashboard, Settings, LogOut, Users, Play, UserPlus, 
    CheckCircle, Clock, Save, Building2, ChevronRight, History,
    Shield, BarChart3, Bell
} from 'lucide-react';
import { getAdminClinicInfo, updateClinicInfo } from '../api/clinic';
import { listClinicQueue, callNextPatient, getActivePatient } from '../api/queue';
import PrescriptionForm from './PrescriptionForm';
import { toast } from 'react-hot-toast';

export default function DoctorDashboard() {
    const { clinic_id } = useParams();
    const navigate = useNavigate();
    const [clinic, setClinic] = useState(null);
    const [queue, setQueue] = useState([]);
    const [activePatient, setActivePatient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [savingSettings, setSavingSettings] = useState(false);
    
    // Professional Settings State
    const [settingsData, setSettingsData] = useState({
        clinic_name: '',
        address: '',
        phone: '',
        email: '',
        owner_name: '',
        reg_number: '',
        specialty: ''
    });


    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) { navigate('/'); return; }
        
        // Fetch static settings once
        fetchSettings();
        
        // Poll dynamic data
        fetchDashboardData();
        const interval = setInterval(fetchDashboardData, 5000); 
        return () => clearInterval(interval);
    }, [clinic_id]);

    const fetchSettings = async () => {
        try {
            const clinicData = await getAdminClinicInfo(clinic_id);
            setSettingsData({
                name: clinicData.name || '',
                address: clinicData.address || '',
                phone: clinicData.phone || '',
                email: clinicData.email || '',
                owner_name: clinicData.owner_name || '',
                reg_number: clinicData.reg_number || '',
                specialty: clinicData.specialty || ''
            });
        } catch (err) {
            console.error("Settings fetch error:", err);
        }
    };


    const fetchDashboardData = async () => {
        try {
            const clinicData = await getAdminClinicInfo(clinic_id);
            setClinic(clinicData);
            
            const queueData = await listClinicQueue(clinic_id);
            setQueue(queueData);
            const activeData = await getActivePatient(clinic_id);
            setActivePatient(activeData);
        } catch (err) {

            console.error("Dashboard error:", err);
        } finally {
            setLoading(false);
        }
    };


    const handleCallNext = async () => {
        try {
            await callNextPatient(clinic_id);
            toast.success("Next patient called.");
            fetchDashboardData();
        } catch (err) {
            toast.error("Waitlist is empty.");
        }
    };

    const handleSaveSettings = async (e) => {
        e.preventDefault();
        setSavingSettings(true);
        try {
            await updateClinicInfo(clinic_id, settingsData);
            toast.success("Clinic configuration deployed.");
            fetchDashboardData();
        } catch (err) {
            toast.error("Failed to update clinic info.");
        } finally {
            setSavingSettings(false);
        }
    };


    if (loading) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="loader" style={{ borderTopColor: 'var(--primary)' }} /></div>;

    return (
        <div style={{ display: 'flex', height: '100vh', background: '#F8FAFC', overflow: 'hidden' }}>
            {/* 💎 Professional Unified Sidebar */}
            <aside style={{ width: '280px', background: '#0F172A', display: 'flex', flexDirection: 'column', color: 'white' }}>
                <div style={{ padding: '40px 30px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{ background: 'var(--primary)', padding: '10px', borderRadius: '14px', boxShadow: '0 8px 16px rgba(0,71,171,0.3)' }}>
                            <Building2 size={24} color="white" />
                        </div>
                        <div>
                            <span style={{ fontWeight: '900', fontSize: '22px', fontFamily: 'Outfit', display: 'block', lineHeight: 1 }}>FlowCare</span>
                            <span style={{ fontSize: '10px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>Clinic Suite</span>
                        </div>
                    </div>
                </div>

                <nav style={{ padding: '30px 20px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                    <SidebarLink icon={<LayoutDashboard size={20} />} label="Live Waitlist" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
                    <SidebarLink icon={<UserPlus size={20} />} label="Patient Portal" onClick={() => window.open(`/clinic/${clinic_id}`, '_blank')} />
                    <SidebarLink icon={<Settings size={20} />} label="Clinic Config" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
                </nav>

                <div style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <button onClick={() => { localStorage.removeItem('token'); navigate('/'); }} style={{ width: '100%', justifyContent: 'flex-start', background: 'transparent', color: '#f87171', border: 'none', padding: '12px 16px' }} className="sidebar-item">
                        <LogOut size={20} /> <span style={{ fontWeight: '700' }}>Admin Logout</span>
                    </button>
                </div>
            </aside>

            {/* 🖥️ Main Professional Content Area */}
            <main style={{ flex: 1, height: '100vh', overflowY: 'auto' }}>
                {/* Global Top Bar */}
                <header style={{ height: '70px', borderBottom: '1px solid #E2E8F0', background: 'white', padding: '0 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ padding: '8px', background: '#F1F5F9', borderRadius: '10px' }}><Shield size={18} color="var(--primary)" /></div>
                        <h2 style={{ fontSize: '13px', fontWeight: '800', color: '#1e293b', textTransform: 'uppercase' }}>{clinic?.name} • Control</h2>

                    </div>
                </header>

                <div style={{ padding: '40px' }}>
                    {activeTab === 'overview' ? (
                        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
                                <div>
                                    <h1 style={{ fontSize: '32px', fontWeight: '900', letterSpacing: '-1.2px', marginBottom: '4px' }}>Waitlist</h1>
                                    <p style={{ color: '#64748b', fontSize: '14px', fontWeight: '600' }}>Manage patient flow</p>
                                </div>
                                <button className="primary" onClick={handleCallNext} style={{ height: '48px', padding: '0 24px', borderRadius: '12px', background: '#10b981' }}>
                                    <Play size={18} fill="white" /> Call Next
                                </button>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '40px', alignItems: 'start' }}>
                                <div style={{ display: 'grid', gap: '32px' }}>
                                    {/* 🏥 Active Patient Command Center */}
                                    <section>
                                        {activePatient ? (
                                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'white', borderRadius: '20px', padding: '24px 32px', border: '1.5px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                                    <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '24px', fontWeight: '900' }}>{activePatient.token_number}</div>
                                                    <div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--primary)', marginBottom: '2px' }}>IN ROOM</div>
                                                            {activePatient.is_new_patient && <div style={{ fontSize: '9px', fontWeight: '800', background: '#ecfdf5', color: '#10b981', padding: '2px 6px', borderRadius: '4px', border: '1px solid #d1fae5' }}>NEW PATIENT</div>}
                                                        </div>
                                                        <h2 style={{ fontSize: '22px', fontWeight: '900', color: '#0F172A' }}>
                                                            {activePatient.name} 
                                                            <span style={{ fontSize: '15px', fontWeight: '600', color: '#94a3b8', margin: '0 8px' }}>{activePatient.age || '??'}y, {activePatient.gender || 'Unknown'}</span>
                                                        </h2>
                                                    </div>
                                                </div>
                                                <button onClick={() => setSelectedPatient(activePatient)} className="primary" style={{ padding: '0 24px', height: '44px', fontSize: '14px' }}>
                                                    Prescribe <ChevronRight size={16} />
                                                </button>
                                            </motion.div>
                                        ) : (
                                            <div style={{ padding: '40px', textAlign: 'center', background: 'white', borderRadius: '20px', border: '2px dashed #E2E8F0', color: '#94a3b8' }}>
                                                <p style={{ fontWeight: '700', fontSize: '14px' }}>Ready for next patient.</p>
                                            </div>
                                        )}
                                    </section>

                                    {/* 📋 Live Waitlist Grid */}
                                    <section>
                                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '16px', letterSpacing: '1px' }}>Upcoming Patients ({queue.length})</label>
                                        <div style={{ background: 'white', borderRadius: '24px', border: '1.5px solid #e2e8f0', overflow: 'hidden' }}>
                                            {queue.length === 0 ? (
                                                <div style={{ padding: '80px', textAlign: 'center', color: '#94a3b8', fontSize: '15px' }}>No patients in the waitlist today.</div>
                                            ) : (
                                                <div style={{ display: 'grid' }}>
                                                    {queue.map((p, i) => (
                                                        <div key={p.id} style={{ padding: '20px 32px', borderBottom: i === queue.length -1 ? 'none' : '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: '24px' }} className="waitlist-row">
                                                            <div style={{ width: '36px', height: '36px', background: '#F1F5F9', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '800', color: '#64748B' }}>{p.token_number}</div>
                                                            <div style={{ flex: 1 }}>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                                    <div style={{ fontWeight: '700', fontSize: '17px', color: '#1E293B' }}>{p.name}</div>
                                                                    {p.is_new_patient && <div style={{ fontSize: '9px', fontWeight: '800', background: '#ecfdf5', color: '#10b981', padding: '2px 6px', borderRadius: '4px', border: '1px solid #d1fae5' }}>NEW PATIENT</div>}
                                                                </div>
                                                                <div style={{ fontSize: '12px', color: '#94A3B8', fontWeight: '700' }}>{p.age || '??'} Years • {p.gender || 'Unknown'} </div>
                                                            </div>
                                                            <div style={{ fontSize: '13px', color: '#94A3B8', fontWeight: '600', textAlign: 'right' }}>Joined {new Date(p.joined_at).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}</div>
                                                            <button onClick={() => navigate(`/clinic/${clinic_id}/prescription/${p.id}?phone=${p.phone}`)} style={{ background: '#F0F7FF', color: 'var(--primary)', border: 'none', padding: '8px 16px', borderRadius: '10px', fontSize: '12px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                <History size={15} /> History
                                                            </button>
                                                            <div className="badge badge-warning">Waiting</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </section>
                                </div>

                                {/* 📊 Sidebar Stats */}
                                <aside style={{ display: 'grid', gap: '24px' }}>
                                    <StatCard label="Live Tokens" value={queue.length} icon={<Users size={22} />} color="var(--primary)" />
                                    <StatCard label="Doc Presence" value={activePatient ? "Busy" : "Ready"} icon={<Clock size={22} />} color={activePatient ? "var(--warning)" : "var(--success)"} />
                                    <StatCard label="Today Done" value="--" icon={<CheckCircle size={22} />} color="#94A3B8" />
                                </aside>
                            </div>
                        </div>
                    ) : (
                        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                             <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '16px', letterSpacing: '1px' }}>System Configuration</label>
                             <div style={{ background: 'white', padding: '48px', borderRadius: '24px', border: '1.5px solid #E2E8F0', boxShadow: '0 10px 40px rgba(0,0,0,0.03)' }}>
                                <h1 style={{ fontSize: '32px', fontWeight: '900', marginBottom: '40px' }}>Clinic Identity</h1>
                                <form onSubmit={handleSaveSettings}>
                                    <div style={{ marginBottom: '32px' }}>
                                        <label style={{ display: 'block', fontWeight: '800', fontSize: '13px', marginBottom: '10px', color: '#64748B' }}>DISPLAY CLINIC NAME</label>
                                        <input value={settingsData.name} onChange={e => setSettingsData({...settingsData, name: e.target.value})} style={{ background: '#F8FAFC', padding: '16px', fontSize: '16px', borderRadius: '14px' }} required />

                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                        <div>
                                            <label style={{ display: 'block', fontWeight: '800', fontSize: '11px', marginBottom: '8px', color: '#64748B', textTransform: 'uppercase' }}>Medical Reg No.</label>
                                            <input value={settingsData.reg_number} onChange={e => setSettingsData({...settingsData, reg_number: e.target.value})} placeholder="e.g. MC-12345" style={{ width: '100%', background: '#F8FAFC', padding: '14px', fontSize: '15px', borderRadius: '12px', border: '1.5px solid #E2E8F0' }} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontWeight: '800', fontSize: '11px', marginBottom: '8px', color: '#64748B', textTransform: 'uppercase' }}>Specialization</label>
                                            <input value={settingsData.specialty} onChange={e => setSettingsData({...settingsData, specialty: e.target.value})} placeholder="e.g. Pediatrics" style={{ width: '100%', background: '#F8FAFC', padding: '14px', fontSize: '15px', borderRadius: '12px', border: '1.5px solid #E2E8F0' }} />
                                        </div>
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', fontWeight: '800', fontSize: '11px', marginBottom: '8px', color: '#64748B', textTransform: 'uppercase' }}>Clinic Address</label>
                                        <input value={settingsData.address} onChange={e => setSettingsData({...settingsData, address: e.target.value})} placeholder="Full clinical address" style={{ width: '100%', background: '#F8FAFC', padding: '14px', fontSize: '15px', borderRadius: '12px', border: '1.5px solid #E2E8F0' }} />
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '16px' }}>
                                        <div>
                                            <label style={{ display: 'block', fontWeight: '800', fontSize: '11px', marginBottom: '8px', color: '#64748B', textTransform: 'uppercase' }}>Contact Phone</label>
                                            <input value={settingsData.phone} onChange={e => setSettingsData({...settingsData, phone: e.target.value})} style={{ width: '100%', background: '#F8FAFC', padding: '14px', fontSize: '15px', borderRadius: '12px', border: '1.5px solid #E2E8F0' }} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontWeight: '800', fontSize: '11px', marginBottom: '8px', color: '#64748B', textTransform: 'uppercase' }}>Official Email</label>
                                            <input value={settingsData.email} onChange={e => setSettingsData({...settingsData, email: e.target.value})} type="email" style={{ width: '100%', background: '#F8FAFC', padding: '14px', fontSize: '15px', borderRadius: '12px', border: '1.5px solid #E2E8F0' }} />
                                        </div>
                                    </div>

                                    <button type="submit" className="primary" style={{ width: '100%', height: '56px', borderRadius: '14px', marginTop: '16px' }} disabled={savingSettings}>
                                        {savingSettings ? <div className="loader" /> : <><Save size={20} /> Deploy Changes</>}
                                    </button>

                                </form>
                             </div>
                        </div>
                    )}
                </div>
            </main>

            <AnimatePresence>
                {selectedPatient && (
                    <PrescriptionForm patient={selectedPatient} clinicId={clinic_id} onClose={() => setSelectedPatient(null)} onSuccess={() => { setSelectedPatient(null); fetchDashboardData(); }} />
                )}
            </AnimatePresence>

            <style>{`
                .sidebar-item:hover { background: rgba(255,255,255,0.05); }
                .waitlist-row { transition: all 0.2s; }
                .waitlist-row:hover { background: #FCFCFD; transform: translateX(5px); }
            `}</style>
        </div>
    );
}

function SidebarLink({ icon, label, active, onClick, status }) {
    return (
        <button 
            onClick={onClick}
            style={{ 
                width: '100%', padding: '14px 18px', borderRadius: '14px', border: 'none', background: active ? 'var(--primary)' : 'transparent', color: active ? 'white' : '#94A3B8', display: 'flex', alignItems: 'center', gap: '14px', transition: 'all 0.2s', cursor: 'pointer', textAlign: 'left', position: 'relative'
            }}
        >
            <span style={{ color: active ? 'white' : '#64748B' }}>{icon}</span>
            <span style={{ fontWeight: '700', fontSize: '15px' }}>{label}</span>
            {status && <span style={{ position: 'absolute', right: '12px', fontSize: '8px', background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)' }}>{status}</span>}
        </button>
    );
}

function StatCard({ label, value, icon, color }) {
    return (
        <div style={{ background: 'white', padding: '30px', borderRadius: '24px', border: '1.5px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={{ background: color + '12', color: color, width: '60px', height: '60px', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{icon}</div>
            <div>
                <div style={{ fontSize: '12px', color: '#94A3B8', fontWeight: '800', textTransform: 'uppercase', marginBottom: '4px' }}>{label}</div>
                <div style={{ fontSize: '28px', fontWeight: '900', color: '#1E293B', fontFamily: 'Outfit' }}>{value}</div>
            </div>
        </div>
    );
}
