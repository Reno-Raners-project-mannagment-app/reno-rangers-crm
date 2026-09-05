// Canonical value lists + labels/colors for every status enum used across the app.
// Mirrors the documented value sets in prisma/schema.prisma.

export type Locale = "UK" | "NL" | "EN";
export const LOCALES: Locale[] = ["UK", "NL", "EN"];

export type Role =
  | "OWNER_ADMIN"
  | "PROJECT_MANAGER"
  | "OFFICE_MANAGER"
  | "SALES"
  | "ACCOUNTANT"
  | "WORKER"
  | "SUBCONTRACTOR"
  | "CLIENT";

export const ROLES: Role[] = [
  "OWNER_ADMIN",
  "PROJECT_MANAGER",
  "OFFICE_MANAGER",
  "SALES",
  "ACCOUNTANT",
  "WORKER",
  "SUBCONTRACTOR",
  "CLIENT",
];

export const ROLE_LABELS: Record<Role, Record<Locale, string>> = {
  OWNER_ADMIN: { UK: "Власник/Адмін", NL: "Eigenaar/Beheerder", EN: "Owner/Admin" },
  PROJECT_MANAGER: { UK: "Менеджер проєкту", NL: "Projectmanager", EN: "Project Manager" },
  OFFICE_MANAGER: { UK: "Офіс-менеджер", NL: "Officemanager", EN: "Office Manager" },
  SALES: { UK: "Продажі", NL: "Verkoop", EN: "Sales" },
  ACCOUNTANT: { UK: "Бухгалтер", NL: "Boekhouder", EN: "Accountant" },
  WORKER: { UK: "Працівник", NL: "Werknemer", EN: "Worker" },
  SUBCONTRACTOR: { UK: "Субпідрядник", NL: "Onderaannemer", EN: "Subcontractor" },
  CLIENT: { UK: "Клієнт", NL: "Klant", EN: "Client" },
};

// Roles that are allowed to see financial data (contract amounts, expenses,
// invoices, profit). Workers and Subcontractors never see this.
export const FINANCE_ROLES: Role[] = ["OWNER_ADMIN", "PROJECT_MANAGER", "OFFICE_MANAGER", "SALES", "ACCOUNTANT"];

export type StatusColor = "green" | "yellow" | "red" | "gray" | "blue";

export const STATUS_COLOR_CLASSES: Record<StatusColor, string> = {
  green: "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800",
  yellow: "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
  red: "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800",
  gray: "bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
  blue: "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
};

export const STATUS_DOT_CLASSES: Record<StatusColor, string> = {
  green: "bg-emerald-500",
  yellow: "bg-amber-500",
  red: "bg-rose-500",
  gray: "bg-gray-400",
  blue: "bg-blue-500",
};

// ---------------- Project status ----------------
export type ProjectStatus =
  | "NEW"
  | "AWAITING_DEPOSIT"
  | "READY_FOR_PREP"
  | "IN_PREP"
  | "AWAITING_MATERIALS"
  | "READY_TO_SCHEDULE"
  | "SCHEDULED"
  | "IN_PROGRESS"
  | "ON_HOLD"
  | "AWAITING_INSPECTION"
  | "AWAITING_FIXES"
  | "AWAITING_FINAL_PAYMENT"
  | "COMPLETED"
  | "ARCHIVED";

