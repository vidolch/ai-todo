"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface List {
  id: string;
  name: string;
  _count: {
    tasks: number;
  };
}

interface DeleteListDialogProps {
  list: List;
  otherLists: List[];
  onClose: () => void;
  onConfirm: (targetListId?: string, deleteTasks?: boolean) => Promise<void>;
}

export function DeleteListDialog({ list, otherLists, onClose, onConfirm }: DeleteListDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [targetListId, setTargetListId] = useState<string>();
  const [action, setAction] = useState<"move" | "delete">("move");

  const handleConfirm = async () => {
    try {
      setIsLoading(true);
      if (action === "move" && list._count.tasks > 0) {
        await onConfirm(targetListId);
      } else {
        await onConfirm(undefined, true);
      }
      onClose();
    } catch (error) {
      console.error("Error deleting list:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete List</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete &quot;{list.name}&quot;?
            {list._count.tasks > 0 && (
              <> This list contains {list._count.tasks} task{list._count.tasks === 1 ? "" : "s"}.</>
            )}
          </DialogDescription>
        </DialogHeader>

        {list._count.tasks > 0 && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="move"
                value="move"
                checked={action === "move"}
                onChange={(e) => setAction(e.target.value as "move" | "delete")}
                className="h-4 w-4"
              />
              <label htmlFor="move">Move tasks to another list</label>
            </div>

            {action === "move" && (
              <Select
                value={targetListId}
                onValueChange={setTargetListId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a list" />
                </SelectTrigger>
                <SelectContent>
                  {otherLists.map((l) => (
                    <SelectItem key={l.id} value={l.id}>
                      {l.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="delete"
                value="delete"
                checked={action === "delete"}
                onChange={(e) => setAction(e.target.value as "move" | "delete")}
                className="h-4 w-4"
              />
              <label htmlFor="delete">Delete all tasks in this list</label>
            </div>

            {action === "delete" && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  This will permanently delete all tasks in this list. This action cannot be undone.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isLoading || (action === "move" && !targetListId && list._count.tasks > 0)}
          >
            {isLoading ? "Deleting..." : "Delete List"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 