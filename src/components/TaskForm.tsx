"use client";

import { useState } from "react";
import { Task } from "@/types/task";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface TaskFormProps {
  task?: Task | null;
  onSubmit: (taskData: Partial<Task>) => void;
  onCancel: () => void;
}

export function TaskForm({ task, onSubmit, onCancel }: TaskFormProps) {
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [severity, setSeverity] = useState<"low" | "normal" | "critical">(
    task?.severity || "normal"
  );
  const [dueDate, setDueDate] = useState<Date | undefined>(
    task?.dueDate ? new Date(task.dueDate) : undefined
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit({
      title,
      description,
      severity,
      dueDate,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border border-white/10 rounded-lg bg-white/5">
      <div className="space-y-2">
        <Label htmlFor="title" className="text-white">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
          required
          className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-white">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
          className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="severity" className="text-white">Severity</Label>
        <Select value={severity} onValueChange={(value: "low" | "normal" | "critical") => setSeverity(value)}>
          <SelectTrigger className="bg-white/5 border-white/10 text-white">
            <SelectValue placeholder="Select severity" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-white/10">
            <SelectItem value="low" className="text-white hover:bg-white/10">Low</SelectItem>
            <SelectItem value="normal" className="text-white hover:bg-white/10">Normal</SelectItem>
            <SelectItem value="critical" className="text-white hover:bg-white/10">Critical</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-white">Due Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal bg-white/5 border-white/10 text-white hover:bg-white/10"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dueDate ? format(dueDate, "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-gray-800 border border-white/10">
            <Calendar
              mode="single"
              selected={dueDate}
              onSelect={setDueDate}
              initialFocus
              className="bg-gray-800"
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex justify-end space-x-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          className="bg-white/5 border-white/10 text-white hover:bg-white/10"
        >
          Cancel
        </Button>
        <Button 
          type="submit"
          className="bg-blue-600 text-white hover:bg-blue-500"
        >
          {task ? "Update Task" : "Create Task"}
        </Button>
      </div>
    </form>
  );
} 