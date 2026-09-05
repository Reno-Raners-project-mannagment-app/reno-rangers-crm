import Disclosure from "@/components/Disclosure";
import { createTaskAction } from "@/lib/actions/tasks";
import { TASK_RELATED_TYPES, TASK_PRIORITIES, TASK_PRIORITY_LABELS, type Locale } from "@/lib/constants";

const inputCls = "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100";

type Option = { id: string; name: string };

export default function TaskForm({
  locale,
  projects,
  users,
  materials,
  containers,
  workers,
  defaultProjectId,
  label = "Нове завдання",
}: {
  locale: Locale;
  projects: Option[];
  users: Option[];
  materials: Option[];
  containers: Option[];
  workers: Option[];
  defaultProjectId?: string;
  label?: string;
}) {
  return (
    <Disclosure label={label}>
      <form action={createTaskAction} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <L label="Назва *"><input name="title" required className={inputCls} /></L>
        </div>
        <div className="sm:col-span-2">
          <L label="Опис"><textarea name="description" rows={2} className={inputCls} /></L>
        </div>
        <L label="Пов'язано з">
          <select name="relatedType" className={inputCls} defaultValue="PROJECT">
            {TASK_RELATED_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </L>
        <L label="Пріоритет">
          <select name="priority" className={inputCls} defaultValue="MEDIUM">
            {TASK_PRIORITIES.map((p) => <option key={p} value={p}>{TASK_PRIORITY_LABELS[p][locale]}</option>)}
          </select>
        </L>
        {defaultProjectId ? (
          <input type="hidden" name="projectId" value={defaultProjectId} />
        ) : (
          <L label="Проєкт">
            <select name="projectId" className={inputCls} defaultValue="">
              <option value="">—</option>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </L>
        )}
        <L label="Відповідальний">
          <select name="assigneeId" className={inputCls} defaultValue="">
            <option value="">—</option>
            {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        </L>
        <L label="Термін виконання"><input name="dueDate" type="date" className={inputCls} /></L>
        <L label="Матеріал (необов'язково)">
          <select name="materialId" className={inputCls} defaultValue="">
            <option value="">—</option>
            {materials.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </L>
        <L label="Контейнер (необов'язково)">
          <select name="containerId" className={inputCls} defaultValue="">
            <option value="">—</option>
            {containers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </L>
        <L label="Працівник/субпідрядник (необов'язково)">
          <select name="workerId" className={inputCls} defaultValue="">
            <option value="">—</option>
            {workers.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
        </L>
        <div className="sm:col-span-2">
          <L label="Чек-лист (кожен пункт з нового рядка)"><textarea name="checklist" rows={3} className={inputCls} /></L>
        </div>
        <div className="sm:col-span-2">
          <button type="submit" className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600">Створити завдання</button>
        </div>
      </form>
    </Disclosure>
  );
}

function L({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-gray-500">{label}</span>
      {children}
    </label>
  );
}
