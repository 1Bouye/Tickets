import api from '../api';

export interface User {
  userId: string;
  name?: string;
  userType?: 'student' | 'professor' | 'universityEmployee' | 'staff';
  role: 'user' | 'staff' | 'admin';
  isActive: boolean;
  createdAt: string;
  createdBy?: string;
  lastLogin?: string;
}

export interface CreateUserData {
  userId: string;
  name: string;
  userType: 'student' | 'professor' | 'universityEmployee' | 'staff';
}

export interface CreateAdminData {
  userId: string;
  name: string;
  password?: string; // Optional - will auto-generate if not provided
}

export interface CreateAdminResponse {
  success: boolean;
  data: {
    userId: string;
    name: string;
    role: string;
    generatedPassword?: string; // Only present if password was auto-generated
  };
  message?: string;
}

export interface CreateUserResponse {
  success: boolean;
  data: {
    userId: string;
    name: string;
    userType: string;
    role: string;
    generatedPassword: string;
  };
  message?: string;
}

export interface UsersResponse {
  success: boolean;
  data: {
    users: User[];
    total: number;
    page: number;
    limit: number;
  };
}

export const usersService = {
  createUser: async (userData: CreateUserData): Promise<CreateUserResponse> => {
    const response = await api.post<CreateUserResponse>('/admin/users/create', userData);
    return response.data;
  },

  createAdmin: async (adminData: CreateAdminData): Promise<CreateAdminResponse> => {
    const response = await api.post<CreateAdminResponse>('/admin/admins/create', adminData);
    return response.data;
  },

  getUsers: async (params?: {
    role?: string;
    userType?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }): Promise<UsersResponse> => {
    const response = await api.get<UsersResponse>('/admin/users', { params });
    return response.data;
  },

  updateUser: async (userId: string, data: { isActive?: boolean; password?: string; name?: string }) => {
    const response = await api.put(`/admin/users/${userId}`, data);
    return response.data;
  },
};

