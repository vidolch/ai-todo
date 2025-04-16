"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface List {
  id: string;
  name: string;
  description?: string | null;
  color?: string | null;
}

interface ListFormProps {
  list?: List | null;
  onSubmit: (data: Partial<List>) => void;
  onCancel: () => void;
}

const DEFAULT_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#f59e0b', // amber
  '#84cc16', // lime
  '#22c55e', // green
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#6366f1', // indigo
  '#a855f7', // purple
  '#ec4899', // pink
];

export function ListForm({ list, onSubmit, onCancel }: ListFormProps) {
  const [formData, setFormData] = useState<Partial<List>>({
    name: '',
    description: '',
    color: DEFAULT_COLORS[0],
  });

  useEffect(() => {
    if (list) {
      setFormData({
        name: list.name,
        description: list.description || '',
        color: list.color || DEFAULT_COLORS[0],
      });
    }
  }, [list]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white/5 border border-white/10 rounded-lg">
      <div className="space-y-2">
        <label htmlFor="name" className="block text-sm font-medium text-white">
          List Name
        </label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter list name"
          required
          className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="block text-sm font-medium text-white">
          Description
        </label>
        <Textarea
          id="description"
          value={formData.description || ''}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Enter list description (optional)"
          rows={3}
          className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-white">Color</label>
        <div className="flex flex-wrap gap-2">
          {DEFAULT_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              className={`w-8 h-8 rounded-full border-2 ${
                formData.color === color ? 'border-white' : 'border-transparent'
              }`}
              style={{ backgroundColor: color }}
              onClick={() => setFormData({ ...formData, color })}
            />
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          className="border-white/10 text-white hover:bg-white/5"
        >
          Cancel
        </Button>
        <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-500">
          {list ? 'Update List' : 'Create List'}
        </Button>
      </div>
    </form>
  );
} 