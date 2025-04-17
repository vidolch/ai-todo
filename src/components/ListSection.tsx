import { Task } from "@/types/task";
import { TaskSection } from "./TaskSection";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

interface List {
  id: string;
  name: string;
  description?: string | null;
  color?: string | null;
  users?: {
    userId: string;
    role: string;
  }[];
  _count: {
    tasks: number;
  };
}

interface ListSectionProps {
  list: List;
  tasks: Task[];
  completedTasks: Task[];
  isCollapsed: boolean;
  quickAddValue: string;
  onToggleCollapse: (listId: string) => void;
  onQuickAddChange: (listId: string, value: string) => void;
  onQuickAdd: (listId: string) => void;
  onToggleComplete: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onAddSubtask: (parentId: string, title: string) => void;
}

export function ListSection({
  list,
  tasks,
  completedTasks,
  isCollapsed,
  quickAddValue,
  onToggleCollapse,
  onQuickAddChange,
  onQuickAdd,
  onToggleComplete,
  onDelete,
  onEdit,
  onAddSubtask,
}: ListSectionProps) {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isCompletedCollapsed, setIsCompletedCollapsed] = useState(true);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch('/api/user');
        if (response.ok) {
          const userData = await response.json();
          setCurrentUserId(userData.id);
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    };

    fetchCurrentUser();
  }, []);

  // Check if the current user is an owner or editor of the list
  const isCurrentUserList = currentUserId && list.users?.some(user => 
    user.userId === currentUserId && (user.role === 'OWNER' || user.role === 'EDITOR')
  );

  return (
    <div className="border-t border-white/10 pt-6">
      <div 
        className="flex items-center gap-2 cursor-pointer mb-4"
        onClick={() => onToggleCollapse(list.id)}
      >
        {isCollapsed ? (
          <ChevronRight className="h-5 w-5 text-gray-400" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-400" />
        )}
        <h3 
          className="text-xl font-semibold text-white"
          style={{ color: list.color || 'white' }}
        >
          {list.name}
        </h3>
        <span className="text-sm text-gray-400">
          ({tasks.length + completedTasks.length} tasks)
        </span>
      </div>
      {!isCollapsed && (
        <div className="ml-7 space-y-4">
          <TaskSection
            title=""
            tasks={tasks}
            droppableId={list.id}
            quickAddValue={quickAddValue}
            onQuickAddChange={(value) => onQuickAddChange(list.id, value)}
            onQuickAdd={() => onQuickAdd(list.id)}
            onToggleComplete={onToggleComplete}
            onDelete={onDelete}
            onEdit={onEdit}
            onAddSubtask={onAddSubtask}
            emptyMessage="No tasks in this list yet."
            showQuickAdd={!!isCurrentUserList}
          />
          
          {completedTasks.length > 0 && (
            <div className="mt-4 border-t border-white/10 pt-4">
              <div 
                className="flex items-center gap-2 cursor-pointer mb-2"
                onClick={() => setIsCompletedCollapsed(!isCompletedCollapsed)}
              >
                {isCompletedCollapsed ? (
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                )}
                <span className="text-sm font-medium text-gray-400">
                  Completed ({completedTasks.length})
                </span>
              </div>
              
              {!isCompletedCollapsed && (
                <TaskSection
                  title=""
                  tasks={completedTasks}
                  droppableId={`${list.id}_completed`}
                  quickAddValue=""
                  onQuickAddChange={() => {}}
                  onQuickAdd={() => {}}
                  onToggleComplete={onToggleComplete}
                  onDelete={onDelete}
                  onEdit={onEdit}
                  onAddSubtask={onAddSubtask}
                  showQuickAdd={false}
                  emptyMessage="No completed tasks yet."
                />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 