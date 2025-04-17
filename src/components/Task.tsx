"use client";

import { Task as TaskType } from "@/types/task";
import { Checkbox } from "./ui/checkbox";
import { Button } from "./ui/button";
import { Pencil, Trash2, List, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "./ui/badge";
import { Subtasks } from "./Subtasks";
import { Progress } from "./ui/progress";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useEffect, useState } from "react";

interface TaskProps {
  task: TaskType;
  onToggleComplete: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onEdit: (task: TaskType) => void;
  onAddSubtask: (parentId: string, title: string) => void;
  isCurrentUserTask?: boolean;
}

const severityColors = {
  low: "bg-blue-500/20 text-blue-300",
  normal: "bg-yellow-500/20 text-yellow-300",
  critical: "bg-red-500/20 text-red-300",
};

export function Task({ task, onToggleComplete, onDelete, onEdit, onAddSubtask, isCurrentUserTask }: TaskProps) {
  const subtasks = task.subtasks || [];
  const completedSubtasks = subtasks.filter((st) => st.completed).length;
  const progress = subtasks.length > 0 ? (completedSubtasks / subtasks.length) * 100 : 0;
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Fetch current user ID if isCurrentUserTask is not provided
  useEffect(() => {
    if (isCurrentUserTask !== undefined) return;
    
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
  }, [isCurrentUserTask]);

  // If isCurrentUserTask is provided, use it. Otherwise, determine it from the fetched user ID
  const canEditOrDelete = isCurrentUserTask !== undefined 
    ? isCurrentUserTask 
    : (task.user && currentUserId && task.user.id === currentUserId);

  return (
    <div className="p-4 rounded-lg border border-white/10 bg-white/5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Checkbox
            checked={task.completed}
            onCheckedChange={() => onToggleComplete(task.id)}
            className="h-5 w-5"
          />
          <div className="space-y-1">
            <h3 className={cn(
              "text-lg font-medium",
              task.completed && "line-through text-gray-400"
            )}>
              {task.title}
            </h3>
            {task.description && (
              <p className="text-sm text-gray-400">{task.description}</p>
            )}
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400">
              {task.dueDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{format(new Date(task.dueDate), "MMM d, yyyy")}</span>
                </div>
              )}
              {task.user && (
                <div className="flex items-center gap-1">
                  <Avatar className="h-4 w-4">
                    <AvatarImage src={task.user.image || undefined} alt={task.user.name || ''} />
                    <AvatarFallback className="text-[10px]">{task.user.name?.[0] || task.user.email?.[0]}</AvatarFallback>
                  </Avatar>
                  <span>
                    {task.user.name || task.user.email}
                    {canEditOrDelete && " (you)"}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {task.severity === "critical" && (
            <Badge variant="destructive">Critical</Badge>
          )}
          {task.severity === "normal" && (
            <Badge variant="default">Normal</Badge>
          )}
          {task.severity === "low" && (
            <Badge variant="secondary">Low</Badge>
          )}
          {canEditOrDelete && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-white"
                onClick={() => onEdit(task)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-white"
                onClick={() => onDelete(task.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>
      {subtasks.length > 0 && (
        <div className="space-y-2">
          <Progress value={progress} className="h-1 w-full" />
          <div className="flex items-center justify-between text-sm text-gray-400">
            <span>Progress</span>
            <span>{completedSubtasks} of {subtasks.length} completed</span>
          </div>
        </div>
      )}
      <Subtasks
        task={task}
        onToggleComplete={onToggleComplete}
        onDelete={onDelete}
        onEdit={onEdit}
        onAddSubtask={onAddSubtask}
        isCurrentUserTask={!!canEditOrDelete}
      />
    </div>
  );
} 