import React, { useState } from 'react';
import { signupClinic, loginDoctor } from '../api/clinic';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, Phone, Lock, ArrowRight, User } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function SignupPage() {
    const [phone, setPhone] = useState('');
    const [clinicName, setClinicName] = useState('');
    const [password, setPassword] = useState('');
    const [doctorName, setDoctorName] = useState('');
    const [loading, setLoading] = useState(false);
    const [isLogin, setIsLogin] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isLogin) {
                const response = await loginDoctor(phone, password);
                toast.success("Welcome back, Doctor!");
                navigate(`/clinic/${response.clinic_id}/doctor`);
            } else {
                const data = await signupClinic({ 
                    phone, 
                    clinic_name: clinicName,
                    doctor_name: doctorName,
                    password 
                });
                await loginDoctor(phone, password);
                toast.success("Clinic Registered Successfully!");
                navigate(`/clinic/${data.clinic_id}/doctor`);
            }
        } catch (err) {
            console.error(err);
            const errorMsg = err.response?.data?.detail || (isLogin ? "Login failed" : "Signup failed");
            toast.error(typeof errorMsg === 'string' ? errorMsg : "Access denied. Please check credentials.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f4f7fa', padding: '20px' }}>
            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card" 
                style={{ width: '100%', maxWidth: '440px', padding: '48px', position: 'relative', overflow: 'hidden' }}
            >
                {/* Decorative medical icon background */}
                <div style={{ position: 'absolute', top: '-30px', right: '-30px', opacity: 0.03 }}>
                    <Building2 size={200} />
                </div>

                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <div style={{ background: 'var(--primary)', width: '56px', height: '56px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 8px 16px rgba(0,71,171,0.2)' }}>
                        <Building2 size={28} color="white" />
                    </div>
                    <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '10px', fontFamily: 'Outfit' }}>
                        {isLogin ? "Medical Portal" : "Join FlowCare"}
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: '1.5' }}>
                        {isLogin ? "Sign in to manage your clinic queue" : "The smarter way to manage your clinic waitlist"}
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gap: '18px', marginBottom: '32px' }}>
                        {!isLogin && (
                            <>
                                <div style={{ position: 'relative' }}>
                                    <Building2 size={18} style={{ position: 'absolute', left: '16px', top: '14px', color: '#94a3b8' }} />
                                    <input placeholder="Clinic Name" value={clinicName} onChange={e => setClinicName(e.target.value)} style={{ paddingLeft: '48px' }} required />
                                </div>
                                <div style={{ position: 'relative' }}>
                                    <User size={18} style={{ position: 'absolute', left: '16px', top: '14px', color: '#94a3b8' }} />
                                    <input placeholder="Doctor Full Name" value={doctorName} onChange={e => setDoctorName(e.target.value)} style={{ paddingLeft: '48px' }} required />
                                </div>
                            </>
                        )}
                        <div style={{ position: 'relative' }}>
                            <Phone size={18} style={{ position: 'absolute', left: '16px', top: '14px', color: '#94a3b8' }} />
                            <input placeholder="Phone Number" value={phone} onChange={e => setPhone(e.target.value)} style={{ paddingLeft: '48px' }} required />
                        </div>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '16px', top: '14px', color: '#94a3b8' }} />
                            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} style={{ paddingLeft: '48px' }} required />
                        </div>
                    </div>

                    <button type="submit" className="primary" style={{ width: '100%', height: '52px', fontSize: '16px' }} disabled={loading}>
                        {loading ? <div className="loader" /> : (
                            <> {isLogin ? "Sign In" : "Register Clinic"} <ArrowRight size={18} /> </>
                        )}
                    </button>
                </form>

                <div style={{ marginTop: '30px', textAlign: 'center' }}>
                    <button 
                        onClick={() => setIsLogin(!isLogin)}
                        style={{ background: 'none', color: 'var(--primary)', fontSize: '14px', fontWeight: '700', padding: '0', margin: '0 auto' }}
                    >
                        {isLogin ? "Don't have a clinic? Sign up here" : "Already a member? Login here"}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