export const PROJECT_STATUSES: ProjectStatus[] = [
  "NEW",
  "AWAITING_DEPOSIT",
  "READY_FOR_PREP",
  "IN_PREP",
  "AWAITING_MATERIALS",
  "READY_TO_SCHEDULE",
  "SCHEDULED",
  "IN_PROGRESS",
  "ON_HOLD",
  "AWAITING_INSPECTION",
  "AWAITING_FIXES",
  "AWAITING_FINAL_PAYMENT",
  "COMPLETED",
  "ARCHIVED",
];

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, Record<Locale, string>> = {
  NEW: { UK: "Новий проєкт", NL: "Nieuw project", EN: "New project" },
  AWAITING_DEPOSIT: { UK: "Очікує авансового платежу", NL: "Wacht op voorschot", EN: "Awaiting deposit" },
  READY_FOR_PREP: { UK: "Готовий до підготовки", NL: "Klaar voor voorbereiding", EN: "Ready for preparation" },
  IN_PREP: { UK: "У підготовці", NL: "In voorbereiding", EN: "In preparation" },
  AWAITING_MATERIALS: { UK: "Очікує матеріалів", NL: "Wacht op materialen", EN: "Awaiting materials" },
  READY_TO_SCHEDULE: { UK: "Готовий до планування", NL: "Klaar om te plannen", EN: "Ready to schedule" },
  SCHEDULED: { UK: "Запланований", NL: "Ingepland", EN: "Scheduled" },
  IN_PROGRESS: { UK: "Роботи виконуються", NL: "Werk in uitvoering", EN: "Work in progress" },
  ON_HOLD: { UK: "Тимчасово заблокований", NL: "Tijdelijk geblokkeerd", EN: "On hold" },
  AWAITING_INSPECTION: { UK: "Очікує перевірки", NL: "Wacht op inspectie", EN: "Awaiting inspection" },
  AWAITING_FIXES: { UK: "Очікує виправлень", NL: "Wacht op correcties", EN: "Awaiting fixes" },
  AWAITING_FINAL_PAYMENT: { UK: "Очікує остаточного платежу", NL: "Wacht op eindbetaling", EN: "Awaiting final payment" },
  COMPLETED: { UK: "Завершений", NL: "Afgerond", EN: "Completed" },
  ARCHIVED: { UK: "Архівований", NL: "Gearchiveerd", EN: "Archived" },
};

export const PROJECT_STATUS_COLOR: Record<ProjectStatus, StatusColor> = {
  NEW: "gray",
  AWAITING_DEPOSIT: "yellow",
  READY_FOR_PREP: "yellow",
  IN_PREP: "blue",
  AWAITING_MATERIALS: "yellow",
  READY_TO_SCHEDULE: "yellow",
  SCHEDULED: "blue",
  IN_PROGRESS: "blue",
  ON_HOLD: "red",
  AWAITING_INSPECTION: "yellow",
  AWAITING_FIXES: "red",
  AWAITING_FINAL_PAYMENT: "yellow",
  COMPLETED: "green",
  ARCHIVED: "gray",
};

// Ordered "happy path" flow used for the status stepper (skips ON_HOLD/AWAITING_FIXES
// which are exceptional side-branches).
export const PROJECT_STATUS_FLOW: ProjectStatus[] = [
  "NEW",
  "AWAITING_DEPOSIT",
  "READY_FOR_PREP",
  "IN_PREP",
  "AWAITING_MATERIALS",
  "READY_TO_SCHEDULE",
  "SCHEDULED",
  "IN_PROGRESS",
  "AWAITING_INSPECTION",
  "AWAITING_FINAL_PAYMENT",
  "COMPLETED",
];

// ---------------- Stage status ----------------
export type StageStatus =
  | "NOT_SCHEDULED"
  | "SCHEDULED"
  | "READY_TO_START"
  | "IN_PROGRESS"
  | "PAUSED"
  | "AWAITING_MATERIALS"
  | "AWAITING_CLIENT"
  | "DONE"
  | "INSPECTED"
  | "NEEDS_FIX";

export const STAGE_STATUSES: StageStatus[] = [
  "NOT_SCHEDULED",
  "SCHEDULED",
  "READY_TO_START",
  "IN_PROGRESS",
  "PAUSED",
  "AWAITING_MATERIALS",
  "AWAITING_CLIENT",
  "DONE",
  "INSPECTED",
  "NEEDS_FIX",
];

