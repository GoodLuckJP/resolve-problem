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
