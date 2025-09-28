// src/types/index.ts - TypeScript interfaces
export interface Task {
  id: number;
  title: string;
  completed: boolean;
  userId: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  count?: number;
}

export interface TaskItemProps {
  task: Task;
  onToggle: (id: number, completed: boolean) => void;
  onDelete: (id: number) => void;
}

export interface LoadingSpinnerProps {
  message?: string;
}

export interface User {
  id: number;
  username: string;
  name: string;
  email: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  name: string;
  email?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: User;
}