export const STAGE_STATUS_LABELS: Record<StageStatus, Record<Locale, string>> = {
  NOT_SCHEDULED: { UK: "Не заплановано", NL: "Niet gepland", EN: "Not scheduled" },
  SCHEDULED: { UK: "Заплановано", NL: "Gepland", EN: "Scheduled" },
  READY_TO_START: { UK: "Готово до початку", NL: "Klaar om te starten", EN: "Ready to start" },
  IN_PROGRESS: { UK: "Виконується", NL: "In uitvoering", EN: "In progress" },
  PAUSED: { UK: "Призупинено", NL: "Gepauzeerd", EN: "Paused" },
  AWAITING_MATERIALS: { UK: "Очікує матеріалів", NL: "Wacht op materialen", EN: "Awaiting materials" },
  AWAITING_CLIENT: { UK: "Очікує клієнта", NL: "Wacht op klant", EN: "Awaiting client" },
  DONE: { UK: "Виконано", NL: "Voltooid", EN: "Done" },
  INSPECTED: { UK: "Перевірено", NL: "Geïnspecteerd", EN: "Inspected" },
  NEEDS_FIX: { UK: "Потребує виправлення", NL: "Correctie nodig", EN: "Needs fix" },
};

export const STAGE_STATUS_COLOR: Record<StageStatus, StatusColor> = {
  NOT_SCHEDULED: "gray",
  SCHEDULED: "yellow",
  READY_TO_START: "yellow",
  IN_PROGRESS: "blue",
  PAUSED: "red",
  AWAITING_MATERIALS: "yellow",
  AWAITING_CLIENT: "yellow",
  DONE: "green",
  INSPECTED: "green",
  NEEDS_FIX: "red",
};

export const WORK_STAGE_TEMPLATES = [
  "Демонтаж",
  "Підготовчі роботи",
  "Замовлення контейнера",
  "Доставка матеріалів",
  "Сантехніка",
  "Електрика",
  "Штукатурка",
  "Gyproc",
  "Плитка",
  "Фарбування",
  "Монтаж сантехніки",
  "Фасадна ізоляція",
  "Покрівельні роботи",
  "Фінальне прибирання",
  "Перевірка",
  "Здача проєкту клієнту",
];

// ---------------- Material status ----------------
export type MaterialStatus =
  | "TO_BE_DEFINED"
  | "TO_ORDER"
  | "AWAITING_CONFIRMATION"
  | "ORDERED"
  | "PARTIALLY_DELIVERED"
  | "DELIVERED"
  | "DELAYED"
  | "OUT_OF_STOCK"
  | "RETURNED"
  | "CANCELLED";

export const MATERIAL_STATUSES: MaterialStatus[] = [
  "TO_BE_DEFINED",
  "TO_ORDER",
  "AWAITING_CONFIRMATION",
  "ORDERED",
  "PARTIALLY_DELIVERED",
  "DELIVERED",
  "DELAYED",
  "OUT_OF_STOCK",
  "RETURNED",
  "CANCELLED",
];

export const MATERIAL_STATUS_LABELS: Record<MaterialStatus, Record<Locale, string>> = {
  TO_BE_DEFINED: { UK: "Потрібно визначити", NL: "Nog te bepalen", EN: "To be defined" },
  TO_ORDER: { UK: "Потрібно замовити", NL: "Te bestellen", EN: "To order" },
  AWAITING_CONFIRMATION: { UK: "Очікує підтвердження", NL: "Wacht op bevestiging", EN: "Awaiting confirmation" },
  ORDERED: { UK: "Замовлено", NL: "Besteld", EN: "Ordered" },
  PARTIALLY_DELIVERED: { UK: "Частково доставлено", NL: "Deels geleverd", EN: "Partially delivered" },
  DELIVERED: { UK: "Доставлено", NL: "Geleverd", EN: "Delivered" },
  DELAYED: { UK: "Затримується", NL: "Vertraagd", EN: "Delayed" },
  OUT_OF_STOCK: { UK: "Відсутнє у постачальника", NL: "Niet op voorraad", EN: "Out of stock" },
  RETURNED: { UK: "Повернуто", NL: "Geretourneerd", EN: "Returned" },
  CANCELLED: { UK: "Скасовано", NL: "Geannuleerd", EN: "Cancelled" },
};

export const MATERIAL_STATUS_COLOR: Record<MaterialStatus, StatusColor> = {
  TO_BE_DEFINED: "gray",
  TO_ORDER: "red",
  AWAITING_CONFIRMATION: "yellow",
  ORDERED: "blue",
  PARTIALLY_DELIVERED: "yellow",
  DELIVERED: "green",
  DELAYED: "red",
  OUT_OF_STOCK: "red",
  RETURNED: "gray",
  CANCELLED: "gray",
};

