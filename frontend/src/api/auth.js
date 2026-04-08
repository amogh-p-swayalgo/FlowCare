import { client } from './client';

export const requestOTP = async (phoneNumber) => {
    return await client.post('/users/auth/request-otp', { phone_number: phoneNumber });
};

export const verifyOTP = async (phoneNumber, otpCode) => {
    const data = await client.post('/users/auth/verify-otp', { 
        phone_number: phoneNumber, 
        otp_code: otpCode 
    });
    
    // Store token and user info
    if (data.access_token) {
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
    }
    
    return data;
};

export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};
