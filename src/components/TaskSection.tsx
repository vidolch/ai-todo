import { Task } from "@/types/task";
import { DraggableTaskList } from "./DraggableTaskList";
import { QuickAddTask } from "./QuickAddTask";
import { useEffect, useState } from "react";

interface TaskSectionProps {
  title: string;
  tasks: Task[];
  droppableId: string;
  quickAddValue: string;
  onQuickAddChange: (value: string) => void;
  onQuickAdd: () => void;
  onToggleComplete: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onAddSubtask: (parentId: string, title: string) => void;
  showQuickAdd?: boolean;
  emptyMessage?: string;
  className?: string;
}

export function TaskSection({
  title,
  tasks,
  droppableId,
  quickAddValue,
  onQuickAddChange,
  onQuickAdd,
  onToggleComplete,
  onDelete,
  onEdit,
  onAddSubtask,
  showQuickAdd = true,
  emptyMessage,
  className = "",
}: TaskSectionProps) {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Fetch current user ID
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

  return (
    <div className={className}>
      <h3 className="text-xl font-semibold text-white mb-4">{title}</h3>
      {showQuickAdd && (
        <QuickAddTask
          value={quickAddValue}
          onChange={onQuickAddChange}
          onAdd={onQuickAdd}
        />
      )}
      <DraggableTaskList
        tasks={tasks}
        droppableId={droppableId}
        onToggleComplete={onToggleComplete}
        onDelete={onDelete}
        onEdit={onEdit}
        onAddSubtask={onAddSubtask}
        emptyMessage={emptyMessage}
        currentUserId={currentUserId}
      />
    </div>
  );
} 