// ---------------- Container status ----------------
export type ContainerStatus =
  | "TO_ORDER"
  | "REQUEST_SENT"
  | "ORDERED"
  | "DELIVERY_CONFIRMED"
  | "DELIVERED"
  | "FULL"
  | "NEEDS_PICKUP"
  | "PICKUP_SCHEDULED"
  | "PICKED_UP"
  | "CANCELLED";

export const CONTAINER_STATUSES: ContainerStatus[] = [
  "TO_ORDER",
  "REQUEST_SENT",
  "ORDERED",
  "DELIVERY_CONFIRMED",
  "DELIVERED",
  "FULL",
  "NEEDS_PICKUP",
  "PICKUP_SCHEDULED",
  "PICKED_UP",
  "CANCELLED",
];

export const CONTAINER_STATUS_LABELS: Record<ContainerStatus, Record<Locale, string>> = {
  TO_ORDER: { UK: "Потрібно замовити", NL: "Te bestellen", EN: "To order" },
  REQUEST_SENT: { UK: "Запит надіслано", NL: "Aanvraag verzonden", EN: "Request sent" },
  ORDERED: { UK: "Замовлено", NL: "Besteld", EN: "Ordered" },
  DELIVERY_CONFIRMED: { UK: "Доставка підтверджена", NL: "Levering bevestigd", EN: "Delivery confirmed" },
  DELIVERED: { UK: "Доставлено", NL: "Geleverd", EN: "Delivered" },
  FULL: { UK: "Заповнено", NL: "Vol", EN: "Full" },
  NEEDS_PICKUP: { UK: "Потрібно забрати", NL: "Ophalen nodig", EN: "Needs pickup" },
  PICKUP_SCHEDULED: { UK: "Забір запланований", NL: "Ophalen gepland", EN: "Pickup scheduled" },
  PICKED_UP: { UK: "Забрано", NL: "Opgehaald", EN: "Picked up" },
  CANCELLED: { UK: "Скасовано", NL: "Geannuleerd", EN: "Cancelled" },
};

export const CONTAINER_STATUS_COLOR: Record<ContainerStatus, StatusColor> = {
  TO_ORDER: "red",
  REQUEST_SENT: "yellow",
  ORDERED: "blue",
  DELIVERY_CONFIRMED: "blue",
  DELIVERED: "green",
  FULL: "yellow",
  NEEDS_PICKUP: "red",
  PICKUP_SCHEDULED: "yellow",
  PICKED_UP: "green",
  CANCELLED: "gray",
};

// ---------------- Task ----------------
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export const TASK_PRIORITIES: TaskPriority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];
export const TASK_PRIORITY_LABELS: Record<TaskPriority, Record<Locale, string>> = {
  LOW: { UK: "Низький", NL: "Laag", EN: "Low" },
  MEDIUM: { UK: "Середній", NL: "Gemiddeld", EN: "Medium" },
  HIGH: { UK: "Високий", NL: "Hoog", EN: "High" },
  URGENT: { UK: "Терміново", NL: "Urgent", EN: "Urgent" },
};
export const TASK_PRIORITY_COLOR: Record<TaskPriority, StatusColor> = {
  LOW: "gray",
  MEDIUM: "blue",
  HIGH: "yellow",
  URGENT: "red",
};

export type TaskStatus = "OPEN" | "IN_PROGRESS" | "DONE" | "OVERDUE" | "CANCELLED";
export const TASK_STATUSES: TaskStatus[] = ["OPEN", "IN_PROGRESS", "DONE", "OVERDUE", "CANCELLED"];
export const TASK_STATUS_LABELS: Record<TaskStatus, Record<Locale, string>> = {
  OPEN: { UK: "Відкрито", NL: "Open", EN: "Open" },
  IN_PROGRESS: { UK: "У роботі", NL: "In uitvoering", EN: "In progress" },
  DONE: { UK: "Виконано", NL: "Voltooid", EN: "Done" },
  OVERDUE: { UK: "Прострочено", NL: "Te laat", EN: "Overdue" },
  CANCELLED: { UK: "Скасовано", NL: "Geannuleerd", EN: "Cancelled" },
};
export const TASK_STATUS_COLOR: Record<TaskStatus, StatusColor> = {
  OPEN: "gray",
  IN_PROGRESS: "blue",
  DONE: "green",
  OVERDUE: "red",
  CANCELLED: "gray",
};

