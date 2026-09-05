import TaskForm from "@/components/tasks/TaskForm";
import TaskCard from "@/components/tasks/TaskCard";
import type { Locale } from "@/lib/constants";
import type { Task, User, Project } from "@prisma/client";

type FullTask = Task & { assignee: User | null; project: Project | null };

export default function ProjectTasksTab({
  projectId,
  tasks,
  users,
  materials,
  containers,
  workers,
  locale,
}: {
  projectId: string;
  tasks: FullTask[];
  users: { id: string; name: string }[];
  materials: { id: string; name: string }[];
  containers: { id: string; name: string }[];
  workers: { id: string; name: string }[];
  locale: Locale;
}) {
  return (
    <div className="space-y-4">
      <TaskForm locale={locale} projects={[]} users={users} materials={materials} containers={containers} workers={workers} defaultProjectId={projectId} label="Нове завдання для проєкту" />
      <div className="space-y-2">
        {tasks.map((t) => (
          <TaskCard key={t.id} task={t} locale={locale} />
        ))}
        {tasks.length === 0 && <p className="rounded-xl border border-dashed border-gray-300 py-10 text-center text-sm text-gray-400 dark:border-gray-700">Завдань ще немає</p>}
      </div>
    </div>
  );
}
