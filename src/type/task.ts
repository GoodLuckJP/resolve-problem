export interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  visibility: boolean;
  is_completed: boolean;
}

export interface TaskDetail {
  id: number;
  title: string;
  description: string;
  visibility: boolean;
}

export interface TaskSearch {
  id: number;
  title: string;
  description: string | null;
  comment: string | null;
}
