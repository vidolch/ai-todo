"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, Plus } from "lucide-react";
import { ListForm } from "@/components/ListForm";

interface List {
  id: string;
  name: string;
  description?: string | null;
  color?: string | null;
  tasks: { id: string }[];
  _count: { tasks: number };
}

export function Lists() {
  const [lists, setLists] = useState<List[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingList, setEditingList] = useState<List | null>(null);

  const fetchLists = async () => {
    try {
      const response = await fetch("/api/lists");
      if (!response.ok) throw new Error("Failed to fetch lists");
      const data = await response.json();
      setLists(data);
    } catch (error) {
      console.error("Error fetching lists:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLists();
  }, []);

  const handleFormSubmit = async (formData: Partial<List>) => {
    try {
      const url = editingList ? `/api/lists/${editingList.id}` : "/api/lists";
      const method = editingList ? "PATCH" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to save list");
      
      await fetchLists();
      setShowForm(false);
      setEditingList(null);
    } catch (error) {
      console.error("Error saving list:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/lists/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete list");
      await fetchLists();
    } catch (error) {
      console.error("Error deleting list:", error);
    }
  };

  if (loading) {
    return <div className="text-center p-4">Loading lists...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Lists</h2>
        <Button
          onClick={() => {
            setEditingList(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add List
        </Button>
      </div>

      {showForm && (
        <ListForm
          list={editingList}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingList(null);
          }}
        />
      )}

      {lists.length === 0 && !showForm ? (
        <div className="text-center p-8 bg-white/5 border border-white/10 rounded-lg">
          <p className="text-gray-400">No lists yet. Create your first list to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {lists.map((list) => (
            <div
              key={list.id}
              className="relative p-4 rounded-lg border border-white/10 bg-white/5 shadow-sm hover:bg-white/10 transition-colors"
              style={{
                borderLeftWidth: "4px",
                borderLeftColor: list.color || "#4b5563"
              }}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-lg text-white">{list.name}</h3>
                  {list.description && (
                    <p className="text-gray-400 text-sm">{list.description}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditingList(list);
                      setShowForm(true);
                    }}
                    className="text-gray-400 hover:text-white"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(list.id)}
                    className="text-gray-400 hover:text-white hover:bg-red-500/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="text-sm text-gray-400">
                {list._count.tasks} {list._count.tasks === 1 ? "task" : "tasks"}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 