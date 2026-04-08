import { client } from './client';

export const createPrescription = async (data) => {
    return await client.post(`/prescriptions/${data.clinic_id}/create`, data);
};

export const getPatientHistory = async (userId, clinicId) => {
    return await client.get(`/prescriptions/${userId}/history`, {
        params: { clinic_id: clinicId }
    });
};

export const getHistoryByEntry = async (entryId) => {
    return await client.get(`/prescriptions/by-entry/${entryId}`);
};

export const getPrescriptionById = async (id) => {
    return await client.get(`/prescriptions/single/${id}`);
};

export const searchMedicines = async (q) => {
    return await client.get(`/prescriptions/search/medicines`, { params: { q } });
};

export const getTemplates = async (clinicId) => {
    return await client.get(`/prescriptions/templates`, { params: { clinic_id: clinicId } });
};
export const getPatientProfile = async (phone, clinicId) => {
    return await client.get(`/prescriptions/patient-profile/${phone}`, {
        params: { clinic_id: clinicId }
    });
};
