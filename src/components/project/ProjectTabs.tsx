import Link from "next/link";

export type ProjectTab = { key: string; label: string; hidden?: boolean };

export default function ProjectTabs({ projectId, tabs, active }: { projectId: string; tabs: ProjectTab[]; active: string }) {
  return (
    <div className="overflow-x-auto border-b border-gray-200 dark:border-gray-800">
      <div className="flex min-w-max gap-1">
        {tabs.filter((t) => !t.hidden).map((tab) => (
          <Link
            key={tab.key}
            href={`/projects/${projectId}?tab=${tab.key}`}
            className={`whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition ${
              active === tab.key
                ? "border-orange-500 text-orange-600 dark:text-orange-400"
                : "border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
