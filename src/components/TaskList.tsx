"use client";

import { useCallback, useEffect, useState } from "react";
import { Task } from "@/types/task";
import { TaskForm } from "./TaskForm";
import { TaskListHeader } from "./TaskListHeader";
import { TaskSection } from "./TaskSection";
import { ListSection } from "./ListSection";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";

interface List {
  id: string;
  name: string;
  description?: string | null;
  color?: string | null;
  users?: {
    userId: string;
    role: string;
  }[];
  _count: {
    tasks: number;
  };
}

const TODO_LIST_ID = "todo";
const DONE_LIST_ID = "done";

export function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [lists, setLists] = useState<List[]>([]);
  const [listTasks, setListTasks] = useState<Record<string, Task[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [quickTaskTitle, setQuickTaskTitle] = useState("");
  const [quickTaskTitles, setQuickTaskTitles] = useState<Record<string, string>>({});
  const [collapsedLists, setCollapsedLists] = useState<Record<string, boolean>>({});


  useEffect(() => {
    // Fetch tasks for each list
    const fetchAllListTasks = async () => {
      for (const list of lists) {
        await fetchListTasks(list.id);
      }
    };
    
    if (lists.length > 0) {
      fetchAllListTasks();
    }
  }, [lists]);

  const fetchLists = useCallback(async () => {
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchTasks();
    fetchLists();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchListTasks = async (listId: string) => {
    try {
      const response = await fetch(`/api/lists/${listId}/tasks`);
      if (response.ok) {
        const data = await response.json();
        setListTasks(prev => ({
          ...prev,
          [listId]: data
        }));
      }
    } catch (error) {
      console.error(`Error fetching tasks for list ${listId}:`, error);
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

  const handleQuickAdd = async (listId?: string) => {
    const title = listId ? quickTaskTitles[listId] : quickTaskTitle;
    if (!title.trim()) return;

    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          severity: "normal",
          listId,
        }),
      });

      if (response.ok) {
        const newTask = await response.json();
        setTasks((prevTasks) => [newTask, ...prevTasks]);
        if (listId) {
          setQuickTaskTitles(prev => ({ ...prev, [listId]: "" }));
        } else {
          setQuickTaskTitle("");
        }
      }
    } catch (error) {
      console.error("Error creating quick task:", error);
    }
  };

  const handleToggleComplete = async (taskId: string) => {
    try {
      const task = tasks.find((t) => t.id === taskId);
      
      // Check if the task exists in any of the lists
      let listTask = null;
      let listId = null;
      
      for (const [id, tasksInList] of Object.entries(listTasks)) {
        const foundTask = tasksInList.find(t => t.id === taskId);
        if (foundTask) {
          listTask = foundTask;
          listId = id;
          break;
        }
      }
      
      // Use the found task or fall back to the one from general tasks
      const taskToUpdate = listTask || task;
      
      if (!taskToUpdate) return;

      // Check if this is the current user's task
      const isCurrentUserTask = taskToUpdate.userId === (await getCurrentUserId());
      
      // For tasks not owned by current user, only update the completion status
      const updateData = isCurrentUserTask ? {
        title: taskToUpdate.title,
        description: taskToUpdate.description,
        severity: taskToUpdate.severity,
        dueDate: taskToUpdate.dueDate,
        completed: !taskToUpdate.completed,
        listId: taskToUpdate.listId,
        parentId: taskToUpdate.parentId,
        tags: taskToUpdate.tags?.map(tag => tag.id),
      } : {
        completed: !taskToUpdate.completed
      };

      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        const updatedTask = await response.json();
        
        // Update tasks in the main task list
        setTasks((prevTasks) =>
          prevTasks.map((t) => {
            if (t.id === updatedTask.id) {
              return updatedTask;
            }
            // If this task has the updated task as a subtask, update it
            if (t.subtasks?.some(st => st.id === updatedTask.id)) {
              return {
                ...t,
                subtasks: t.subtasks.map(st => 
                  st.id === updatedTask.id ? updatedTask : st
                )
              };
            }
            return t;
          })
        );
        
        // If this was a list task, refresh the list's tasks
        if (listId) {
          fetchListTasks(listId);
        }
        
        // If this task has a parent task, and that parent is in a list, refresh that list too
        if (updatedTask.parentId) {
          const parentTask = tasks.find(t => t.id === updatedTask.parentId);
          if (parentTask && parentTask.listId) {
            fetchListTasks(parentTask.listId);
          }
        }
      }
    } catch (error) {
      console.error("Error toggling task completion:", error);
    }
  };

  // Helper function to get current user ID
  const getCurrentUserId = async () => {
    try {
      const response = await fetch('/api/user');
      if (response.ok) {
        const userData = await response.json();
        return userData.id;
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
    return null;
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
    setEditingTask({
      ...task,
      parentId: task.parentId || null
    });
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
          body: JSON.stringify({
            ...taskData,
            parentId: editingTask.parentId,
          }),
        });

        if (response.ok) {
          const updatedTask = await response.json();
          setTasks((prevTasks) =>
            prevTasks.map((t) => {
              if (t.id === updatedTask.id) {
                return updatedTask;
              }
              // If this task has the updated task as a subtask, update it
              if (t.subtasks?.some(st => st.id === updatedTask.id)) {
                return {
                  ...t,
                  subtasks: t.subtasks.map(st => 
                    st.id === updatedTask.id ? updatedTask : st
                  )
                };
              }
              return t;
            })
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

  const handleAddSubtask = async (parentId: string, title: string) => {
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          severity: "normal",
          parentId,
        }),
      });

      if (response.ok) {
        const newSubtask = await response.json();
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id === parentId
              ? { ...task, subtasks: [...(task.subtasks || []), newSubtask] }
              : task
          )
        );
      }
    } catch (error) {
      console.error("Error creating subtask:", error);
    }
  };

  // Filter and sort tasks
  const todoTasks = tasks
    .filter((task) => !task.completed && !task.listId && !task.parentId && (!editingTask || task.id !== editingTask.id))
    .sort((a, b) => {
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
      return a.title.localeCompare(b.title);
    });

  const getListTasks = (listId: string) => {
    // Get tasks from the listTasks state, which includes tasks from all collaborators
    const tasksForList = listTasks[listId] || [];
    
    return tasksForList
      .filter((task) => !task.completed && !task.parentId && (!editingTask || task.id !== editingTask.id))
      .sort((a, b) => {
        if (a.dueDate && b.dueDate) {
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }
        if (a.dueDate) return -1;
        if (b.dueDate) return 1;
        return a.title.localeCompare(b.title);
      });
  };

  const getListCompletedTasks = (listId: string) => {
    // Get completed tasks from the listTasks state
    const tasksForList = listTasks[listId] || [];
    
    return tasksForList
      .filter((task) => task.completed && !task.parentId && (!editingTask || task.id !== editingTask.id))
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  };

  const doneTasks = tasks
    .filter((task) => task.completed && !task.listId && !task.parentId && (!editingTask || task.id !== editingTask.id))
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

    // Check if this is a task owned by the current user
    const currentUserResponse = await fetch('/api/user');
    if (!currentUserResponse.ok) return;
    
    const currentUser = await currentUserResponse.json();
    if (task.userId !== currentUser.id) {
      // Only allow changing completion status for tasks not owned by current user
      if (
        (source.droppableId === DONE_LIST_ID && destination.droppableId !== DONE_LIST_ID) ||
        (source.droppableId !== DONE_LIST_ID && destination.droppableId === DONE_LIST_ID) ||
        destination.droppableId.includes("_completed")
      ) {
        // Allow toggling completion status
        try {
          const response = await fetch(`/api/tasks/${task.id}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              completed: destination.droppableId === DONE_LIST_ID || destination.droppableId.includes("_completed"),
            }),
          });

          if (response.ok) {
            const updatedTask = await response.json();
            setTasks(prevTasks =>
              prevTasks.map(t => t.id === updatedTask.id ? updatedTask : t)
            );
            
            // If this was a list task, refresh the list's tasks
            if (task.listId) {
              fetchListTasks(task.listId);
            }
            
            // If destination was a list's completed section, also refresh that list
            if (destination.droppableId.includes("_completed")) {
              const listId = destination.droppableId.split("_")[0];
              fetchListTasks(listId);
            }
          }
        } catch (error) {
          console.error("Error updating task completion:", error);
        }
      }
      return;
    }

    // Proceed with full update for user's own tasks
    // Extract listId from droppableId (could be a list ID or list_completed)
    let newListId: string | null = null;
    let shouldComplete = false;
    
    if (destination.droppableId !== TODO_LIST_ID && destination.droppableId !== DONE_LIST_ID) {
      if (destination.droppableId.includes("_completed")) {
        // If dropped in a list's completed section
        newListId = destination.droppableId.split("_")[0];
        shouldComplete = true;
      } else {
        // If dropped in a regular list
        newListId = destination.droppableId;
        shouldComplete = false;
      }
    } else {
      // If dropped in general todo or done
      shouldComplete = destination.droppableId === DONE_LIST_ID;
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
          completed: shouldComplete,
        }),
      });

      if (response.ok) {
        const updatedTask = await response.json();
        setTasks(prevTasks =>
          prevTasks.map(t => t.id === updatedTask.id ? updatedTask : t)
        );
        
        // Refresh source and destination lists if needed
        if (task.listId) {
          fetchListTasks(task.listId);
        }
        if (newListId) {
          fetchListTasks(newListId);
        }
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
      <TaskListHeader onAddTask={() => setShowForm(true)} />

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
          <TaskSection
            title="To Do"
            tasks={todoTasks}
            droppableId={TODO_LIST_ID}
            quickAddValue={quickTaskTitle}
            onQuickAddChange={setQuickTaskTitle}
            onQuickAdd={() => handleQuickAdd()}
            onToggleComplete={handleToggleComplete}
            onDelete={handleDelete}
            onEdit={handleEdit}
            onAddSubtask={handleAddSubtask}
            emptyMessage="No tasks to do. Add one to get started!"
          />

          {lists.map((list) => (
            <ListSection
              key={list.id}
              list={list}
              tasks={getListTasks(list.id)}
              completedTasks={getListCompletedTasks(list.id)}
              isCollapsed={collapsedLists[list.id]}
              quickAddValue={quickTaskTitles[list.id] || ""}
              onToggleCollapse={(listId) => {
                toggleListCollapse(listId);
                fetchListTasks(listId); // Refresh tasks when expanding a list
              }}
              onQuickAddChange={(listId, value) => 
                setQuickTaskTitles(prev => ({ ...prev, [listId]: value }))
              }
              onQuickAdd={handleQuickAdd}
              onToggleComplete={handleToggleComplete}
              onDelete={handleDelete}
              onEdit={handleEdit}
              onAddSubtask={handleAddSubtask}
            />
          ))}

          <TaskSection
            title="Done"
            tasks={doneTasks}
            droppableId={DONE_LIST_ID}
            quickAddValue=""
            onQuickAddChange={() => {}}
            onQuickAdd={() => {}}
            onToggleComplete={handleToggleComplete}
            onDelete={handleDelete}
            onEdit={handleEdit}
            onAddSubtask={handleAddSubtask}
            showQuickAdd={false}
            emptyMessage="No completed tasks yet."
            className="border-t border-white/10 pt-6"
          />
        </div>
      </DragDropContext>
    </div>
  );
} 