export interface Task {
  id: string;
  title: string;
  description?: string | null;
  completed: boolean;
  dueDate?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  listId?: string | null;
  tags?: {
    id: string;
    name: string;
  }[];
} 