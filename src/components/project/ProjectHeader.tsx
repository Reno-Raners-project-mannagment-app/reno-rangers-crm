import Link from "next/link";
import { MapPin, Phone, Mail, User } from "lucide-react";
import { Badge } from "@/components/Badge";
import { formatDate, formatEUR } from "@/lib/format";
import { PROJECT_STATUS_LABELS, PROJECT_STATUS_COLOR, type Locale, type ProjectStatus } from "@/lib/constants";
import type { Client, Project, User as PrismaUser } from "@prisma/client";

type FullProject = Project & { client: Client; pm: PrismaUser | null; consultant: PrismaUser | null };

export default function ProjectHeader({ project, locale, showFinance }: { project: FullProject; locale: Locale; showFinance: boolean }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="font-mono text-xs text-gray-400">{project.number}</span>
            <Badge label={PROJECT_STATUS_LABELS[project.status as ProjectStatus][locale]} color={PROJECT_STATUS_COLOR[project.status as ProjectStatus]} />
          </div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-50">{project.name}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{project.workType}</p>
        </div>
        {showFinance && (
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">{formatEUR(project.contractAmount)}</p>
            <p className="text-xs text-gray-400">ПДВ {project.vatRate}% · Гарантія {project.warrantyMonths} міс.</p>
          </div>
        )}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 border-t border-gray-100 pt-4 text-sm dark:border-gray-800 sm:grid-cols-2 lg:grid-cols-4">
        <InfoItem icon={<User size={14} />} label="Клієнт" value={project.client.name} />
        <InfoItem icon={<Phone size={14} />} label="Телефон" value={project.client.phone ?? "—"} />
        <InfoItem icon={<Mail size={14} />} label="Email" value={project.client.email ?? "—"} />
        <InfoItem
          icon={<MapPin size={14} />}
          label="Адреса"
          value={
            project.googleMapsUrl ? (
              <a href={project.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline dark:text-orange-400">
                {project.address}
              </a>
            ) : (
              project.address
            )
          }
        />
        <InfoItem icon={<User size={14} />} label="Project Manager" value={project.pm?.name ?? "—"} />
        <InfoItem icon={<User size={14} />} label="Консультант" value={project.consultant?.name ?? "—"} />
        <InfoItem label="Дата оферти" value={formatDate(project.offerDate)} />
        <InfoItem label="Плановий старт → завершення" value={`${formatDate(project.plannedStartDate)} → ${formatDate(project.plannedEndDate)}`} />
      </div>
    </div>
  );
}

function InfoItem({ icon, label, value }: { icon?: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="flex items-center gap-1 text-xs text-gray-400">
        {icon}
        {label}
      </p>
      <p className="mt-0.5 truncate text-gray-800 dark:text-gray-200">{value}</p>
    </div>
  );
}