export type TaskRelatedType =
  | "PROJECT"
  | "CLIENT"
  | "SUPPLIER"
  | "MATERIAL"
  | "CONTAINER"
  | "WORKER"
  | "SUBCONTRACTOR"
  | "PAYMENT"
  | "ISSUE";
export const TASK_RELATED_TYPES: TaskRelatedType[] = [
  "PROJECT",
  "CLIENT",
  "SUPPLIER",
  "MATERIAL",
  "CONTAINER",
  "WORKER",
  "SUBCONTRACTOR",
  "PAYMENT",
  "ISSUE",
];

// ---------------- Finance ----------------
export type ExpenseCategory =
  | "MATERIAL"
  | "LABOR"
  | "SUBCONTRACTOR"
  | "CONTAINER"
  | "EQUIPMENT_RENTAL"
  | "TRANSPORT"
  | "OTHER";
export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  "MATERIAL",
  "LABOR",
  "SUBCONTRACTOR",
  "CONTAINER",
  "EQUIPMENT_RENTAL",
  "TRANSPORT",
  "OTHER",
];
export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, Record<Locale, string>> = {
  MATERIAL: { UK: "Матеріали", NL: "Materialen", EN: "Materials" },
  LABOR: { UK: "Працівники", NL: "Arbeid", EN: "Labor" },
  SUBCONTRACTOR: { UK: "Субпідрядники", NL: "Onderaannemers", EN: "Subcontractors" },
  CONTAINER: { UK: "Контейнери", NL: "Containers", EN: "Containers" },
  EQUIPMENT_RENTAL: { UK: "Оренда обладнання", NL: "Verhuur materieel", EN: "Equipment rental" },
  TRANSPORT: { UK: "Транспорт", NL: "Transport", EN: "Transport" },
  OTHER: { UK: "Інше", NL: "Overig", EN: "Other" },
};

export type ExpenseStatus = "PENDING" | "CONFIRMED" | "INVOICED" | "PAID" | "UNPAID";
export const EXPENSE_STATUSES: ExpenseStatus[] = ["PENDING", "CONFIRMED", "INVOICED", "PAID", "UNPAID"];
export const EXPENSE_STATUS_LABELS: Record<ExpenseStatus, Record<Locale, string>> = {
  PENDING: { UK: "Очікується", NL: "In afwachting", EN: "Pending" },
  CONFIRMED: { UK: "Підтверджено", NL: "Bevestigd", EN: "Confirmed" },
  INVOICED: { UK: "Фактуру отримано", NL: "Factuur ontvangen", EN: "Invoiced" },
  PAID: { UK: "Оплачено", NL: "Betaald", EN: "Paid" },
  UNPAID: { UK: "Не оплачено", NL: "Onbetaald", EN: "Unpaid" },
};
export const EXPENSE_STATUS_COLOR: Record<ExpenseStatus, StatusColor> = {
  PENDING: "gray",
  CONFIRMED: "blue",
  INVOICED: "yellow",
  PAID: "green",
  UNPAID: "red",
};

export type InvoiceStatus = "DRAFT" | "SENT" | "PAID" | "OVERDUE" | "CANCELLED";
export const INVOICE_STATUSES: InvoiceStatus[] = ["DRAFT", "SENT", "PAID", "OVERDUE", "CANCELLED"];
export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, Record<Locale, string>> = {
  DRAFT: { UK: "Чернетка", NL: "Concept", EN: "Draft" },
  SENT: { UK: "Надіслано", NL: "Verzonden", EN: "Sent" },
  PAID: { UK: "Оплачено", NL: "Betaald", EN: "Paid" },
  OVERDUE: { UK: "Прострочено", NL: "Te laat", EN: "Overdue" },
  CANCELLED: { UK: "Скасовано", NL: "Geannuleerd", EN: "Cancelled" },
};
export const INVOICE_STATUS_COLOR: Record<InvoiceStatus, StatusColor> = {
  DRAFT: "gray",
  SENT: "yellow",
  PAID: "green",
  OVERDUE: "red",
  CANCELLED: "gray",
};

