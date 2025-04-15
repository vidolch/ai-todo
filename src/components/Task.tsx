"use client";

import { Task as TaskType } from "@/types/task";
import { Checkbox } from "./ui/checkbox";
import { Button } from "./ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskProps {
  task: TaskType;
  onToggleComplete: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onEdit: (task: TaskType) => void;
}

export function Task({ task, onToggleComplete, onDelete, onEdit }: TaskProps) {
  return (
    <div className="flex items-center justify-between p-4 border border-white/10 rounded-lg bg-white/5 shadow-sm hover:bg-white/10 transition-colors">
      <div className="flex items-center space-x-4">
        <Checkbox
          checked={task.completed}
          onCheckedChange={() => onToggleComplete(task.id)}
          className="h-5 w-5"
        />
        <div className="flex-1">
          <h3
            className={cn(
              "text-lg font-medium text-white",
              task.completed && "line-through text-gray-500"
            )}
          >
            {task.title}
          </h3>
          {task.description && (
            <p className="text-sm text-gray-400">{task.description}</p>
          )}
          {task.dueDate && (
            <p className="text-xs text-gray-500">
              Due: {new Date(task.dueDate).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit(task)}
          className="h-8 w-8 hover:bg-white/10"
        >
          <Pencil className="h-4 w-4 text-gray-400" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(task.id)}
          className="h-8 w-8 hover:bg-white/10 text-red-400 hover:text-red-300"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
} 