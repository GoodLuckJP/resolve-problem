export interface Task {
  id: number;
  title: string;
  description: string;
  bcrypt_id: string;
  visibility: boolean;
  is_completed: boolean;
}

export interface TaskDetail {
  id: number;
  title: string;
  description: string;
  visibility: boolean;
  is_completed: boolean;
  bcrypt_id: string;
}

export interface TaskSearch {
  id: number;
  title: string;
  description: string | null;
  comment: string | null;
}
