import axios from 'axios';

const API_URL = 'http://localhost:8000';

// Fetch intervals
export const fetchIntervals = async () => {
    return await axios.get(`${API_URL}/config/intervals`);
};

// Update intervals
export const updateIntervals = async (intervals) => {
    return await axios.post(`${API_URL}/config/intervals`, intervals);
};

// Fetch sent messages
export const fetchSentMessages = async () => {
    return await axios.get(`${API_URL}/api/sent-messages`);
};

// Fetch orders
export const fetchOrders = async () => {
    return await axios.get(`${API_URL}/api/orders`);
};