"use client";

import { useEffect, useState } from "react";
import { Task } from "@/types/task";
import { Task as TaskComponent } from "./Task";
import { Button } from "./ui/button";
import { Plus } from "lucide-react";
import { TaskForm } from "./TaskForm";

export function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch("/api/tasks");
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleComplete = async (taskId: string) => {
    try {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;

      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: task.title,
          description: task.description,
          severity: task.severity,
          dueDate: task.dueDate,
          completed: !task.completed,
          listId: task.listId,
          tags: task.tags?.map(tag => tag.id),
        }),
      });

      if (response.ok) {
        setTasks((prevTasks) =>
          prevTasks.map((t) =>
            t.id === taskId ? { ...t, completed: !t.completed } : t
          )
        );
      }
    } catch (error) {
      console.error("Error toggling task completion:", error);
    }
  };

  const handleDelete = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setTasks((prevTasks) => prevTasks.filter((t) => t.id !== taskId));
      }
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleFormSubmit = async (taskData: Partial<Task>) => {
    try {
      if (editingTask) {
        const response = await fetch(`/api/tasks/${editingTask.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(taskData),
        });

        if (response.ok) {
          const updatedTask = await response.json();
          setTasks((prevTasks) =>
            prevTasks.map((t) => (t.id === updatedTask.id ? updatedTask : t))
          );
        }
      } else {
        const response = await fetch("/api/tasks", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(taskData),
        });

        if (response.ok) {
          const newTask = await response.json();
          setTasks((prevTasks) => [newTask, ...prevTasks]);
        }
      }

      setShowForm(false);
      setEditingTask(null);
    } catch (error) {
      console.error("Error saving task:", error);
    }
  };

  // Filter and sort tasks
  const todoTasks = tasks
    .filter((task) => !task.completed && (!editingTask || task.id !== editingTask.id))
    .sort((a, b) => {
      // If both have due dates, sort by due date
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      // If only one has a due date, that one comes first
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
      // If neither has a due date, sort by title
      return a.title.localeCompare(b.title);
    });

  const doneTasks = tasks
    .filter((task) => task.completed && (!editingTask || task.id !== editingTask.id))
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  if (isLoading) {
    return <div className="text-white">Loading tasks...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Tasks</h2>
        <Button 
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white hover:bg-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>

      {showForm && (
        <TaskForm
          task={editingTask}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingTask(null);
          }}
        />
      )}

      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-white mb-4">To Do</h3>
          <div className="space-y-2">
            {todoTasks.map((task) => (
              <TaskComponent
                key={task.id}
                task={task}
                onToggleComplete={handleToggleComplete}
                onDelete={handleDelete}
                onEdit={handleEdit}
              />
            ))}
            {todoTasks.length === 0 && (
              <p className="text-center text-gray-400">No tasks to do. Add one to get started!</p>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-white mb-4">Done</h3>
          <div className="space-y-2">
            {doneTasks.map((task) => (
              <TaskComponent
                key={task.id}
                task={task}
                onToggleComplete={handleToggleComplete}
                onDelete={handleDelete}
                onEdit={handleEdit}
              />
            ))}
            {doneTasks.length === 0 && (
              <p className="text-center text-gray-400">No completed tasks yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 