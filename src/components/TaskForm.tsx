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
  const [severity, setSeverity] = useState<Task["severity"]>(task?.severity || "normal");
  const [dueDate, setDueDate] = useState<Date | undefined>(
    task?.dueDate ? new Date(task.dueDate) : undefined
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    onSubmit({
      title,
      description,
      severity,
      dueDate: dueDate || null,
    });

    setIsSubmitting(false);
  };

  const handleDateSelect = (date: Date | undefined) => {
    setDueDate(date);
    setIsCalendarOpen(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white/5 p-6 rounded-lg border border-white/10">
      <div className="space-y-2">
        <Label htmlFor="title" className="text-white">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="bg-white/5 border-white/10 text-white"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-white">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="bg-white/5 border-white/10 text-white"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="severity" className="text-white">Severity</Label>
        <Select
          value={severity}
          onValueChange={(value: Task["severity"]) => setSeverity(value)}
        >
          <SelectTrigger className="bg-white/5 border-white/10 text-white">
            <SelectValue placeholder="Select severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low" className="text-green-400 hover:text-green-300 hover:bg-green-400/10">
              Low
            </SelectItem>
            <SelectItem value="normal" className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/10">
              Normal
            </SelectItem>
            <SelectItem value="critical" className="text-red-400 hover:text-red-300 hover:bg-red-400/10">
              Critical
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-white">Due Date</Label>
        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal bg-white/5 border-white/10 text-white hover:bg-white/10"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dueDate ? format(dueDate, "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-gray-800 border border-white/10" align="start" side="bottom">
            <Calendar
              mode="single"
              selected={dueDate}
              onSelect={handleDateSelect}
              initialFocus
              className="bg-gray-800"
              disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          onClick={onCancel}
          className="bg-white/10 text-white hover:bg-white/20"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-600 text-white hover:bg-blue-500"
        >
          {isSubmitting ? "Saving..." : task ? "Update Task" : "Create Task"}
        </Button>
      </div>
    </form>
  );
} 