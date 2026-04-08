import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, FileText, ClipboardList, ShieldCheck, Printer, History, ChevronRight, Calendar, CheckCircle } from 'lucide-react';
import { getHistoryByEntry, getPrescriptionById } from '../api/prescriptions';

export default function PrescriptionView() {
    const { entry_id } = useParams();
    const [searchParams] = useSearchParams();
    const isPresc = searchParams.get('is_presc');
    
    const [history, setHistory] = useState([]);
    const [selectedPresc, setSelectedPresc] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isPresc) {
            // Direct lookup for a specific prescription ID
            getPrescriptionById(entry_id)
                .then(data => {
                    setHistory([data]);
                    setSelectedPresc(data);
                })
                .catch(err => console.error("Prescription fetch error:", err))
                .finally(() => setLoading(false));
        } else {
            // Traditional entry-based history lookup
            getHistoryByEntry(entry_id)
                .then(data => {
                    setHistory(data.prescriptions);
                    if (data.prescriptions.length > 0) setSelectedPresc(data.prescriptions[0]);
                })
                .catch(err => console.error("History fetch error:", err))
                .finally(() => setLoading(false));
        }
    }, [entry_id, isPresc]);

    const handlePrint = () => window.print();

    if (loading) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="loader" style={{ borderTopColor: 'var(--primary)' }} /></div>;

    if (history.length === 0) return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
            <div className="glass-card" style={{ padding: '60px', maxWidth: '500px' }}>
                <History size={64} color="#cbd5e1" style={{ marginBottom: '24px' }} />
                <h2 style={{ fontFamily: 'Outfit', marginBottom: '16px' }}>No Medical Records Found</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>We couldn't find any finalized prescriptions for this visit yet. Please wait for the doctor to complete the session.</p>
            </div>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex' }} className="prescription-portal">
            {/* Sidebar: Visit History Timeline */}
            <aside style={{ width: '380px', background: 'white', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', height: '100vh', position: 'sticky', top: 0 }} className="no-print">
                <div style={{ padding: '40px 32px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary)', marginBottom: '8px' }}>
                        <Building2 size={24} />
                        <span style={{ fontWeight: '800', fontSize: '18px', fontFamily: 'Outfit' }}>FlowCare Portal</span>
                    </div>
                    <h2 style={{ fontSize: '24px', fontWeight: '800', fontFamily: 'Outfit' }}>My Records</h2>
                    <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{history[0]?.patient_name || 'Patient'}</p>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '1px' }}>Visit History</div>
                    <div style={{ display: 'grid', gap: '12px' }}>
                        {history.map((presc) => (
                            <button 
                                key={presc.id} 
                                onClick={() => setSelectedPresc(presc)}
                                style={{ 
                                    width: '100%', padding: '20px', textAlign: 'left', borderRadius: '16px', border: '1px solid',
                                    borderColor: selectedPresc?.id === presc.id ? 'var(--primary)' : 'var(--border)',
                                    background: selectedPresc?.id === presc.id ? 'var(--primary-light)' : 'white',
                                    transition: 'all 0.2s',
                                    cursor: 'pointer'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '700', color: selectedPresc?.id === presc.id ? 'var(--primary)' : 'var(--text)' }}>
                                        <Calendar size={14} /> {new Date(presc.created_at).toLocaleDateString()}
                                    </div>
                                    <ChevronRight size={16} color={selectedPresc?.id === presc.id ? 'var(--primary)' : '#cbd5e1'} />
                                </div>
                                <div style={{ fontSize: '15px', fontWeight: '600', color: selectedPresc?.id === presc.id ? 'var(--secondary)' : 'var(--text-muted)' }}>{presc.diagnosis}</div>
                            </button>
                        ))}
                    </div>
                </div>
            </aside>

            {/* Main Content: Selected Prescription View */}
            <main style={{ flex: 1, padding: '60px 40px', display: 'flex', justifyContent: 'center' }}>
                <AnimatePresence mode="wait">
                    {selectedPresc && (
                        <motion.div 
                            key={selectedPresc.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            style={{ width: '100%', maxWidth: '800px' }}
                        >
                            <div className="prescription-paper" style={{ padding: '60px', position: 'relative', overflow: 'hidden' }}>

                                {/* 🏥 Elite Watermark */}
                                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(-30deg)', opacity: 0.03, pointerEvents: 'none', zIndex: 0 }}>
                                    <ShieldCheck size={400} />
                                </div>

                                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '3px solid var(--primary)', paddingBottom: '30px', marginBottom: '40px', position: 'relative', zIndex: 1 }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--primary)', marginBottom: '8px' }}>
                                            <Building2 size={40} />
                                            <div>
                                                <div style={{ fontWeight: '900', fontSize: '28px', fontFamily: 'Outfit', lineHeight: 1.1 }}>{selectedPresc.clinic_name}</div>
                                                <div style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', opacity: 0.8 }}>{selectedPresc.doctor_specialty || ''}</div>

                                            </div>
                                        </div>
                                        <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600', maxWidth: '300px' }}>
                                            {selectedPresc.clinic_address}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>Official Record</div>
                                        <div style={{ fontSize: '20px', fontWeight: '900', color: 'var(--secondary)', marginBottom: '4px' }}>#RE-{selectedPresc.id}</div>
                                        <div style={{ fontSize: '14px', fontWeight: '700', color: '#64748b' }}>{selectedPresc.clinic_phone}</div>
                                    </div>
                                </header>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', background: '#F8FAFC', borderRadius: '16px', padding: '24px', marginBottom: '40px', border: '1px solid #E2E8F0', position: 'relative', zIndex: 1 }}>
                                    <div>
                                        <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase', marginBottom: '4px' }}>Patient Name</div>
                                        <div style={{ fontSize: '15px', fontWeight: '800', color: '#1e293b' }}>{selectedPresc.patient_name}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase', marginBottom: '4px' }}>Age / Gender</div>
                                        <div style={{ fontSize: '15px', fontWeight: '800', color: '#1e293b' }}>
                                            {selectedPresc.patient_age ? `${selectedPresc.patient_age}Y` : '--'} / {selectedPresc.patient_gender || 'Not Specified'}
                                        </div>

                                    </div>
                                    <div>
                                        <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase', marginBottom: '4px' }}>Consultation Date</div>
                                        <div style={{ fontSize: '15px', fontWeight: '800', color: '#1e293b' }}>{new Date(selectedPresc.created_at).toLocaleDateString()}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase', marginBottom: '4px' }}>Time</div>
                                        <div style={{ fontSize: '15px', fontWeight: '800', color: '#1e293b' }}>{new Date(selectedPresc.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                    </div>
                                </div>

                                <div style={{ marginBottom: '40px', position: 'relative', zIndex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                        <div style={{ padding: '8px', background: 'var(--primary-light)', borderRadius: '8px', color: 'var(--primary)' }}><ClipboardList size={18} /></div>
                                        <h3 style={{ fontSize: '14px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>Clinical Diagnosis</h3>
                                    </div>
                                    <div style={{ fontSize: '18px', lineHeight: '1.6', color: '#334155', fontWeight: '600', paddingLeft: '44px' }}>{selectedPresc.diagnosis}</div>
                                </div>

                                <div style={{ marginBottom: '60px', position: 'relative', zIndex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                                        <div style={{ padding: '8px', background: 'var(--primary-light)', borderRadius: '8px', color: 'var(--primary)' }}><FileText size={18} /></div>
                                        <h3 style={{ fontSize: '14px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>Suggested Medication</h3>
                                    </div>
                                    
                                    <div style={{ paddingLeft: '44px' }}>
                                        <div style={{ display: 'grid', gap: '16px' }}>
                                            {selectedPresc.medicines.map((med, idx) => (
                                                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1.5px dashed #E2E8F0', paddingBottom: '12px' }}>
                                                    <div>
                                                        <div style={{ fontWeight: '800', fontSize: '18px', color: 'var(--secondary)' }}>{med.name}</div>
                                                        <div style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: '700' }}>Instructions: {med.dosage}</div>
                                                    </div>
                                                    <div style={{ textAlign: 'right' }}>
                                                        <div style={{ fontSize: '14px', fontWeight: '800', color: '#64748b' }}>{med.duration}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <footer style={{ marginTop: '100px', paddingTop: '40px', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', position: 'relative', zIndex: 1 }}>
                                    <div>
                                        <div style={{ fontSize: '20px', fontWeight: '900', color: 'var(--secondary)', marginBottom: '2px' }}>{selectedPresc.doctor_name}</div>
                                        <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--primary)', marginBottom: '4px' }}>{selectedPresc.doctor_specialty}</div>
                                        {selectedPresc.doctor_reg_number && (
                                            <div style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8' }}>Reg No: {selectedPresc.doctor_reg_number}</div>
                                        )}

                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ width: '200px', borderBottom: '2px solid #E2E8F0', marginBottom: '8px' }}></div>
                                        <div style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>Doctor's Signature</div>
                                    </div>
                                </footer>

                                <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F1F5F9', paddingTop: '20px' }}>
                                    <div className="no-print" style={{ display: 'flex', gap: '16px' }}>
                                        <button onClick={handlePrint} style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '12px', fontSize: '14px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 8px 16px rgba(0,71,171,0.2)' }}>
                                            <Printer size={18} /> Print Record
                                        </button>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase' }}>
                                        <CheckCircle size={14} /> Official Medical Document
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>



            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    .prescription-portal { padding: 0 !important; }
                    .prescription-paper { box-shadow: none !important; border: none !important; width: 100% !important; max-width: none !important; margin: 0 !important; border-radius: 0 !important; }
                }
            `}</style>
        </div>
    );
}
