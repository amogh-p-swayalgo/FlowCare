import { client } from './client';

export const createClinic = async (clinicData) => {
    const response = await client.post('/clinic/', clinicData);
    return response;
};