import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, User, Phone, ArrowRight, History, Search, ClipboardList } from 'lucide-react';
import { getClinicInfo } from '../api/clinic';
import { joinQueue } from '../api/queue';
import { getPatientHistory, getPatientProfile } from '../api/prescriptions';

import { toast } from 'react-hot-toast';

export default function ClinicLanding() {
    const { clinic_id } = useParams();
    const navigate = useNavigate();
    const [clinic, setClinic] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // View State: 'hero', 'join', or 'records'
    const [view, setView] = useState('hero');


    // Form States
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('M');
    const [joining, setJoining] = useState(false);


    const [isRecognized, setIsRecognized] = useState(false);
    const [checkingProfile, setCheckingProfile] = useState(false);



    useEffect(() => {
        getClinicInfo(clinic_id)
            .then(setClinic)
            .catch(() => setClinic(null))
            .finally(() => setLoading(false));
    }, [clinic_id]);

    // Lookup Effect
    useEffect(() => {
        if (phone.length >= 10) {
            setCheckingProfile(true);
            getPatientProfile(phone, clinic_id)
                .then(profile => {
                    setName(profile.name);
                    setAge(profile.age);
                    setGender(profile.gender);
                    setIsRecognized(true);
                    toast.success(`Welcome back, ${profile.name}!`);
                })


                .catch(() => {
                    setIsRecognized(false);
                })
                .finally(() => setCheckingProfile(false));
        } else if (phone.length === 0) {
            setIsRecognized(false);
            setName('');
            setAge('');
            setGender('M');
        }


    }, [phone, clinic_id]);


    const handleJoinQueue = async (e) => {
        e.preventDefault();
        setJoining(true);
        try {
            await joinQueue({ 
                clinic_id, 
                name, 
                phone, 
                age: age ? parseInt(age) : null, 
                gender 
            });
            toast.success(`Welcome ${name}!`);



            navigate(`/clinic/${clinic_id}/portal/${phone}`);
        } catch (err) {
            toast.error("Failed to join queue. Refresh and try again.");
        } finally {
            setJoining(false);
        }
    };

    const handleSearchHistory = async (e) => {
        e.preventDefault();
        setJoining(true); // Reuse joining state for loader
        try {
            await getPatientProfile(phone, clinic_id);
            navigate(`/clinic/${clinic_id}/portal/${phone}`);
        } catch (err) {
            toast.error("No record found. Please register as a new patient first.");
        } finally {
            setJoining(false);
        }
    };


    if (loading) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="loader" style={{ borderTopColor: 'var(--primary)' }} /></div>;

    if (!clinic) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}><div><h2 style={{ color: 'var(--error)', marginBottom: '1rem' }}>Clinic Not Found</h2><p>We couldn't find a clinic matching this URL.</p></div></div>;

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', padding: '20px' }}>
            <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card" 
                style={{ width: '100%', maxWidth: '500px', padding: '0', overflow: 'hidden' }}
            >
                {/* Clinic Header Section */}
                <div style={{ padding: '48px 48px 32px', textAlign: 'center', background: 'linear-gradient(180deg, rgba(0,71,171,0.03) 0%, transparent 100%)' }}>
                    <div style={{ background: 'var(--primary)', width: '64px', height: '64px', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 8px 24px rgba(0,71,171,0.2)' }}>
                        <Building2 size={32} color="white" />
                    </div>
                    <h1 style={{ fontSize: '32px', fontWeight: '900', letterSpacing: '-1px', marginBottom: '8px', fontFamily: 'Outfit' }}>{clinic.name}</h1>

                    <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>Smart Care Management System</p>
                </div>

                <AnimatePresence mode="wait">
                    {view === 'hero' ? (
                        <motion.div 
                            key="hero"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            style={{ padding: '60px 48px', textAlign: 'center' }}
                        >
                            <div style={{ display: 'grid', gap: '16px' }}>
                                <button 
                                    onClick={() => setView('join')}
                                    className="primary" 
                                    style={{ width: '100%', height: '64px', fontSize: '18px', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}
                                >
                                    <ClipboardList size={22} /> Join The Queue Now
                                </button>
                                <button 
                                    onClick={() => setView('records')}
                                    style={{ 
                                        width: '100%', height: '64px', fontSize: '18px', borderRadius: '18px', background: 'white', color: 'var(--primary)', border: '2.5px solid var(--primary-light)', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' 
                                    }}
                                >
                                    <History size={22} /> Visit History
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="form-view"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            {/* Unified Tab Selector */}
                            <div style={{ display: 'flex', padding: '0 40px', marginBottom: '32px' }}>
                                <button 
                                    onClick={() => setView('join')}
                                    style={{ 
                                        flex: 1, padding: '14px', fontSize: '14px', fontWeight: '800', borderBottom: '2px solid',
                                        borderColor: view === 'join' ? 'var(--primary)' : 'transparent',
                                        color: view === 'join' ? 'var(--primary)' : 'var(--text-muted)',
                                        background: 'none', transition: 'all 0.3s'
                                    }}
                                >
                                    NEW VISIT
                                </button>
                                <button 
                                    onClick={() => setView('records')}
                                    style={{ 
                                        flex: 1, padding: '14px', fontSize: '14px', fontWeight: '800', borderBottom: '2px solid',
                                        borderColor: view === 'records' ? 'var(--primary)' : 'transparent',
                                        color: view === 'records' ? 'var(--primary)' : 'var(--text-muted)',
                                        background: 'none', transition: 'all 0.3s'
                                    }}
                                >
                                    MY RECORDS
                                </button>
                            </div>


                            {/* Dynamic Content Area */}
                            <div style={{ padding: '0 48px 48px' }}>
                                {view === 'join' ? (
                                    <motion.form 
                                        key="join-tab"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 10 }}
                                        onSubmit={handleJoinQueue}
                                    >
                                        <div style={{ display: 'grid', gap: '20px', marginBottom: '32px' }}>
                                            <div>
                                                <label style={{ fontSize: '12px', fontWeight: '800', marginBottom: '8px', display: 'block', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Full Name</label>
                                                <div style={{ position: 'relative' }}>
                                                    <User size={18} style={{ position: 'absolute', left: '16px', top: '14px', color: '#94a3b8' }} />
                                                    <input placeholder="Enter your name" value={name} onChange={e => setName(e.target.value)} style={{ paddingLeft: '48px', opacity: isRecognized ? 0.7 : 1 }} required disabled={isRecognized} />
                                                </div>
                                            </div>
                                            <div>
                                                <label style={{ fontSize: '12px', fontWeight: '800', marginBottom: '8px', display: 'block', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Phone Number</label>
                                                <div style={{ position: 'relative' }}>
                                                    <Phone size={18} style={{ position: 'absolute', left: '16px', top: '14px', color: '#94a3b8' }} />
                                                    <input placeholder="For notifications & history" value={phone} onChange={e => setPhone(e.target.value)} style={{ paddingLeft: '48px' }} required />
                                                </div>
                                            </div>
                                            {!isRecognized && (
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                                    <div>
                                                        <label style={{ fontSize: '12px', fontWeight: '800', marginBottom: '8px', display: 'block', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Age</label>
                                                        <input type="number" placeholder="Years" value={age} onChange={e => setAge(e.target.value)} style={{ padding: '12px', borderRadius: '12px', border: '1.5px solid #e2e8f0', width: '100%' }} required />
                                                    </div>
                                                    <div>
                                                        <label style={{ fontSize: '12px', fontWeight: '800', marginBottom: '8px', display: 'block', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Gender</label>
                                                        <select value={gender} onChange={e => setGender(e.target.value)} style={{ width: '100%', height: '48px', padding: '0 16px', borderRadius: '12px', border: '1.5px solid #e2e8f0', background: 'white', fontWeight: '700' }}>
                                                            <option value="M">Male</option>
                                                            <option value="F">Female</option>
                                                            <option value="O">Other</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            )}
                                            
                                            {isRecognized && (

                                                <div style={{ padding: '12px', background: '#ecfdf5', borderRadius: '10px', color: '#10b981', fontSize: '12px', fontWeight: '700', border: '1px solid #d1fae5', textAlign: 'center' }}>
                                                    Welcome back! Your profile is recognized.
                                                </div>
                                            )}
                                        </div>

                                        <button type="submit" className="primary" style={{ width: '100%', height: '56px', fontSize: '17px' }} disabled={joining}>
                                            {joining ? <div className="loader" /> : <>Join the Waiting List <ArrowRight size={18} /></>}
                                        </button>
                                    </motion.form>
                                ) : (
                                    <motion.form 
                                        key="records-tab"
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        onSubmit={handleSearchHistory}
                                    >
                                        <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '16px', marginBottom: '32px', border: '1px solid #e2e8f0' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', color: 'var(--primary)' }}>
                                                <History size={20} />
                                                <span style={{ fontWeight: '800', fontSize: '14px' }}>Quick Lookup</span>
                                            </div>
                                            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5' }}>Returning patient? Enter your phone number used during previous visits to access your profile.</p>
                                        </div>

                                        <div style={{ marginBottom: '32px' }}>
                                            <label style={{ fontSize: '12px', fontWeight: '800', marginBottom: '8px', display: 'block', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Phone Number</label>
                                            <div style={{ position: 'relative' }}>
                                                <Phone size={18} style={{ position: 'absolute', left: '16px', top: '14px', color: '#94a3b8' }} />
                                                <input placeholder="Enter phone" value={phone} onChange={e => setPhone(e.target.value)} style={{ paddingLeft: '48px' }} required />
                                            </div>
                                        </div>
                                        <button type="submit" className="primary" style={{ width: '100%', height: '56px', fontSize: '17px', background: 'var(--secondary)' }} disabled={joining}>
                                            {joining ? <div className="loader" /> : <>Access My Records <Search size={18} /></>}
                                        </button>
                                    </motion.form>
                                )}
                                <div style={{ marginTop: '32px', textAlign: 'center', color: '#94a3b8', fontSize: '12px', fontWeight: '600' }}>
                                    SECURE CLINIC PORTAL • BY FLOWCARE
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}

