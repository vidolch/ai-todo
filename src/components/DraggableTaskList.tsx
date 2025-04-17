import { Task } from "@/types/task";
import { Task as TaskComponent } from "./Task";
import { Droppable, Draggable } from "@hello-pangea/dnd";

interface DraggableTaskListProps {
  tasks: Task[];
  droppableId: string;
  onToggleComplete: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onAddSubtask: (parentId: string, title: string) => void;
  emptyMessage?: string;
  className?: string;
  currentUserId?: string | null;
}

export function DraggableTaskList({
  tasks,
  droppableId,
  onToggleComplete,
  onDelete,
  onEdit,
  onAddSubtask,
  emptyMessage = "No tasks to display",
  className = "",
  currentUserId
}: DraggableTaskListProps) {
  return (
    <Droppable droppableId={droppableId}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={`space-y-2 ${className}`}
        >
          {tasks.map((task, index) => {
            const isCurrentUserTask = !!(currentUserId && task.userId === currentUserId);
            
            return (
              <Draggable 
                key={task.id} 
                draggableId={task.id} 
                index={index}
                isDragDisabled={!isCurrentUserTask}
              >
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={snapshot.isDragging ? "opacity-50" : ""}
                  >
                    <TaskComponent
                      task={task}
                      onToggleComplete={onToggleComplete}
                      onDelete={onDelete}
                      onEdit={onEdit}
                      onAddSubtask={onAddSubtask}
                      isCurrentUserTask={isCurrentUserTask}
                    />
                  </div>
                )}
              </Draggable>
            );
          })}
          {provided.placeholder}
          {tasks.length === 0 && (
            <p className="text-center text-gray-400">{emptyMessage}</p>
          )}
        </div>
      )}
    </Droppable>
  );
} 