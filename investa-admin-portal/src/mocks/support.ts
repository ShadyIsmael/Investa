
import { SupportRequest } from '../types';

const now = new Date();
const hoursFromNow = (h: number) => new Date(now.getTime() + h * 60 * 60 * 1000).toISOString();
const hoursAgo = (h: number) => new Date(now.getTime() - h * 60 * 60 * 1000).toISOString();

export const MOCK_SUPPORT_REQUESTS: SupportRequest[] = [
  { 
    id: 'TKT-7721', 
    clientName: 'Global Tech Solutions', 
    subject: 'Inquiry about API rate limits', 
    priority: 'High', 
    status: 'Open', 
    createdAt: hoursAgo(1), 
    slaDueAt: hoursFromNow(0.5) 
  },
  { 
    id: 'TKT-8842', 
    clientName: 'Quantum Logistics', 
    subject: 'Billing discrepancy for Q1', 
    priority: 'Medium', 
    status: 'In Progress', 
    createdAt: hoursAgo(4), 
    slaDueAt: hoursFromNow(8), 
    assignedTo: 'Sarah L.' 
  },
  { 
    id: 'TKT-9910', 
    clientName: 'Apex Marketing Group', 
    subject: 'Requesting access to beta features', 
    priority: 'Low', 
    status: 'Open', 
    createdAt: hoursAgo(2), 
    slaDueAt: hoursFromNow(22) 
  },
  { 
    id: 'TKT-1234', 
    clientName: 'Starlight Venture', 
    subject: 'Integration failure in production', 
    priority: 'High', 
    status: 'Open', 
    createdAt: hoursAgo(5), 
    slaDueAt: hoursAgo(1) 
  },
];

export const MOCK_SUPPORT_SESSIONS = [
  { id: 'C-1001', client: 'Global Tech Solutions', score: 87, lastMessage: 'Is the API rate limit per account?', unread: 2, startedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), updatedAt: new Date().toISOString() },
  { id: 'C-1002', client: 'Quantum Logistics', score: 72, lastMessage: 'We still see a discrepancy in billing', unread: 0, startedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(), updatedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString() },
  { id: 'C-1003', client: 'Apex Marketing', score: 64, lastMessage: 'Need help integrating the SDK', unread: 1, startedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(), updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
];

export const MOCK_SUPPORT_CONVERSATIONS: Record<string, { id: string; author: 'client' | 'admin'; message: string; createdAt: string }[]> = {
  'C-1001': [
    { id: 'm1', author: 'client', message: 'Is the API rate limit per account?', createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString() },
    { id: 'm2', author: 'admin', message: 'It is per account. Can you share your account id?', createdAt: new Date(Date.now() - 1000 * 60 * 50).toISOString() }
  ],
  'C-1002': [
    { id: 'm1', author: 'client', message: 'We still see a discrepancy in billing', createdAt: new Date(Date.now() - 1000 * 60 * 140).toISOString() }
  ],
  'C-1003': [
    { id: 'm1', author: 'client', message: 'Need help integrating the SDK', createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString() }
  ]
};
