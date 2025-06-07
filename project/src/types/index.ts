export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'employee';
  created_at: string;
}

export interface LeaveRequest {
  id: number;
  user_id: number;
  user?: User;
  leave_type: 'sick' | 'vacation' | 'personal' | 'emergency';
  start_date: string;
  end_date: string;
  days_requested: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_comment?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role?: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

export interface LeaveStats {
  total_requests: number;
  pending_requests: number;
  approved_requests: number;
  rejected_requests: number;
  total_users: number;
}