export interface Task {
  id: string;
  title: string;
  description?: string | null;
  severity: "low" | "normal" | "critical";
  completed: boolean;
  dueDate?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  listId?: string | null;
  parentId?: string | null;
  parent?: Task | null;
  subtasks?: Task[];
  tags?: {
    id: string;
    name: string;
  }[];
} 