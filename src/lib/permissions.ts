import type { Role } from "./constants";
import { FINANCE_ROLES } from "./constants";

export function canViewFinance(role: Role): boolean {
  return FINANCE_ROLES.includes(role);
}

export function canManageProjects(role: Role): boolean {
  return role === "OWNER_ADMIN" || role === "PROJECT_MANAGER" || role === "OFFICE_MANAGER" || role === "SALES";
}

export function canEditProject(role: Role): boolean {
  return role === "OWNER_ADMIN" || role === "PROJECT_MANAGER";
}

export function canManageMaterialsContainers(role: Role): boolean {
  return role === "OWNER_ADMIN" || role === "PROJECT_MANAGER" || role === "OFFICE_MANAGER";
}

export function canManageInvoicesExpenses(role: Role): boolean {
  return role === "OWNER_ADMIN" || role === "ACCOUNTANT" || role === "OFFICE_MANAGER";
}

export function canManageUsers(role: Role): boolean {
  return role === "OWNER_ADMIN";
}

export function canConfirmExtraWorkManually(role: Role): boolean {
  return role === "OWNER_ADMIN" || role === "PROJECT_MANAGER";
}

export function canLogHours(role: Role): boolean {
  return role === "OWNER_ADMIN" || role === "PROJECT_MANAGER" || role === "WORKER" || role === "SUBCONTRACTOR";
}

export function isRestrictedToOwnProjects(role: Role): boolean {
  return role === "WORKER" || role === "SUBCONTRACTOR" || role === "CLIENT";
}

export const NAV_ITEMS: { href: string; key: string; roles: Role[] | "all" }[] = [
  { href: "/dashboard", key: "nav.dashboard", roles: "all" },
  { href: "/projects", key: "nav.projects", roles: "all" },
  { href: "/planning", key: "nav.planning", roles: ["OWNER_ADMIN", "PROJECT_MANAGER", "OFFICE_MANAGER", "WORKER", "SUBCONTRACTOR"] },
  { href: "/workers", key: "nav.workers", roles: ["OWNER_ADMIN", "PROJECT_MANAGER", "OFFICE_MANAGER"] },
  { href: "/materials", key: "nav.materials", roles: ["OWNER_ADMIN", "PROJECT_MANAGER", "OFFICE_MANAGER"] },
  { href: "/containers", key: "nav.containers", roles: ["OWNER_ADMIN", "PROJECT_MANAGER", "OFFICE_MANAGER"] },
  { href: "/tasks", key: "nav.tasks", roles: "all" },
  { href: "/extra-works", key: "nav.extraWorks", roles: ["OWNER_ADMIN", "PROJECT_MANAGER", "OFFICE_MANAGER", "SALES", "CLIENT"] },
  { href: "/finance", key: "nav.finance", roles: ["OWNER_ADMIN", "ACCOUNTANT", "OFFICE_MANAGER", "SALES"] },
  { href: "/reports", key: "nav.reports", roles: ["OWNER_ADMIN", "PROJECT_MANAGER", "OFFICE_MANAGER", "ACCOUNTANT"] },
  { href: "/settings/users", key: "nav.users", roles: ["OWNER_ADMIN"] },
];

export function navFor(role: Role) {
  return NAV_ITEMS.filter((item) => item.roles === "all" || item.roles.includes(role));
}
