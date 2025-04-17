"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { UserPlus, X, Check } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import debounce from 'lodash/debounce';

interface User {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
}

interface InvitedUser {
  userId: string;
  role: "OWNER" | "CONTRIBUTOR";
  user: User;
}

interface List {
  id: string;
  name: string;
  description?: string | null;
  color?: string | null;
}

interface ListFormProps {
  list?: List | null;
  onSubmit: (data: Partial<List> & { invitedUsers?: InvitedUser[] }) => void;
  onCancel: () => void;
  isEditing?: boolean;
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

export function ListForm({ list, onSubmit, onCancel, isEditing = false }: ListFormProps) {
  const [formData, setFormData] = useState<Partial<List>>({
    name: '',
    description: '',
    color: DEFAULT_COLORS[0],
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [invitedUsers, setInvitedUsers] = useState<InvitedUser[]>([]);

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
    onSubmit({
      ...formData,
      invitedUsers: invitedUsers.length > 0 ? invitedUsers : undefined
    });
  };

  // Search users with debounce
  const searchUsers = debounce(async (term: string) => {
    if (!term.trim() || term.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`/api/users?search=${encodeURIComponent(term)}`);
      if (response.ok) {
        const users = await response.json();
        // Filter out already invited users
        const filteredUsers = users.filter(
          (user: User) => !invitedUsers.some(invited => invited.userId === user.id)
        );
        setSearchResults(filteredUsers);
      }
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setIsSearching(false);
    }
  }, 300);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    searchUsers(value);
  };

  const addUser = (user: User) => {
    setInvitedUsers([
      ...invitedUsers,
      { 
        userId: user.id, 
        role: "CONTRIBUTOR", 
        user 
      }
    ]);
    setSearchTerm('');
    setSearchResults([]);
  };

  const removeInvitedUser = (userId: string) => {
    setInvitedUsers(invitedUsers.filter(user => user.userId !== userId));
  };

  const updateUserRole = (userId: string, role: "OWNER" | "CONTRIBUTOR") => {
    setInvitedUsers(
      invitedUsers.map(user => 
        user.userId === userId ? { ...user, role } : user
      )
    );
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

      {!isEditing && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-white">Invite Users</label>
          <div className="relative">
            <div className="flex items-center">
              <Input
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search users by name or email"
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 pr-10"
              />
              <UserPlus className="absolute right-3 h-5 w-5 text-gray-400" />
            </div>
            
            {isSearching && (
              <div className="mt-1 text-sm text-gray-400">Searching...</div>
            )}
            
            {searchResults.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-gray-800 border border-white/10 rounded-md shadow-lg max-h-60 overflow-auto">
                <ul className="py-1">
                  {searchResults.map((user) => (
                    <li 
                      key={user.id} 
                      className="px-3 py-2 hover:bg-white/5 cursor-pointer flex items-center gap-2"
                      onClick={() => addUser(user)}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.image || undefined} alt={user.name || ''} />
                        <AvatarFallback>{user.name?.[0] || user.email?.[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-sm font-medium text-white">{user.name}</div>
                        <div className="text-xs text-gray-400">{user.email}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {invitedUsers.length > 0 && (
            <div className="mt-3">
              <div className="text-sm font-medium text-white mb-2">Invited Users:</div>
              <ul className="space-y-2">
                {invitedUsers.map((invited) => (
                  <li key={invited.userId} className="flex items-center justify-between p-2 bg-white/5 rounded-md">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={invited.user.image || undefined} alt={invited.user.name || ''} />
                        <AvatarFallback>{invited.user.name?.[0] || invited.user.email?.[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-sm font-medium text-white">{invited.user.name}</div>
                        <div className="text-xs text-gray-400">{invited.user.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select
                        value={invited.role}
                        onValueChange={(value: "OWNER" | "CONTRIBUTOR") => updateUserRole(invited.userId, value)}
                      >
                        <SelectTrigger className="w-32 h-8 bg-white/5 border-white/10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="OWNER">Owner</SelectItem>
                          <SelectItem value="CONTRIBUTOR">Contributor</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeInvitedUser(invited.userId)}
                        className="h-8 w-8 text-gray-400 hover:text-white hover:bg-red-500/10"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

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