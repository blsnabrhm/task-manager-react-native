// src/types/index.ts - TypeScript interfaces
export interface Task {
  id: number;
  title: string;
  completed: boolean;
  userId: number;
  createdAt?: string;
  updatedAt?: string;
  dueDate?: string; // ISO date string for task due date
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

// Workspace App Types
export interface WorkspaceApp {
  id: string;
  title: string;
  description: string;
  icon: string; // emoji or icon name
  color: string;
  route: string;
  isEnabled: boolean;
  category: 'productivity' | 'communication' | 'utility' | 'entertainment';
}

export interface AppTileProps {
  app: WorkspaceApp;
  onPress: (route: string) => void;
}

export interface DashboardSection {
  id: string;
  title: string;
  apps: WorkspaceApp[];
}

// Notes Types
export interface Note {
  id: number;
  title: string;
  body: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export interface NoteTileProps {
  note: Note;
  onPress: (note: Note) => void;
  onDelete: (id: number) => void;
}