import { Lists } from "@/components/Lists";

export const metadata = {
  title: "Lists | AI Todo",
  description: "Manage your todo lists",
};

export default function ListsPage() {
  return (
    <div className="container mx-auto py-8">
      <Lists />
    </div>
  );
} 