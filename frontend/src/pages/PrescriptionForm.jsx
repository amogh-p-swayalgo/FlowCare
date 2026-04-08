import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Trash2, Send, Clock, History, FileText, Search, Zap, Check, Sun, Sunrise, Sunset, Moon } from 'lucide-react';
import { createPrescription, getPatientHistory, searchMedicines, getTemplates } from '../api/prescriptions';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function PrescriptionForm({ patient, clinicId, onClose, onSuccess }) {
    const [diagnosis, setDiagnosis] = useState('');
    const [medicines, setMedicines] = useState([{ name: '', dosage: '', duration: '', schedule: { m: false, l: false, d: false } }]);
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(true);
    
    // Rapid Entry States
    const [templates, setTemplates] = useState([]);
    const [searchResults, setSearchResults] = useState({}); 
    const [activeSearchIdx, setActiveSearchIdx] = useState(null);
    const [clinicInfo, setClinicInfo] = useState(null);

    useEffect(() => {
        getPatientHistory(patient.phone, clinicId)
            .then(data => setHistory(data.prescriptions))
            .finally(() => setLoadingHistory(false));
            
        getTemplates(clinicId)
            .then(setTemplates)
            .catch(console.error);

        // Fetch clinic info for letterhead
        fetch(`/api/clinic/${clinicId}/admin`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })

        .then(res => res.json())
        .then(setClinicInfo)
        .catch(err => console.error("Clinic fetch error:", err));
    }, [patient.phone, clinicId]);

    const addMedicine = () => setMedicines([...medicines, { name: '', dosage: '', duration: '', schedule: { m: false, l: false, d: false } }]);
    const removeMedicine = (idx) => setMedicines(medicines.filter((_, i) => i !== idx));

    const toggleSchedule = (idx, time) => {
        const newMeds = [...medicines];
        const sched = { ...newMeds[idx].schedule, [time]: !newMeds[idx].schedule[time] };
        newMeds[idx].schedule = sched;
        
        // Convert to 1-0-1 format
        const m = sched.m ? '1' : '0';
        const l = sched.l ? '1' : '0';
        const d = sched.d ? '1' : '0';
        newMeds[idx].dosage = `${m}-${l}-${d}`;
        
        setMedicines(newMeds);
    };

    const updateMedicine = (idx, field, value) => {
        const newMeds = [...medicines];
        newMeds[idx][field] = value;
        
        // If they manually type dosage, clear schedule toggles to avoid confusion
        if (field === 'dosage') {
            newMeds[idx].schedule = { m: false, l: false, d: false };
        }
        
        setMedicines(newMeds);

        if (field === 'name' && value.length >= 1) {
            handleSearch(idx, value);
        } else if (field === 'name') {
            setSearchResults(prev => ({ ...prev, [idx]: [] }));
            setActiveSearchIdx(null);
        }
    };

    const handleSearch = async (idx, q) => {
        try {
            const results = await searchMedicines(q);
            setSearchResults(prev => ({ ...prev, [idx]: results }));
            setActiveSearchIdx(idx);
        } catch (err) {
            console.error(err);
        }
    };

    const selectMedicine = (idx, med) => {
        const newMeds = [...medicines];
        newMeds[idx] = { 
            name: med.name, 
            dosage: med.default_dosage || '1-0-1', 
            duration: med.default_duration || '5 days',
            schedule: { m: true, l: false, d: true } // Default to 1-0-1 for common meds
        };
        setMedicines(newMeds);
        setSearchResults(prev => ({ ...prev, [idx]: [] }));
        setActiveSearchIdx(null);
    };

    const applyTemplate = (tpl) => {
        setDiagnosis(tpl.diagnosis);
        try {
            const meds = JSON.parse(tpl.medicines_json);
            // Reconstruct schedule from dosage string if possible
            const formattedMeds = meds.map(m => {
                const parts = m.dosage.split('-');
                return {
                    ...m,
                    schedule: parts.length === 3 ? {
                        m: parts[0] === '1',
                        l: parts[1] === '1',
                        d: parts[2] === '1'
                    } : { m: false, l: false, d: false }
                };
            });
            setMedicines(formattedMeds);
            toast.success(`Template applied: ${tpl.name}`);
        } catch (err) {
            toast.error("Error applying template.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const result = await createPrescription({
                clinic_id: clinicId,
                queue_entry_id: patient.id,
                user_id: patient.phone,
                patient_name: patient.name,
                patient_age: patient.age,
                patient_gender: patient.gender,
                diagnosis,
                medicines: medicines.map(({schedule, ...rest}) => rest)
            });
            toast.success("Prescription Finalized!");
            onSuccess();
        } catch (err) {
            toast.error("Error saving prescription.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card" style={{ width: '100%', maxWidth: '1200px', height: '95vh', overflow: 'hidden', display: 'flex', background: 'white' }}>
                
                {/* Left Side: Medical History Portal */}
                <div style={{ width: '300px', borderRight: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <History size={18} color="var(--primary)" />
                        <h3 style={{ fontSize: '13px', fontWeight: '800', fontFamily: 'Outfit', letterSpacing: '0.5px' }}>PREVIOUS VISITS</h3>
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
                        {loadingHistory ? (
                            <div className="loader" style={{ margin: '20px auto', borderTopColor: 'var(--primary)' }} />
                        ) : history.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
                                <FileText size={32} style={{ opacity: 0.2, margin: '0 auto 12px' }} />
                                <p style={{ fontSize: '12px' }}>New Patient Profile</p>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gap: '12px' }}>
                                {history.map((record) => (
                                    <div key={record.id} style={{ padding: '16px', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                        <div style={{ fontSize: '10px', fontWeight: '800', color: 'var(--primary)', marginBottom: '4px' }}>{new Date(record.created_at).toLocaleDateString()}</div>
                                        <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--secondary)' }}>{record.diagnosis}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Side: Consultation Interface */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', background: 'white' }}>
                    {/* 🏥 PROFESSIONAL LETTERHEAD HEADER */}
                    <div style={{ padding: '32px 48px', borderBottom: '1px solid #f1f5f9', background: '#fff', position: 'relative' }}>
                        <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
                            <button onClick={onClose} style={{ padding: '8px', background: '#f1f5f9', borderRadius: '12px', border: 'none' }}><X size={18} /></button>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            {/* Clinic Header */}
                            <div>
                                <h2 style={{ fontSize: '24px', fontWeight: '900', color: 'var(--primary)', letterSpacing: '-0.8px', marginBottom: '4px' }}>
                                    {clinicInfo?.name || ''}
                                </h2>
                                <p style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    {clinicInfo?.address || ''}<br/>
                                    {clinicInfo?.phone || ''}
                                </p>

                            </div>

                            {/* Doctor Identity */}
                            <div style={{ textAlign: 'right' }}>
                                <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#0F172A' }}>{clinicInfo?.owner_name || ''}</h3>
                                <p style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: '700' }}>{clinicInfo?.specialty || ''}</p>

                                {clinicInfo?.reg_number && (
                                    <p style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '600' }}>Reg No: {clinicInfo.reg_number}</p>
                                )}
                            </div>

                        </div>

                        {/* Patient & Date Bar */}
                        <div style={{ marginTop: '24px', padding: '12px 20px', background: '#f8fafc', borderRadius: '14px', border: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                                <div>
                                    <span style={{ fontSize: '10px', fontWeight: '800', color: '#94a3b8', display: 'block', textTransform: 'uppercase' }}>Patient</span>
                                    <span style={{ fontSize: '15px', fontWeight: '800', color: '#1e293b' }}>{patient.name}</span>
                                </div>
                                <div>
                                    <span style={{ fontSize: '10px', fontWeight: '800', color: '#94a3b8', display: 'block', textTransform: 'uppercase' }}>Age / Gender</span>
                                    <span style={{ fontSize: '15px', fontWeight: '800', color: '#1e293b' }}>{patient.age || '??'}y, {patient.gender || '---'}</span>
                                </div>
                                <div>
                                    <span style={{ fontSize: '10px', fontWeight: '800', color: '#94a3b8', display: 'block', textTransform: 'uppercase' }}>Patient ID</span>
                                    <span style={{ fontSize: '15px', fontWeight: '800', color: '#1e293b' }}>{patient.phone}</span>
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <span style={{ fontSize: '10px', fontWeight: '800', color: '#94a3b8', display: 'block', textTransform: 'uppercase' }}>Date</span>
                                <span style={{ fontSize: '15px', fontWeight: '800', color: '#1e293b' }}>{new Date().toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                            </div>
                        </div>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', padding: '24px 48px' }}>
                        {/* Template Quick Select */}
                        <div style={{ marginBottom: '24px' }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {templates.map(tpl => (
                                    <button 
                                        key={tpl.id} 
                                        type="button" 
                                        onClick={() => applyTemplate(tpl)}
                                        style={{ padding: '8px 16px', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: 'white', fontSize: '12px', fontWeight: '700' }}
                                        className="template-btn"
                                    >
                                        {tpl.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <form onSubmit={handleSubmit}>
                            {/* Diagnosis Section */}
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: '800', color: 'var(--secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Diagnosis</label>
                                <textarea rows="2" value={diagnosis} onChange={e => setDiagnosis(e.target.value)} style={{ width: '100%', fontSize: '16px', borderRadius: '12px', padding: '16px', background: '#f8fafc', border: '1.5px solid #e2e8f0' }} placeholder="Enter diagnosis or observations..." required />
                            </div>

                            {/* Medications Section */}
                            <div style={{ marginBottom: '32px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                    <label style={{ fontSize: '14px', fontWeight: '800', color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Medications</label>
                                    <button type="button" onClick={addMedicine} style={{ color: 'var(--primary)', fontWeight: '800', fontSize: '13px', background: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Plus size={16} strokeWidth={3} /> Add Medicine
                                    </button>
                                </div>

                                <div style={{ display: 'grid', gap: '16px' }}>
                                    {medicines.map((med, idx) => (
                                        <div key={idx} style={{ padding: '20px', background: 'white', borderRadius: '16px', border: '1.5px solid #e2e8f0' }}>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 2fr auto', gap: '12px', marginBottom: '16px' }}>
                                                <input placeholder="Medicine Name" value={med.name} onChange={e => updateMedicine(idx, 'name', e.target.value)} style={{ padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '15px' }} required />
                                                <input placeholder="Dosage" value={med.dosage} onChange={e => updateMedicine(idx, 'dosage', e.target.value)} style={{ padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '15px' }} required />
                                                
                                                {/* Smart Duration Console (Wheel replacement) */}
                                                <DurationConsole 
                                                    value={med.duration} 
                                                    onChange={(val) => updateMedicine(idx, 'duration', val)} 
                                                />

                                                <button type="button" onClick={() => removeMedicine(idx)} style={{ color: '#f87171', padding: '0 10px' }}><Trash2 size={20} /></button>
                                            </div>
                                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                                <TimingButton active={med.schedule.m} onClick={() => toggleSchedule(idx, 'm')} icon={<Sunrise size={14} />} label="Breakfast" />
                                                <TimingButton active={med.schedule.l} onClick={() => toggleSchedule(idx, 'l')} icon={<Sun size={14} />} label="Lunch" />
                                                <TimingButton active={med.schedule.d} onClick={() => toggleSchedule(idx, 'd')} icon={<Moon size={14} />} label="Dinner" />
                                                <button 
                                                    type="button" 
                                                    onClick={() => updateMedicine(idx, 'dosage', 'If Needed (SOS)')} 
                                                    style={{ padding: '6px 14px', fontSize: '11px', borderRadius: '8px', background: med.dosage.includes('SOS') ? 'var(--warning)' : 'white', color: med.dosage.includes('SOS') ? 'white' : '#94a3b8', border: '1px solid #e2e8f0', fontWeight: '800' }}
                                                >
                                                    If Needed (SOS)
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {/* Actions */}
                            <div style={{ display: 'flex', gap: '20px', marginTop: '40px' }}>
                                <button type="button" onClick={onClose} style={{ flex: 1, background: '#f1f5f9', color: '#64748b', fontWeight: '800', borderRadius: '14px', height: '52px' }}>Discard</button>
                                <button type="submit" className="primary" style={{ flex: 2, height: '52px', fontSize: '17px', fontWeight: '800', borderRadius: '14px' }} disabled={loading}>
                                    {loading ? <div className="loader" /> : <><Check size={20} /> Finalize Consultation</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </motion.div>
            
            <style>{`
                .template-btn:hover { border-color: var(--primary); color: var(--primary); transform: translateY(-2px); }
                .chip { padding: 4px 10px; font-size: 11px; border-radius: 6px; background: white; color: #94a3b8; border: 1px solid #e2e8f0; font-weight: 700; cursor: pointer; }
                .chip.active { background: var(--primary); color: white; border-color: var(--primary); }
            `}</style>
        </div>
    );
}

function TimingButton({ active, onClick, icon, label }) {
    return (
        <button 
            type="button" 
            onClick={onClick} 
            style={{ 
                padding: '8px 16px', borderRadius: '12px', border: '1.5px solid #e2e8f0', 
                background: active ? 'var(--primary)' : 'white', 
                color: active ? 'white' : '#64748b',
                display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s'
            }}
        >
            {icon}
            <span style={{ fontSize: '12px', fontWeight: '700' }}>{label}</span>
            {active && <Check size={14} strokeWidth={3} />}
        </button>
    );
}

function DurationConsole({ value, onChange }) {
    const parts = value.split(' ');
    const num = parseInt(parts[0]) || 0;
    const unit = parts[1] || 'days';

    const update = (newNum, newUnit) => {
        onChange(`${newNum} ${newUnit}`);
    };

    return (
        <div style={{ display: 'inline-flex', alignItems: 'center', background: '#e2e8f0', padding: '1px', borderRadius: '10px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', background: 'white', padding: '2px', gap: '2px' }}>
                <button type="button" onClick={() => update(Math.max(0, num - 1), unit)} style={{ width: '28px', height: '28px', padding: 0, background: '#f8fafc', borderRadius: '6px', color: '#64748b', fontSize: '16px' }}>-</button>
                <input 
                    type="number" 
                    value={num} 
                    onChange={(e) => update(parseInt(e.target.value) || 0, unit)}
                    style={{ width: '32px', border: 'none', textAlign: 'center', fontWeight: '800', fontSize: '14px', padding: 0, background: 'transparent' }} 
                />
                <button type="button" onClick={() => update(num + 1, unit)} style={{ width: '28px', height: '28px', padding: 0, background: '#f8fafc', borderRadius: '6px', color: '#64748b', fontSize: '16px' }}>+</button>
            </div>
            <div style={{ width: '1px', alignSelf: 'stretch', background: '#e2e8f0' }} />
            <div style={{ display: 'flex', background: 'white', padding: '2px', gap: '2px' }}>
                {['days', 'weeks', 'months'].map(u => (
                    <button 
                        key={u}
                        type="button"
                        onClick={() => update(num, u)}
                        style={{ 
                            padding: '4px 10px', fontSize: '11px', borderRadius: '6px', 
                            background: unit === u ? 'var(--secondary)' : 'transparent',
                            color: unit === u ? 'white' : '#94a3b8',
                            border: 'none', fontWeight: '800', whiteSpace: 'nowrap'
                        }}
                    >
                        {u.charAt(0).toUpperCase() + u.slice(1, -1)}s
                    </button>
                ))}
            </div>
        </div>
    );
}