export type InvoiceType = "DEPOSIT" | "INTERIM" | "EXTRA_WORK" | "FINAL";
export const INVOICE_TYPES: InvoiceType[] = ["DEPOSIT", "INTERIM", "EXTRA_WORK", "FINAL"];
export const INVOICE_TYPE_LABELS: Record<InvoiceType, Record<Locale, string>> = {
  DEPOSIT: { UK: "Аванс", NL: "Voorschot", EN: "Deposit" },
  INTERIM: { UK: "Проміжна", NL: "Tussentijds", EN: "Interim" },
  EXTRA_WORK: { UK: "Додаткові роботи", NL: "Meerwerk", EN: "Extra work" },
  FINAL: { UK: "Фінальна", NL: "Eindfactuur", EN: "Final" },
};

// ---------------- Extra works ----------------
export type ExtraWorkExecutionStatus = "AWAITING_CLIENT_CONFIRMATION" | "APPROVED_MANUALLY" | "IN_PROGRESS" | "DONE" | "REJECTED";
export const EXTRA_WORK_EXECUTION_STATUSES: ExtraWorkExecutionStatus[] = [
  "AWAITING_CLIENT_CONFIRMATION",
  "APPROVED_MANUALLY",
  "IN_PROGRESS",
  "DONE",
  "REJECTED",
];
export const EXTRA_WORK_EXECUTION_LABELS: Record<ExtraWorkExecutionStatus, Record<Locale, string>> = {
  AWAITING_CLIENT_CONFIRMATION: { UK: "Очікує підтвердження клієнта", NL: "Wacht op bevestiging klant", EN: "Awaiting client confirmation" },
  APPROVED_MANUALLY: { UK: "Дозволено вручну", NL: "Handmatig goedgekeurd", EN: "Approved manually" },
  IN_PROGRESS: { UK: "Виконується", NL: "In uitvoering", EN: "In progress" },
  DONE: { UK: "Виконано", NL: "Voltooid", EN: "Done" },
  REJECTED: { UK: "Відхилено", NL: "Afgewezen", EN: "Rejected" },
};
export const EXTRA_WORK_EXECUTION_COLOR: Record<ExtraWorkExecutionStatus, StatusColor> = {
  AWAITING_CLIENT_CONFIRMATION: "yellow",
  APPROVED_MANUALLY: "blue",
  IN_PROGRESS: "blue",
  DONE: "green",
  REJECTED: "red",
};

export type ExtraWorkPaymentStatus = "NOT_INVOICED" | "INVOICED" | "PAID";
export const EXTRA_WORK_PAYMENT_STATUSES: ExtraWorkPaymentStatus[] = ["NOT_INVOICED", "INVOICED", "PAID"];
export const EXTRA_WORK_PAYMENT_LABELS: Record<ExtraWorkPaymentStatus, Record<Locale, string>> = {
  NOT_INVOICED: { UK: "Не виставлено", NL: "Niet gefactureerd", EN: "Not invoiced" },
  INVOICED: { UK: "Виставлено", NL: "Gefactureerd", EN: "Invoiced" },
  PAID: { UK: "Оплачено", NL: "Betaald", EN: "Paid" },
};
export const EXTRA_WORK_PAYMENT_COLOR: Record<ExtraWorkPaymentStatus, StatusColor> = {
  NOT_INVOICED: "gray",
  INVOICED: "yellow",
  PAID: "green",
};

