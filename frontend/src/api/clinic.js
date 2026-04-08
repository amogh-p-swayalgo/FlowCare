import { client } from './client';

export const signupClinic = async (data) => {
    const response = await client.post('/clinic/signup', data);
    return response;
};

export const loginDoctor = async (phone, password) => {
    const params = new URLSearchParams();
    params.append('username', phone);
    params.append('password', password);
    const response = await client.post('/clinic/login', params, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    });
    if (response.access_token) {
        localStorage.setItem('token', response.access_token);
    }
    return response;
};

export const getClinicInfo = async (clinicId) => {
    const response = await client.get(`/clinic/${clinicId}`);
    return response;
};

export const getAdminClinicInfo = async (clinicId) => {
    const response = await client.get(`/clinic/${clinicId}/admin`);
    return response;
};

export const updateClinicInfo = async (clinicId, data) => {
    const response = await client.patch(`/clinic/${clinicId}`, data);
    return response;
};