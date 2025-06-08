import axios from 'axios';
import { User, LeaveRequest, LeaveStats } from '../types';

const API_BASE_URL = 'http://localhost:8000/api';


const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});


api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


const mockUsers: User[] = [
  {
    id: 1,
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    name: 'John Doe',
    email: 'employee1@example.com',
    role: 'employee',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 3,
    name: 'Jane Smith',
    email: 'employee2@example.com',
    role: 'employee',
    created_at: '2024-01-02T00:00:00Z',
  },
];

const mockLeaveRequests: LeaveRequest[] = [
  {
    id: 1,
    user_id: 2,
    user: mockUsers[1],
    leave_type: 'vacation',
    start_date: '2024-01-15',
    end_date: '2024-01-19',
    days_requested: 5,
    reason: 'Family vacation to Hawaii',
    status: 'pending',
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-01-01T10:00:00Z',
  },
  {
    id: 2,
    user_id: 3,
    user: mockUsers[2],
    leave_type: 'sick',
    start_date: '2024-01-10',
    end_date: '2024-01-12',
    days_requested: 3,
    reason: 'Flu symptoms',
    status: 'approved',
    admin_comment: 'Approved. Get well soon!',
    created_at: '2024-01-08T09:00:00Z',
    updated_at: '2024-01-09T14:00:00Z',
  },
  {
    id: 3,
    user_id: 2,
    user: mockUsers[1],
    leave_type: 'personal',
    start_date: '2024-01-05',
    end_date: '2024-01-05',
    days_requested: 1,
    reason: 'Personal appointment',
    status: 'rejected',
    admin_comment: 'Not enough notice provided',
    created_at: '2024-01-04T16:00:00Z',
    updated_at: '2024-01-05T10:00:00Z',
  },
];


export const authAPI = {
  login: async (email: string, password: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const user = mockUsers.find(u => u.email === email);
    if (!user || password !== 'password') {
      throw new Error('Invalid credentials');
    }

    return {
      user,
      token: 'mock_jwt_token_' + Date.now(),
    };
  },

  register: async (name: string, email: string, password: string, role: string = 'employee') => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (mockUsers.find(u => u.email === email)) {
      throw new Error('Email already exists');
    }

    const newUser: User = {
      id: mockUsers.length + 1,
      name,
      email,
      role: role as 'admin' | 'employee',
      created_at: new Date().toISOString(),
    };

    mockUsers.push(newUser);

    return {
      user: newUser,
      token: 'mock_jwt_token_' + Date.now(),
    };
  },

  getUser: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockUsers[1];
  },
};

export const leaveAPI = {
  getLeaves: async (userId?: number) => {
    await new Promise(resolve => setTimeout(resolve, 800));

    if (userId) {
      return mockLeaveRequests.filter(leave => leave.user_id === userId);
    }

    return mockLeaveRequests;
  },

  createLeave: async (leaveData: Omit<LeaveRequest, 'id' | 'user' | 'status' | 'created_at' | 'updated_at'>) => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newLeave: LeaveRequest = {
      ...leaveData,
      id: mockLeaveRequests.length + 1,
      user: mockUsers.find(u => u.id === leaveData.user_id),
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    mockLeaveRequests.push(newLeave);
    return newLeave;
  },

  updateLeave: async (id: number, status: 'approved' | 'rejected', admin_comment?: string) => {
    await new Promise(resolve => setTimeout(resolve, 800));

    const leaveIndex = mockLeaveRequests.findIndex(leave => leave.id === id);
    if (leaveIndex === -1) {
      throw new Error('Leave request not found');
    }

    mockLeaveRequests[leaveIndex] = {
      ...mockLeaveRequests[leaveIndex],
      status,
      admin_comment,
      updated_at: new Date().toISOString(),
    };

    return mockLeaveRequests[leaveIndex];
  },

  getStats: async (): Promise<LeaveStats> => {
    await new Promise(resolve => setTimeout(resolve, 600));

    return {
      total_requests: mockLeaveRequests.length,
      pending_requests: mockLeaveRequests.filter(l => l.status === 'pending').length,
      approved_requests: mockLeaveRequests.filter(l => l.status === 'approved').length,
      rejected_requests: mockLeaveRequests.filter(l => l.status === 'rejected').length,
      total_users: mockUsers.filter(u => u.role === 'employee').length,
    };
  },
};

export const userAPI = {
  getUsers: async () => {
    await new Promise(resolve => setTimeout(resolve, 600));
    return mockUsers.filter(u => u.role === 'employee');
  },
};

export default api;