export type ConfirmationMethod = "EMAIL" | "WHATSAPP" | "SIGNATURE" | "VERBAL" | "MANUAL_OVERRIDE";
export const CONFIRMATION_METHODS: ConfirmationMethod[] = ["EMAIL", "WHATSAPP", "SIGNATURE", "VERBAL", "MANUAL_OVERRIDE"];
export const CONFIRMATION_METHOD_LABELS: Record<ConfirmationMethod, Record<Locale, string>> = {
  EMAIL: { UK: "Email", NL: "E-mail", EN: "Email" },
  WHATSAPP: { UK: "WhatsApp", NL: "WhatsApp", EN: "WhatsApp" },
  SIGNATURE: { UK: "Підпис", NL: "Handtekening", EN: "Signature" },
  VERBAL: { UK: "Усно", NL: "Mondeling", EN: "Verbal" },
  MANUAL_OVERRIDE: { UK: "Дозвіл керівника", NL: "Manager override", EN: "Manager override" },
};

// ---------------- Issues ----------------
export type IssuePriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export const ISSUE_PRIORITIES: IssuePriority[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
export const ISSUE_PRIORITY_LABELS: Record<IssuePriority, Record<Locale, string>> = {
  LOW: { UK: "Низький", NL: "Laag", EN: "Low" },
  MEDIUM: { UK: "Середній", NL: "Gemiddeld", EN: "Medium" },
  HIGH: { UK: "Високий", NL: "Hoog", EN: "High" },
  CRITICAL: { UK: "Критичний", NL: "Kritiek", EN: "Critical" },
};
export const ISSUE_PRIORITY_COLOR: Record<IssuePriority, StatusColor> = {
  LOW: "gray",
  MEDIUM: "blue",
  HIGH: "yellow",
  CRITICAL: "red",
};

export type IssueStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "VERIFIED";
export const ISSUE_STATUSES: IssueStatus[] = ["OPEN", "IN_PROGRESS", "RESOLVED", "VERIFIED"];
export const ISSUE_STATUS_LABELS: Record<IssueStatus, Record<Locale, string>> = {
  OPEN: { UK: "Відкрито", NL: "Open", EN: "Open" },
  IN_PROGRESS: { UK: "У роботі", NL: "In behandeling", EN: "In progress" },
  RESOLVED: { UK: "Вирішено", NL: "Opgelost", EN: "Resolved" },
  VERIFIED: { UK: "Перевірено", NL: "Geverifieerd", EN: "Verified" },
};
export const ISSUE_STATUS_COLOR: Record<IssueStatus, StatusColor> = {
  OPEN: "red",
  IN_PROGRESS: "blue",
  RESOLVED: "green",
  VERIFIED: "green",
};

// ---------------- Documents ----------------
export type DocumentCategory =
  | "OFFER"
  | "PLAN"
  | "DRAWING"
  | "TECHNICAL"
  | "MATERIAL_ORDER"
  | "INVOICE"
  | "PERMIT"
  | "PHOTO_BEFORE"
  | "PHOTO_PROGRESS"
  | "PHOTO_AFTER"
  | "EXTRA_WORK_ACT"
  | "HANDOVER_PROTOCOL"
  | "WARRANTY"
  | "OTHER";

export const DOCUMENT_CATEGORIES: DocumentCategory[] = [
  "OFFER",
  "PLAN",
  "DRAWING",
  "TECHNICAL",
  "MATERIAL_ORDER",
  "INVOICE",
  "PERMIT",
  "PHOTO_BEFORE",
  "PHOTO_PROGRESS",
  "PHOTO_AFTER",
  "EXTRA_WORK_ACT",
  "HANDOVER_PROTOCOL",
  "WARRANTY",
  "OTHER",
];

export const DOCUMENT_CATEGORY_LABELS: Record<DocumentCategory, Record<Locale, string>> = {
  OFFER: { UK: "Оферта", NL: "Offerte", EN: "Offer" },
  PLAN: { UK: "Плани", NL: "Plannen", EN: "Plans" },
  DRAWING: { UK: "Креслення", NL: "Tekeningen", EN: "Drawings" },
  TECHNICAL: { UK: "Технічні документи", NL: "Technische documenten", EN: "Technical docs" },
  MATERIAL_ORDER: { UK: "Замовлення матеріалів", NL: "Materiaalbestellingen", EN: "Material orders" },
  INVOICE: { UK: "Фактури", NL: "Facturen", EN: "Invoices" },
  PERMIT: { UK: "Дозволи", NL: "Vergunningen", EN: "Permits" },
  PHOTO_BEFORE: { UK: "Фото до початку", NL: "Foto's vooraf", EN: "Before photos" },
  PHOTO_PROGRESS: { UK: "Фото процесу", NL: "Voortgangsfoto's", EN: "Progress photos" },
  PHOTO_AFTER: { UK: "Фото завершених робіт", NL: "Foto's na afloop", EN: "After photos" },
  EXTRA_WORK_ACT: { UK: "Акти додаткових робіт", NL: "Meerwerkdocumenten", EN: "Extra work documents" },
  HANDOVER_PROTOCOL: { UK: "Протокол здачі", NL: "Opleveringsprotocol", EN: "Handover protocol" },
  WARRANTY: { UK: "Гарантійні документи", NL: "Garantiedocumenten", EN: "Warranty documents" },
  OTHER: { UK: "Інше", NL: "Overig", EN: "Other" },
};

// ---------------- Notifications ----------------
export type NotificationType =
  | "PROJECT_STARTS_TOMORROW"
  | "NO_TEAM_ASSIGNED"
  | "MATERIAL_NOT_ORDERED"
  | "MATERIAL_DELAYED"
  | "CONTAINER_NOT_ORDERED"
  | "PERMIT_MISSING"
  | "TASK_OVERDUE"
  | "HOURS_NOT_LOGGED"
  | "SITE_ISSUE"
  | "EXTRA_WORK_PENDING"
  | "BUDGET_OVER"
  | "INVOICE_UNPAID"
  | "DEADLINE_APPROACHING"
  | "PROJECT_DELAYED";

export const NOTIFICATION_LABELS: Record<NotificationType, Record<Locale, string>> = {
  PROJECT_STARTS_TOMORROW: { UK: "Завтра починається новий проєкт", NL: "Morgen start een nieuw project", EN: "A new project starts tomorrow" },
  NO_TEAM_ASSIGNED: { UK: "Не призначена команда", NL: "Geen team toegewezen", EN: "No team assigned" },
  MATERIAL_NOT_ORDERED: { UK: "Матеріали не замовлені", NL: "Materialen niet besteld", EN: "Materials not ordered" },
  MATERIAL_DELAYED: { UK: "Матеріали затримуються", NL: "Materialen vertraagd", EN: "Materials delayed" },
  CONTAINER_NOT_ORDERED: { UK: "Контейнер не замовлений", NL: "Container niet besteld", EN: "Container not ordered" },
  PERMIT_MISSING: { UK: "Немає необхідного дозволу", NL: "Vergunning ontbreekt", EN: "Permit missing" },
  TASK_OVERDUE: { UK: "Завдання прострочене", NL: "Taak te laat", EN: "Task overdue" },
  HOURS_NOT_LOGGED: { UK: "Працівник не заповнив години", NL: "Uren niet geregistreerd", EN: "Hours not logged" },
  SITE_ISSUE: { UK: "Виникла проблема на об'єкті", NL: "Probleem op de bouwplaats", EN: "Site issue reported" },
  EXTRA_WORK_PENDING: { UK: "Додаткові роботи очікують підтвердження", NL: "Meerwerk wacht op bevestiging", EN: "Extra work awaiting confirmation" },
  BUDGET_OVER: { UK: "Проєкт виходить за бюджет", NL: "Project overschrijdt budget", EN: "Project is over budget" },
  INVOICE_UNPAID: { UK: "Клієнт не оплатив фактуру", NL: "Klant heeft factuur niet betaald", EN: "Client invoice unpaid" },
  DEADLINE_APPROACHING: { UK: "Наближається запланована дата завершення", NL: "Einddatum nadert", EN: "Deadline approaching" },
  PROJECT_DELAYED: { UK: "Проєкт затримується", NL: "Project loopt vertraging op", EN: "Project is delayed" },
};

export const WORK_TYPES = [
  "Повний ремонт квартири",
  "Ремонт ванної кімнати",
  "Кухня під ключ",
  "Фасадні роботи",
  "Покрівля",
  "Прибудова",
  "Комерційний ремонт",
];
