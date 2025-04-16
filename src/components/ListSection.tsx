import { Task } from "@/types/task";
import { TaskSection } from "./TaskSection";
import { ChevronDown, ChevronRight } from "lucide-react";

interface List {
  id: string;
  name: string;
  description?: string | null;
  color?: string | null;
  _count: {
    tasks: number;
  };
}

interface ListSectionProps {
  list: List;
  tasks: Task[];
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
          ({tasks.length} tasks)
        </span>
      </div>
      {!isCollapsed && (
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
          className="ml-7"
        />
      )}
    </div>
  );
} 