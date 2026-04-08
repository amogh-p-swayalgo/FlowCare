import { client } from './client';

export const joinQueue = async (data) => {
    return await client.post('/queue/join', data);
};

export const getQueueStatus = async (entryId) => {
    return await client.get(`/queue/status/${entryId}`);
};

export const listClinicQueue = async (clinicId) => {
    return await client.get(`/queue/list/${clinicId}`);
};

export const callNextPatient = async (clinicId) => {
    return await client.post(`/queue/next/${clinicId}`);
};

export const getActivePatient = async (clinicId) => {
    return await client.get(`/queue/active/${clinicId}`);
};

export const addWalkin = async (clinicId, patientData) => {
    return await client.post(`/queue/walkin/${clinicId}`, patientData);
};

export const getActiveByPhone = async (clinicId, phone) => {
    return await client.get(`/queue/active-by-phone/${clinicId}/${phone}`);
};

export const leaveQueue = async (entryId) => {
    return await client.post(`/queue/leave/${entryId}`);
};
