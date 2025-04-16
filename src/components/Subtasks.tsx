"use client";

import { Task } from "@/types/task";
import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ChevronDown, ChevronRight, Plus } from "lucide-react";
import { Task as TaskComponent } from "./Task";

interface SubtasksProps {
  task: Task;
  onToggleComplete: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onAddSubtask: (parentId: string, title: string) => void;
}

export function Subtasks({ task, onToggleComplete, onDelete, onEdit, onAddSubtask }: SubtasksProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");

  const handleAddSubtask = () => {
    if (newSubtaskTitle.trim()) {
      onAddSubtask(task.id, newSubtaskTitle);
      setNewSubtaskTitle("");
    }
  };

  return (
    <div className="ml-6 mt-2">
      <div className="flex items-center gap-2 mb-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-6 w-6"
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-400" />
          )}
        </Button>
        <span className="text-sm text-gray-400">
          {task.subtasks?.length || 0} subtasks
        </span>
      </div>

      {isExpanded && (
        <div className="space-y-2">
          <div className="flex gap-2 mb-2">
            <Input
              type="text"
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddSubtask()}
              placeholder="Add a subtask..."
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 h-8 text-sm"
            />
            <Button
              onClick={handleAddSubtask}
              disabled={!newSubtaskTitle.trim()}
              className="h-8 px-2 bg-blue-600 text-white hover:bg-blue-500"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {task.subtasks?.map((subtask) => (
            <TaskComponent
              key={subtask.id}
              task={subtask}
              onToggleComplete={onToggleComplete}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          ))}
        </div>
      )}
    </div>
  );
} 