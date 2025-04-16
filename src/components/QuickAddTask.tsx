import { Input } from "./ui/input";
import { Button } from "./ui/button";

interface QuickAddTaskProps {
  value: string;
  onChange: (value: string) => void;
  onAdd: () => void;
  placeholder?: string;
}

export function QuickAddTask({ value, onChange, onAdd, placeholder = "Add a quick task..." }: QuickAddTaskProps) {
  return (
    <div className="flex gap-2 mb-4">
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onAdd()}
        placeholder={placeholder}
        className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
      />
      <Button
        onClick={onAdd}
        disabled={!value.trim()}
        className="bg-blue-600 text-white hover:bg-blue-500 px-6"
      >
        Add
      </Button>
    </div>
  );
} 