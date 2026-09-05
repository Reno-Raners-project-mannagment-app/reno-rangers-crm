import { prisma } from "@/lib/db";
import ProjectForm from "@/components/ProjectForm";

export default async function NewProjectPage() {
  const [pms, consultants] = await Promise.all([
    prisma.user.findMany({ where: { role: "PROJECT_MANAGER" } }),
    prisma.user.findMany({ where: { role: "SALES" } }),
  ]);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-50">Новий проєкт</h1>
      <ProjectForm pms={pms} consultants={consultants} />
    </div>
  );
}
