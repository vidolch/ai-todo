import { Button } from "./ui/button";
import { Plus } from "lucide-react";

interface TaskListHeaderProps {
  onAddTask: () => void;
}

export function TaskListHeader({ onAddTask }: TaskListHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold text-white">Tasks</h2>
      <Button 
        onClick={onAddTask}
        className="bg-blue-600 text-white hover:bg-blue-500"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Task
      </Button>
    </div>
  );
} 