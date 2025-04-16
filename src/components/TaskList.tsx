"use client";

import { useEffect, useState } from "react";
import { Task } from "@/types/task";
import { Task as TaskComponent } from "./Task";
import { Button } from "./ui/button";
import { ChevronDown, ChevronRight, Plus } from "lucide-react";
import { TaskForm } from "./TaskForm";
import { Input } from "./ui/input";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";

interface List {
  id: string;
  name: string;
  description?: string | null;
  color?: string | null;
  _count: {
    tasks: number;
  };
}

const TODO_LIST_ID = "todo";
const DONE_LIST_ID = "done";

export function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [lists, setLists] = useState<List[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [quickTaskTitle, setQuickTaskTitle] = useState("");
  const [collapsedLists, setCollapsedLists] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchTasks();
    fetchLists();
  }, []);

  const fetchLists = async () => {
    try {
      const response = await fetch("/api/lists");
      if (response.ok) {
        const data = await response.json();
        setLists(data);
        // Initialize collapsed state for new lists
        const newCollapsedState = { ...collapsedLists };
        data.forEach((list: List) => {
          if (!(list.id in newCollapsedState)) {
            newCollapsedState[list.id] = false; // Default to expanded
          }
        });
        setCollapsedLists(newCollapsedState);
      }
    } catch (error) {
      console.error("Error fetching lists:", error);
    }
  };

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

  const handleQuickAdd = async () => {
    if (!quickTaskTitle.trim()) return;

    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: quickTaskTitle,
          severity: "normal",
        }),
      });

      if (response.ok) {
        const newTask = await response.json();
        setTasks((prevTasks) => [newTask, ...prevTasks]);
        setQuickTaskTitle("");
      }
    } catch (error) {
      console.error("Error creating quick task:", error);
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
    .filter((task) => !task.completed && !task.listId && (!editingTask || task.id !== editingTask.id))
    .sort((a, b) => {
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
      return a.title.localeCompare(b.title);
    });

  const getListTasks = (listId: string) => {
    return tasks
      .filter((task) => !task.completed && task.listId === listId && (!editingTask || task.id !== editingTask.id))
      .sort((a, b) => {
        if (a.dueDate && b.dueDate) {
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }
        if (a.dueDate) return -1;
        if (b.dueDate) return 1;
        return a.title.localeCompare(b.title);
      });
  };

  const doneTasks = tasks
    .filter((task) => task.completed && (!editingTask || task.id !== editingTask.id))
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const toggleListCollapse = (listId: string) => {
    setCollapsedLists(prev => ({
      ...prev,
      [listId]: !prev[listId]
    }));
  };

  const handleDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;
    
    // Dropped outside any droppable
    if (!destination) return;

    // No movement
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) return;

    const task = tasks.find(t => t.id === draggableId);
    if (!task) return;

    // Determine the new listId
    let newListId: string | null = null;
    if (destination.droppableId !== TODO_LIST_ID && destination.droppableId !== DONE_LIST_ID) {
      newListId = destination.droppableId;
    }

    // Update task with new list and completion status
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...task,
          listId: newListId,
          completed: destination.droppableId === DONE_LIST_ID,
        }),
      });

      if (response.ok) {
        const updatedTask = await response.json();
        setTasks(prevTasks =>
          prevTasks.map(t => t.id === updatedTask.id ? updatedTask : t)
        );
      }
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

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

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-white mb-4">To Do</h3>
            <div className="flex gap-2 mb-4">
              <Input
                type="text"
                value={quickTaskTitle}
                onChange={(e) => setQuickTaskTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleQuickAdd()}
                placeholder="Add a quick task..."
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
              />
              <Button
                onClick={handleQuickAdd}
                disabled={!quickTaskTitle.trim()}
                className="bg-blue-600 text-white hover:bg-blue-500 px-6"
              >
                Add
              </Button>
            </div>
            <Droppable droppableId={TODO_LIST_ID}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="space-y-2"
                >
                  {todoTasks.map((task, index) => (
                    <Draggable key={task.id} draggableId={task.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={snapshot.isDragging ? "opacity-50" : ""}
                        >
                          <TaskComponent
                            task={task}
                            onToggleComplete={handleToggleComplete}
                            onDelete={handleDelete}
                            onEdit={handleEdit}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                  {todoTasks.length === 0 && (
                    <p className="text-center text-gray-400">No tasks to do. Add one to get started!</p>
                  )}
                </div>
              )}
            </Droppable>
          </div>

          {lists.map((list) => (
            <div key={list.id} className="border-t border-white/10 pt-6">
              <div 
                className="flex items-center gap-2 cursor-pointer mb-4"
                onClick={() => toggleListCollapse(list.id)}
              >
                {collapsedLists[list.id] ? (
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
                  ({getListTasks(list.id).length} tasks)
                </span>
              </div>
              {!collapsedLists[list.id] && (
                <Droppable droppableId={list.id}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="space-y-2 ml-7"
                    >
                      {getListTasks(list.id).map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={snapshot.isDragging ? "opacity-50" : ""}
                            >
                              <TaskComponent
                                task={task}
                                onToggleComplete={handleToggleComplete}
                                onDelete={handleDelete}
                                onEdit={handleEdit}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      {getListTasks(list.id).length === 0 && (
                        <p className="text-center text-gray-400">No tasks in this list yet.</p>
                      )}
                    </div>
                  )}
                </Droppable>
              )}
            </div>
          ))}

          <div className="border-t border-white/10 pt-6">
            <h3 className="text-xl font-semibold text-white mb-4">Done</h3>
            <Droppable droppableId={DONE_LIST_ID}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="space-y-2"
                >
                  {doneTasks.map((task, index) => (
                    <Draggable key={task.id} draggableId={task.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={snapshot.isDragging ? "opacity-50" : ""}
                        >
                          <TaskComponent
                            task={task}
                            onToggleComplete={handleToggleComplete}
                            onDelete={handleDelete}
                            onEdit={handleEdit}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                  {doneTasks.length === 0 && (
                    <p className="text-center text-gray-400">No completed tasks yet.</p>
                  )}
                </div>
              )}
            </Droppable>
          </div>
        </div>
      </DragDropContext>
    </div>
  );
} 