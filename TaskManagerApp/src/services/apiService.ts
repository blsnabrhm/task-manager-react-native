// src/services/apiService.ts - API Service Layer
import { Task, ApiResponse, LoginRequest, RegisterRequest, AuthResponse } from '../types';

// API configuration
const API_BASE_URL = 'http://localhost:3001/api'; // Change to your backend URL
// For physical device, use your computer's IP: 'http://192.168.1.XXX:3001/api'

const handleResponse = async (response: Response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  return data;
};

// Authentication API calls
export const login = async (credentials: LoginRequest): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });
  return handleResponse(response);
};

export const register = async (userData: RegisterRequest): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });
  return handleResponse(response);
};

// Updated task API calls to include userId
export const getTasks = async (userId: number): Promise<ApiResponse<Task[]>> => {
  const response = await fetch(`${API_BASE_URL}/tasks?userId=${userId}`);
  return handleResponse(response);
};

export const createTask = async (title: string, userId: number): Promise<ApiResponse<Task>> => {
  const response = await fetch(`${API_BASE_URL}/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title, userId }),
  });
  return handleResponse(response);
};

export const updateTask = async (id: number, updates: Partial<Task>, userId: number): Promise<ApiResponse<Task>> => {
  const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ...updates, userId }),
  });
  return handleResponse(response);
};

export const deleteTask = async (id: number, userId: number): Promise<ApiResponse<Task>> => {
  const response = await fetch(`${API_BASE_URL}/tasks/${id}?userId=${userId}`, {
    method: 'DELETE',
  });
  return handleResponse(response);
};