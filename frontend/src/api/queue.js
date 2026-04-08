import { client } from './client';

export const joinQueue = async (clinicId, userId) => {
    const response = await client.post(`/queue/join?user_id=${userId}`, {
        clinic_id: clinicId
    });
    return response;
};

export const getQueueStatus = async (clinicId, userId) => {
    const response = await client.get(`/queue/${clinicId}/status?user_id=${userId}`);
    return response;
};

export const listQueue = async (clinicId) => {
    const response = await client.get(`/queue/${clinicId}/list`);
    return response;
};

export const callNext = async (clinicId) => {
    const response = await client.post(`/queue/${clinicId}/next`);
    return response;
};
