import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function daysFromNow(n: number): Date {
  const d = new Date();
  d.setHours(9, 0, 0, 0);
  d.setDate(d.getDate() + n);
  return d;
}

function monthsFromNow(n: number): Date {
  const d = new Date();
  d.setHours(9, 0, 0, 0);
  d.setMonth(d.getMonth() + n);
  return d;
}

async function main() {
  console.log("Seeding Reno Rangers CRM demo data...");

  const passwordHash = await bcrypt.hash("demo1234", 10);

  // ---------------------------------------------------------------
  // USERS (one per role, plus a couple of extra staff/workers)
  // ---------------------------------------------------------------
  const admin = await prisma.user.create({
    data: { name: "Marieke de Vries", email: "admin@renorangers.nl", passwordHash, role: "OWNER_ADMIN", phone: "+31 6 1111 0001", locale: "NL" },
  });
  const pm1 = await prisma.user.create({
    data: { name: "Tom Janssen", email: "pm@renorangers.nl", passwordHash, role: "PROJECT_MANAGER", phone: "+31 6 1111 0002", locale: "NL" },
  });
  const pm2 = await prisma.user.create({
    data: { name: "Anna Kowalska", email: "pm2@renorangers.nl", passwordHash, role: "PROJECT_MANAGER", phone: "+31 6 1111 0003", locale: "UK" },
  });
  const office = await prisma.user.create({
    data: { name: "Els Peeters", email: "office@renorangers.nl", passwordHash, role: "OFFICE_MANAGER", phone: "+31 6 1111 0004", locale: "NL" },
  });
  const sales = await prisma.user.create({
    data: { name: "Bram van Dijk", email: "sales@renorangers.nl", passwordHash, role: "SALES", phone: "+31 6 1111 0005", locale: "NL" },
  });
  const accountant = await prisma.user.create({
    data: { name: "Sophie Bakker", email: "accountant@renorangers.nl", passwordHash, role: "ACCOUNTANT", phone: "+31 6 1111 0006", locale: "NL" },
  });
  const workerUser1 = await prisma.user.create({
    data: { name: "Ivan Kovalenko", email: "worker@renorangers.nl", passwordHash, role: "WORKER", phone: "+31 6 2222 0001", locale: "UK" },
  });
  const workerUser2 = await prisma.user.create({
    data: { name: "Petro Melnyk", email: "worker2@renorangers.nl", passwordHash, role: "WORKER", phone: "+31 6 2222 0002", locale: "UK" },
  });
  const subUser1 = await prisma.user.create({
    data: { name: "Piotr Nowak", email: "sub@renorangers.nl", passwordHash, role: "SUBCONTRACTOR", phone: "+31 6 3333 0001", locale: "EN" },
  });
  const clientUser = await prisma.user.create({
    data: { name: "Hans Willemsen", email: "client@renorangers.nl", passwordHash, role: "CLIENT", phone: "+31 6 4444 0001", locale: "NL" },
  });

  // ---------------------------------------------------------------
  // WORKERS / SUBCONTRACTORS DIRECTORY
  // ---------------------------------------------------------------
  const w1 = await prisma.worker.create({ data: { userId: workerUser1.id, name: "Ivan Kovalenko", type: "EMPLOYEE", profession: "Тесляр / Загальні роботи", phone: "+31 6 2222 0001", email: workerUser1.email, hourlyRate: 28, rating: 4.7, active: true } });
  const w2 = await prisma.worker.create({ data: { userId: workerUser2.id, name: "Petro Melnyk", type: "EMPLOYEE", profession: "Штукатур", phone: "+31 6 2222 0002", email: workerUser2.email, hourlyRate: 26, rating: 4.5, active: true } });
  const w3 = await prisma.worker.create({ data: { name: "Oleh Bondar", type: "EMPLOYEE", profession: "Електрик", phone: "+31 6 2222 0003", hourlyRate: 32, rating: 4.8, active: true } });
  const w4 = await prisma.worker.create({ data: { name: "Andriy Shevchenko", type: "EMPLOYEE", profession: "Плиточник", phone: "+31 6 2222 0004", hourlyRate: 27, rating: 4.6, active: true } });
  const w5 = await prisma.worker.create({ data: { userId: subUser1.id, name: "Piotr Nowak (Nowak Loodgieters)", type: "SUBCONTRACTOR", profession: "Сантехнік", phone: "+31 6 3333 0001", email: subUser1.email, projectRate: 450, rating: 4.9, active: true } });
  await prisma.worker.create({ data: { name: "Dachdekker Meyer BV", type: "SUBCONTRACTOR", profession: "Покрівельник", phone: "+31 6 3333 0002", projectRate: 1200, rating: 4.4, active: true } });
  const w7 = await prisma.worker.create({ data: { name: "Marek Kowalczyk", type: "EMPLOYEE", profession: "Маляр", phone: "+31 6 2222 0005", hourlyRate: 24, rating: 4.3, active: true } });

  // ---------------------------------------------------------------
  // SUPPLIERS
  // ---------------------------------------------------------------
  const supGamma = await prisma.supplier.create({ data: { name: "Gamma Bouwmarkt", category: "Будматеріали", contact: "Rick", phone: "+31 20 555 0101", email: "orders@gamma.nl" } });
  const supHornbach = await prisma.supplier.create({ data: { name: "Hornbach", category: "Будматеріали", contact: "Sanne", phone: "+31 20 555 0102", email: "sales@hornbach.nl" } });
  const supKeukens = await prisma.supplier.create({ data: { name: "Keukens van Holland", category: "Кухні", contact: "Wouter", phone: "+31 20 555 0103", email: "info@keukensvanholland.nl" } });
  const supTegels = await prisma.supplier.create({ data: { name: "Tegelhandel De Boer", category: "Плитка", contact: "Femke", phone: "+31 20 555 0104", email: "verkoop@tegeldeboer.nl" } });
  const supSanitair = await prisma.supplier.create({ data: { name: "Sanitair Direct", category: "Сантехніка", contact: "Kevin", phone: "+31 20 555 0105", email: "orders@sanitairdirect.nl" } });
  const supContainer = await prisma.supplier.create({ data: { name: "AfvalContainer Service NL", category: "Контейнери", contact: "Dispatch", phone: "+31 20 555 0199", email: "planning@acsnl.nl" } });

  // ---------------------------------------------------------------
  // CLIENTS
  // ---------------------------------------------------------------
  const makeClient = (name: string, phone: string, email: string, address: string, userId?: string) =>
    prisma.client.create({ data: { name, phone, email, address, userId } });

  const cWillemsen = await makeClient("Fam. Willemsen", "+31 6 4444 0001", "hans.willemsen@example.com", "Kerkstraat 12, 1012 AB Amsterdam", clientUser.id);
  const cDeBoer = await makeClient("Fam. de Boer", "+31 6 4444 0002", "deboer@example.com", "Prinsengracht 88, 1015 DZ Amsterdam");
  const cDeGroot = await makeClient("Fam. de Groot", "+31 6 4444 0003", "degroot@example.com", "Vondelstraat 45, 1054 GJ Amsterdam");
  const cVanDijk = await makeClient("Fam. van Dijk", "+31 6 4444 0004", "vandijk@example.com", "Overtoom 210, 1054 HW Amsterdam");
  const cVvE = await makeClient("VvE Lindenstraat", "+31 6 4444 0005", "vve.lindenstraat@example.com", "Lindenstraat 5-15, 1015 KV Amsterdam");
  const cPeeters = await makeClient("Fam. Peeters", "+31 6 4444 0006", "peeters@example.com", "Ceintuurbaan 300, 1073 EL Amsterdam");
  const cJanssenBV = await makeClient("Janssen Advocaten BV", "+31 20 444 0007", "office@janssenlaw.nl", "Herengracht 400, 1017 BZ Amsterdam");
  const cSmit = await makeClient("Fam. Smit", "+31 6 4444 0008", "smit@example.com", "Van Baerlestraat 77, 1071 BA Amsterdam");
  const cBakker = await makeClient("Fam. Bakker", "+31 6 4444 0009", "bakker@example.com", "Rozengracht 150, 1016 NG Amsterdam");
  const cHendriks = await makeClient("Fam. Hendriks", "+31 6 4444 0010", "hendriks@example.com", "Jordaan 22, 1016 AB Amsterdam");
  const cMulder = await makeClient("Fam. Mulder", "+31 6 4444 0011", "mulder@example.com", "Da Costakade 9, 1053 WL Amsterdam");
  const cVisser = await makeClient("Fam. Visser", "+31 6 4444 0012", "visser@example.com", "Bos en Lommerweg 60, 1055 AC Amsterdam");
  const cDekker = await makeClient("Fam. Dekker", "+31 6 4444 0013", "dekker@example.com", "Zeeburgerdijk 100, 1093 SN Amsterdam");
  const cJansen = await makeClient("Fam. Jansen", "+31 6 4444 0014", "jansen@example.com", "Watergraafsmeer 8, 1097 VA Amsterdam");

  // ---------------------------------------------------------------
  // QA CHECKLIST TEMPLATES
  // ---------------------------------------------------------------
  await prisma.qAChecklistTemplate.createMany({
    data: [
      { workType: "Сантехніка", items: JSON.stringify(["Перевірено герметичність з'єднань", "Перевірено тиск води", "Встановлено сифони", "Перевірено роботу змішувачів"]) },
      { workType: "Електрика", items: JSON.stringify(["Перевірено заземлення", "Промарковано автомати", "Перевірено розетки під навантаженням", "УЗО протестовано"]) },
      { workType: "Плитка", items: JSON.stringify(["Рівність поверхні перевірена рівнем", "Шви однакової ширини", "Затирка нанесена рівномірно", "Кути та стики оброблені"]) },
      { workType: "Штукатурка", items: JSON.stringify(["Поверхня рівна без хвиль", "Кути прямі", "Просушено перед наступним етапом"]) },
    ],
  });

  // =================================================================
  // PROJECT 1 — NEW
  // =================================================================
  const p1 = await prisma.project.create({
    data: {
      number: "RR-2026-101",
      name: "Renovatie badkamer",
      clientId: cHendriks.id,
      address: "Jordaan 22, 1016 AB Amsterdam",
      googleMapsUrl: "https://maps.google.com/?q=Jordaan+22+Amsterdam",
      pmId: pm1.id,
      consultantId: sales.id,
      workType: "Ремонт ванної кімнати",
      offerDate: daysFromNow(-2),
      plannedStartDate: daysFromNow(21),
      plannedEndDate: daysFromNow(35),
      contractAmount: 18500,
      vatRate: 21,
      status: "NEW",
    },
  });
  await prisma.projectStatusHistory.create({ data: { projectId: p1.id, status: "NEW", changedById: sales.id, note: "Оферту підписано клієнтом", changedAt: daysFromNow(-2) } });

  // =================================================================
  // PROJECT 2 — AWAITING_DEPOSIT
  // =================================================================
  const p2 = await prisma.project.create({
    data: {
      number: "RR-2026-102",
      name: "Aanbouw serre",
      clientId: cPeeters.id,
      address: "Ceintuurbaan 300, 1073 EL Amsterdam",
      googleMapsUrl: "https://maps.google.com/?q=Ceintuurbaan+300+Amsterdam",
      pmId: pm1.id,
      consultantId: sales.id,
      workType: "Прибудова",
      offerDate: daysFromNow(-10),
      plannedStartDate: daysFromNow(30),
      plannedEndDate: daysFromNow(60),
      contractAmount: 42000,
      vatRate: 21,
      status: "AWAITING_DEPOSIT",
    },
  });
  await prisma.projectStatusHistory.createMany({
    data: [
      { projectId: p2.id, status: "NEW", changedById: sales.id, changedAt: daysFromNow(-10) },
      { projectId: p2.id, status: "AWAITING_DEPOSIT", changedById: sales.id, note: "Надіслано рахунок на аванс 30%", changedAt: daysFromNow(-9) },
    ],
  });
  await prisma.invoice.create({
    data: {
      projectId: p2.id,
      number: "INV-2026-0201",
      type: "DEPOSIT",
      amount: 12600,
      vatRate: 21,
      issueDate: daysFromNow(-9),
      dueDate: daysFromNow(-2),
      status: "OVERDUE",
    },
  });
  await prisma.task.create({
    data: {
      title: "Нагадати клієнту про сплату авансу",
      description: "Аванс 30% прострочено на кілька днів, зв'язатись з клієнтом",
      relatedType: "PAYMENT",
      projectId: p2.id,
      assigneeId: accountant.id,
      createdById: office.id,
      dueDate: daysFromNow(-1),
      priority: "HIGH",
      status: "OPEN",
    },
  });

  // =================================================================
  // PROJECT 3 — READY_FOR_PREP
  // =================================================================
  const p3 = await prisma.project.create({
    data: {
      number: "RR-2026-103",
      name: "Keukenrenovatie",
      clientId: cMulder.id,
      address: "Da Costakade 9, 1053 WL Amsterdam",
      pmId: pm2.id,
      consultantId: sales.id,
      workType: "Кухня під ключ",
      offerDate: daysFromNow(-20),
      plannedStartDate: daysFromNow(14),
      plannedEndDate: daysFromNow(28),
      contractAmount: 27500,
      status: "READY_FOR_PREP",
    },
  });
  await prisma.projectStatusHistory.createMany({
    data: [
      { projectId: p3.id, status: "NEW", changedAt: daysFromNow(-20) },
      { projectId: p3.id, status: "AWAITING_DEPOSIT", changedAt: daysFromNow(-18) },
      { projectId: p3.id, status: "READY_FOR_PREP", changedById: office.id, note: "Аванс отримано", changedAt: daysFromNow(-15) },
    ],
  });
  await prisma.invoice.create({ data: { projectId: p3.id, number: "INV-2026-0301", type: "DEPOSIT", amount: 8250, issueDate: daysFromNow(-18), paidDate: daysFromNow(-15), status: "PAID" } });

  // =================================================================
  // PROJECT 4 — IN_PREP
  // =================================================================
  const p4 = await prisma.project.create({
    data: {
      number: "RR-2026-104",
      name: "Terrasoverkapping",
      clientId: cVisser.id,
      address: "Bos en Lommerweg 60, 1055 AC Amsterdam",
      pmId: pm1.id,
      workType: "Прибудова",
      offerDate: daysFromNow(-25),
      plannedStartDate: daysFromNow(7),
      plannedEndDate: daysFromNow(18),
      contractAmount: 15800,
      status: "IN_PREP",
    },
  });
  await prisma.projectStatusHistory.createMany({
    data: [
      { projectId: p4.id, status: "NEW", changedAt: daysFromNow(-25) },
      { projectId: p4.id, status: "AWAITING_DEPOSIT", changedAt: daysFromNow(-23) },
      { projectId: p4.id, status: "READY_FOR_PREP", changedAt: daysFromNow(-19) },
      { projectId: p4.id, status: "IN_PREP", changedById: pm1.id, note: "Замовлення матеріалів у процесі", changedAt: daysFromNow(-3) },
    ],
  });
  await prisma.material.create({
    data: { projectId: p4.id, name: "Полікарбонатні панелі", category: "Покрівля", quantity: 24, unit: "м²", supplierId: supHornbach.id, purchasePrice: 45, plannedOrderDate: daysFromNow(-1), status: "TO_ORDER", responsibleId: office.id },
  });

  // =================================================================
  // PROJECT 5 — AWAITING_MATERIALS  (dashboard: materials not ordered / delayed)
  // =================================================================
  const p5 = await prisma.project.create({
    data: {
      number: "RR-2026-105",
      name: "Dakrenovatie",
      clientId: cVanDijk.id,
      address: "Overtoom 210, 1054 HW Amsterdam",
      googleMapsUrl: "https://maps.google.com/?q=Overtoom+210+Amsterdam",
      pmId: pm1.id,
      workType: "Покрівля",
      offerDate: daysFromNow(-30),
      plannedStartDate: daysFromNow(5),
      plannedEndDate: daysFromNow(20),
      contractAmount: 33500,
      status: "AWAITING_MATERIALS",
    },
  });
  await prisma.projectStatusHistory.createMany({
    data: [
      { projectId: p5.id, status: "NEW", changedAt: daysFromNow(-30) },
      { projectId: p5.id, status: "AWAITING_DEPOSIT", changedAt: daysFromNow(-28) },
      { projectId: p5.id, status: "READY_FOR_PREP", changedAt: daysFromNow(-24) },
      { projectId: p5.id, status: "IN_PREP", changedAt: daysFromNow(-20) },
      { projectId: p5.id, status: "AWAITING_MATERIALS", changedById: pm1.id, note: "Черепиця в дефіциті у постачальника", changedAt: daysFromNow(-6) },
    ],
  });
  await prisma.material.createMany({
    data: [
      { projectId: p5.id, name: "Керамічна черепиця", category: "Покрівля", quantity: 400, unit: "шт", supplierId: supHornbach.id, purchasePrice: 3.2, plannedOrderDate: daysFromNow(-10), status: "TO_ORDER", responsibleId: office.id, comment: "Постачальник ще не підтвердив наявність" },
      { projectId: p5.id, name: "Гідроізоляційна плівка", category: "Покрівля", quantity: 120, unit: "м²", supplierId: supGamma.id, purchasePrice: 2.1, plannedOrderDate: daysFromNow(-8), actualOrderDate: daysFromNow(-7), orderNumber: "GB-88214", expectedDeliveryDate: daysFromNow(-2), status: "DELAYED", responsibleId: office.id, comment: "Постачальник повідомив про затримку на 5 днів" },
      { projectId: p5.id, name: "Покрівельні цвяхи", category: "Кріплення", quantity: 5, unit: "кг", supplierId: supGamma.id, purchasePrice: 8, status: "TO_BE_DEFINED" },
    ],
  });
  await prisma.container.create({
    data: { projectId: p5.id, wasteType: "Будівельне сміття", size: "6m³", supplierId: supContainer.id, price: 280, status: "TO_ORDER", permitNeeded: true, comment: "Потрібен дозвіл на паркувальне місце — ще не подано" },
  });
  await prisma.issue.create({
    data: { projectId: p5.id, description: "Виявлено гниле дерев'яне перекриття під старою черепицею", category: "Конструкція", responsibleId: pm1.id, priority: "HIGH", plannedSolution: "Замінити ділянку обрешітки перед монтажем нової покрівлі", dueDate: daysFromNow(3), status: "OPEN", financialImpact: 850, affectsEndDate: true },
  });

  // =================================================================
  // PROJECT 6 — READY_TO_SCHEDULE
  // =================================================================
  const p6 = await prisma.project.create({
    data: {
      number: "RR-2026-106",
      name: "Vloerverwarming installatie",
      clientId: cDekker.id,
      address: "Zeeburgerdijk 100, 1093 SN Amsterdam",
      pmId: pm2.id,
      workType: "Сантехніка",
      offerDate: daysFromNow(-15),
      plannedStartDate: daysFromNow(4),
      plannedEndDate: daysFromNow(10),
      contractAmount: 9800,
      status: "READY_TO_SCHEDULE",
    },
  });
  await prisma.projectStatusHistory.createMany({
    data: [
      { projectId: p6.id, status: "NEW", changedAt: daysFromNow(-15) },
      { projectId: p6.id, status: "AWAITING_DEPOSIT", changedAt: daysFromNow(-13) },
      { projectId: p6.id, status: "READY_FOR_PREP", changedAt: daysFromNow(-10) },
      { projectId: p6.id, status: "IN_PREP", changedAt: daysFromNow(-8) },
      { projectId: p6.id, status: "AWAITING_MATERIALS", changedAt: daysFromNow(-6) },
      { projectId: p6.id, status: "READY_TO_SCHEDULE", changedById: pm2.id, note: "Усі матеріали доставлено", changedAt: daysFromNow(-1) },
    ],
  });
  await prisma.material.create({ data: { projectId: p6.id, name: "Труби для теплої підлоги", category: "Сантехніка", quantity: 180, unit: "м", supplierId: supSanitair.id, purchasePrice: 3.5, actualOrderDate: daysFromNow(-6), actualDeliveryDate: daysFromNow(-1), status: "DELIVERED" } });

  // =================================================================
  // PROJECT 7 — SCHEDULED (starts tomorrow -> dashboard notification)
  // =================================================================
  const p7 = await prisma.project.create({
    data: {
      number: "RR-2026-107",
      name: "Gevelisolatie",
      clientId: cVvE.id,
      address: "Lindenstraat 5-15, 1015 KV Amsterdam",
      googleMapsUrl: "https://maps.google.com/?q=Lindenstraat+5+Amsterdam",
      pmId: pm1.id,
      workType: "Фасадні роботи",
      offerDate: daysFromNow(-40),
      plannedStartDate: daysFromNow(1),
      plannedEndDate: daysFromNow(15),
      contractAmount: 56000,
      status: "SCHEDULED",
    },
  });
  await prisma.projectStatusHistory.createMany({
    data: [
      { projectId: p7.id, status: "NEW", changedAt: daysFromNow(-40) },
      { projectId: p7.id, status: "AWAITING_DEPOSIT", changedAt: daysFromNow(-38) },
      { projectId: p7.id, status: "READY_FOR_PREP", changedAt: daysFromNow(-30) },
      { projectId: p7.id, status: "IN_PREP", changedAt: daysFromNow(-20) },
      { projectId: p7.id, status: "AWAITING_MATERIALS", changedAt: daysFromNow(-12) },
      { projectId: p7.id, status: "READY_TO_SCHEDULE", changedAt: daysFromNow(-5) },
      { projectId: p7.id, status: "SCHEDULED", changedById: pm1.id, note: "Команда підтверджена на завтра", changedAt: daysFromNow(-1) },
    ],
  });
  const p7Stage1 = await prisma.stage.create({
    data: { projectId: p7.id, name: "Демонтаж старого фасаду", startDate: daysFromNow(1), endDate: daysFromNow(2), durationDays: 2, responsibleId: pm1.id, status: "SCHEDULED", order: 1 },
  });
  await prisma.scheduleEntry.create({ data: { workerId: w2.id, projectId: p7.id, stageId: p7Stage1.id, date: daysFromNow(1), startTime: "08:00", endTime: "16:00", task: "Демонтаж старого фасаду", responsibleId: pm1.id, confirmed: true } });
  await prisma.scheduleEntry.create({ data: { workerId: w7.id, projectId: p7.id, stageId: p7Stage1.id, date: daysFromNow(1), startTime: "08:00", endTime: "16:00", task: "Демонтаж старого фасаду", responsibleId: pm1.id, confirmed: false } });
  await prisma.material.create({ data: { projectId: p7.id, name: "Мінеральна вата 100мм", category: "Ізоляція", quantity: 300, unit: "м²", supplierId: supGamma.id, purchasePrice: 12.5, actualOrderDate: daysFromNow(-10), actualDeliveryDate: daysFromNow(-3), status: "DELIVERED" } });
  await prisma.container.create({ data: { projectId: p7.id, wasteType: "Будівельне сміття", size: "8m³", supplierId: supContainer.id, price: 320, orderDate: daysFromNow(-5), plannedDeliveryDate: daysFromNow(1), location: "Перед будинком, дозволене місце №3", permitNeeded: true, permitExpiry: daysFromNow(20), status: "ORDERED" } });

  // =================================================================
  // PROJECT 8 — IN_PROGRESS (the flagship "hero" project — rich data)
  // =================================================================
  const p8 = await prisma.project.create({
    data: {
      number: "RR-2026-108",
      name: "Keuken op maat",
      clientId: cWillemsen.id,
      address: "Kerkstraat 12, 1012 AB Amsterdam",
      googleMapsUrl: "https://maps.google.com/?q=Kerkstraat+12+Amsterdam",
      pmId: pm1.id,
      consultantId: sales.id,
      workType: "Кухня під ключ",
      offerDate: daysFromNow(-55),
      plannedStartDate: daysFromNow(-20),
      plannedEndDate: daysFromNow(5),
      contractAmount: 31200,
      vatRate: 21,
      warrantyMonths: 24,
      status: "IN_PROGRESS",
    },
  });
  await prisma.projectStatusHistory.createMany({
    data: [
      { projectId: p8.id, status: "NEW", changedAt: daysFromNow(-55) },
      { projectId: p8.id, status: "AWAITING_DEPOSIT", changedAt: daysFromNow(-53) },
      { projectId: p8.id, status: "READY_FOR_PREP", changedAt: daysFromNow(-48) },
      { projectId: p8.id, status: "IN_PREP", changedAt: daysFromNow(-40) },
      { projectId: p8.id, status: "AWAITING_MATERIALS", changedAt: daysFromNow(-30) },
      { projectId: p8.id, status: "READY_TO_SCHEDULE", changedAt: daysFromNow(-22) },
      { projectId: p8.id, status: "SCHEDULED", changedAt: daysFromNow(-21) },
      { projectId: p8.id, status: "IN_PROGRESS", changedById: pm1.id, note: "Демонтаж розпочато", changedAt: daysFromNow(-20) },
    ],
  });

  const stageDefs: { name: string; start: number; end: number; status: string; responsibleId: string; workers: string[]; delayReason?: string }[] = [
    { name: "Демонтаж", start: -20, end: -18, status: "DONE", responsibleId: w1.id, workers: [w1.id, w2.id] },
    { name: "Підготовчі роботи", start: -17, end: -15, status: "DONE", responsibleId: w1.id, workers: [w1.id] },
    { name: "Сантехніка", start: -14, end: -12, status: "DONE", responsibleId: w5.id, workers: [w5.id] },
    { name: "Електрика", start: -11, end: -9, status: "DONE", responsibleId: w3.id, workers: [w3.id] },
    { name: "Штукатурка", start: -8, end: -5, status: "DONE", responsibleId: w2.id, workers: [w2.id] },
    { name: "Плитка", start: -4, end: 0, status: "IN_PROGRESS", responsibleId: w4.id, workers: [w4.id] },
    { name: "Монтаж сантехніки", start: 1, end: 2, status: "AWAITING_MATERIALS", responsibleId: w5.id, workers: [w5.id], delayReason: "Очікуємо змішувачі від Sanitair Direct" },
    { name: "Фарбування", start: 2, end: 3, status: "NOT_SCHEDULED", responsibleId: w7.id, workers: [w7.id] },
    { name: "Фінальне прибирання", start: 4, end: 4, status: "NOT_SCHEDULED", responsibleId: w1.id, workers: [w1.id] },
    { name: "Перевірка", start: 4, end: 4, status: "NOT_SCHEDULED", responsibleId: pm1.id, workers: [] },
    { name: "Здача проєкту клієнту", start: 5, end: 5, status: "NOT_SCHEDULED", responsibleId: pm1.id, workers: [] },
  ];

  // Stage.responsibleId references the User table; workers only have a User
  // account when they also log in (w1/w2/w5 below). Fall back to the PM.
  const workerUserMap: Record<string, string> = {
    [w1.id]: workerUser1.id,
    [w2.id]: workerUser2.id,
    [w5.id]: subUser1.id,
  };
  const respUser = (id: string) => workerUserMap[id] ?? pm1.id;

  let prevStageId: string | null = null;
  const p8Stages: Record<string, string> = {};
  for (let i = 0; i < stageDefs.length; i++) {
    const s = stageDefs[i];
    const stage: { id: string } = await prisma.stage.create({
      data: {
        projectId: p8.id,
        name: s.name,
        startDate: daysFromNow(s.start),
        endDate: daysFromNow(s.end),
        durationDays: s.end - s.start + 1,
        responsibleId: respUser(s.responsibleId),
        status: s.status,
        delayReason: s.delayReason,
        order: i + 1,
        dependsOnId: prevStageId ?? undefined,
      },
    });
    p8Stages[s.name] = stage.id;
    for (const wid of s.workers) {
      await prisma.stageAssignment.create({ data: { stageId: stage.id, workerId: wid } });
    }
    prevStageId = stage.id;
  }

  // Schedule entries: today + this week for the tiling stage, plus a double-booking conflict for w4
  await prisma.scheduleEntry.create({ data: { workerId: w4.id, projectId: p8.id, stageId: p8Stages["Плитка"], date: daysFromNow(0), startTime: "08:00", endTime: "16:30", task: "Укладання плитки — кухня", responsibleId: pm1.id, confirmed: true } });
  await prisma.scheduleEntry.create({ data: { workerId: w4.id, projectId: p8.id, stageId: p8Stages["Плитка"], date: daysFromNow(1), startTime: "08:00", endTime: "16:30", task: "Укладання плитки — фартух", responsibleId: pm1.id, confirmed: true } });
  await prisma.scheduleEntry.create({ data: { workerId: w1.id, projectId: p8.id, date: daysFromNow(0), startTime: "09:00", endTime: "13:00", task: "Допомога — прибирання будматеріалів", responsibleId: pm1.id, confirmed: true } });

  // Time logs for the last few days
  await prisma.timeLog.create({ data: { workerId: w4.id, projectId: p8.id, date: daysFromNow(-1), startTime: "08:00", endTime: "16:30", breakMinutes: 30, workDone: "Укладання плитки на підлозі кухні", materialsUsed: "Плитка 60x60 — 18 м²; клей — 6 мішків" } });
  await prisma.timeLog.create({ data: { workerId: w2.id, projectId: p8.id, date: daysFromNow(-6), startTime: "07:30", endTime: "16:00", breakMinutes: 30, workDone: "Фінішна штукатурка стін" } });

  await prisma.material.createMany({
    data: [
      { projectId: p8.id, name: "Кухонні шафи (комплект)", category: "Кухня", quantity: 1, unit: "компл", supplierId: supKeukens.id, purchasePrice: 9800, actualOrderDate: daysFromNow(-45), actualDeliveryDate: daysFromNow(-19), status: "DELIVERED" },
      { projectId: p8.id, name: "Плитка керамограніт 60x60", category: "Плитка", quantity: 32, unit: "м²", supplierId: supTegels.id, purchasePrice: 24, actualOrderDate: daysFromNow(-25), actualDeliveryDate: daysFromNow(-6), status: "DELIVERED" },
      { projectId: p8.id, name: "Змішувач кухонний Grohe", category: "Сантехніка", quantity: 1, unit: "шт", supplierId: supSanitair.id, purchasePrice: 210, plannedOrderDate: daysFromNow(-2), actualOrderDate: daysFromNow(-2), orderNumber: "SD-55321", expectedDeliveryDate: daysFromNow(2), status: "ORDERED", responsibleId: office.id },
      { projectId: p8.id, name: "Врізна мийка", category: "Сантехніка", quantity: 1, unit: "шт", supplierId: supSanitair.id, purchasePrice: 180, status: "AWAITING_CONFIRMATION", comment: "Постачальник ще не підтвердив наявність кольору" },
    ],
  });

  await prisma.container.create({ data: { projectId: p8.id, wasteType: "Змішані відходи", size: "5m³", supplierId: supContainer.id, price: 260, orderDate: daysFromNow(-21), plannedDeliveryDate: daysFromNow(-20), actualDeliveryDate: daysFromNow(-20), location: "Внутрішній двір", status: "FULL", invoiceNumber: "ACS-4471", comment: "Заповнено, потрібно замовити забір" } });
  await prisma.task.create({ data: { title: "Замовити забір контейнера", relatedType: "CONTAINER", projectId: p8.id, assigneeId: office.id, createdById: pm1.id, dueDate: daysFromNow(0), priority: "HIGH", status: "OPEN" } });

  await prisma.expense.createMany({
    data: [
      { projectId: p8.id, category: "MATERIAL", description: "Кухонні шафи (комплект)", amount: 9800, status: "PAID", date: daysFromNow(-40) },
      { projectId: p8.id, category: "MATERIAL", description: "Плитка керамограніт", amount: 768, status: "PAID", date: daysFromNow(-24) },
      { projectId: p8.id, category: "LABOR", description: "Заробітна плата — жовтень", amount: 3200, status: "CONFIRMED", date: daysFromNow(-10) },
      { projectId: p8.id, category: "SUBCONTRACTOR", description: "Nowak Loodgieters — сантехніка", amount: 450, status: "UNPAID", date: daysFromNow(-13) },
      { projectId: p8.id, category: "CONTAINER", description: "AfvalContainer Service", amount: 260, status: "INVOICED", date: daysFromNow(-20) },
      { projectId: p8.id, category: "TRANSPORT", description: "Доставка матеріалів", amount: 120, status: "PENDING", date: daysFromNow(-5) },
    ],
  });
  await prisma.invoice.createMany({
    data: [
      { projectId: p8.id, number: "INV-2026-0801", type: "DEPOSIT", amount: 9360, issueDate: daysFromNow(-53), paidDate: daysFromNow(-50), status: "PAID" },
      { projectId: p8.id, number: "INV-2026-0802", type: "INTERIM", amount: 12480, issueDate: daysFromNow(-20), paidDate: daysFromNow(-15), status: "PAID" },
      { projectId: p8.id, number: "INV-2026-0803", type: "INTERIM", amount: 6240, issueDate: daysFromNow(-3), dueDate: daysFromNow(11), status: "SENT" },
    ],
  });
  await prisma.extraWork.create({
    data: {
      projectId: p8.id,
      description: "Додаткове підсвічування під шафами (LED-стрічка)",
      reason: "Побажання клієнта під час монтажу",
      laborCost: 150,
      materialCost: 90,
      vatRate: 21,
      sentDate: daysFromNow(-3),
      clientConfirmed: false,
      executionStatus: "AWAITING_CLIENT_CONFIRMATION",
      paymentStatus: "NOT_INVOICED",
    },
  });
  await prisma.issue.create({
    data: { projectId: p8.id, description: "Невеликий скол на кутовій плитці біля вікна", category: "Якість", detectedDate: daysFromNow(-1), responsibleId: respUser(w4.id), priority: "MEDIUM", plannedSolution: "Замінити 1 плитку з остатку партії", dueDate: daysFromNow(2), status: "IN_PROGRESS", financialImpact: 0, affectsEndDate: false },
  });
  await prisma.dailyReport.create({
    data: {
      projectId: p8.id,
      date: daysFromNow(-1),
      authorId: pm1.id,
      workersPresent: JSON.stringify(["Andriy Shevchenko", "Ivan Kovalenko"]),
      hoursWorked: 16,
      workDone: "Укладання плитки на підлозі, підготовка фартуха",
      materialsUsed: "Плитка 18м², клей 6 мішків",
      materialsRunningLow: "Затирка для швів — залишилось мало",
      issuesFound: "Скол на одній плитці біля вікна",
      planForTomorrow: "Продовжити плитку на фартусі, почати підготовку до монтажу сантехніки",
      hasDelay: false,
      needsManagerDecision: false,
    },
  });
  await prisma.document.createMany({
    data: [
      { projectId: p8.id, category: "OFFER", name: "Oferta_Willemsen_signed.pdf", url: "/uploads/placeholder-offer.pdf", uploadedById: sales.id },
      { projectId: p8.id, category: "PLAN", name: "Keuken_plattegrond_v2.pdf", url: "/uploads/placeholder-plan.pdf", uploadedById: pm1.id },
      { projectId: p8.id, category: "PHOTO_PROGRESS", name: "voortgang_plitka_01.jpg", url: "/uploads/placeholder-photo.jpg", uploadedById: workerUser1.id },
    ],
  });

  // =================================================================
  // PROJECT 9 — ON_HOLD (blocked)
  // =================================================================
  const p9 = await prisma.project.create({
    data: {
      number: "RR-2026-109",
      name: "Volledige renovatie appartement",
      clientId: cDeGroot.id,
      address: "Vondelstraat 45, 1054 GJ Amsterdam",
      pmId: pm2.id,
      workType: "Повний ремонт квартири",
      offerDate: daysFromNow(-70),
      plannedStartDate: daysFromNow(-30),
      plannedEndDate: daysFromNow(15),
      contractAmount: 68000,
      status: "ON_HOLD",
    },
  });
  await prisma.projectStatusHistory.createMany({
    data: [
      { projectId: p9.id, status: "NEW", changedAt: daysFromNow(-70) },
      { projectId: p9.id, status: "IN_PROGRESS", changedAt: daysFromNow(-30) },
      { projectId: p9.id, status: "ON_HOLD", changedById: pm2.id, note: "Виявлено проблему з несучою стіною, очікуємо висновок інженера", changedAt: daysFromNow(-4) },
    ],
  });
  await prisma.issue.create({
    data: { projectId: p9.id, description: "Під час демонтажу виявлено тріщину в несучій стіні", category: "Конструкція", responsibleId: pm2.id, priority: "CRITICAL", plannedSolution: "Замовлено висновок будівельного інженера", dueDate: daysFromNow(2), status: "OPEN", financialImpact: 2500, affectsEndDate: true },
  });
  await prisma.task.create({ data: { title: "Отримати висновок інженера щодо несучої стіни", relatedType: "ISSUE", projectId: p9.id, assigneeId: pm2.id, createdById: admin.id, dueDate: daysFromNow(2), priority: "URGENT", status: "OPEN" } });

  // =================================================================
  // PROJECT 10 — AWAITING_INSPECTION
  // =================================================================
  const p10 = await prisma.project.create({
    data: {
      number: "RR-2026-110",
      name: "Kantoorrenovatie",
      clientId: cJanssenBV.id,
      address: "Herengracht 400, 1017 BZ Amsterdam",
      pmId: pm1.id,
      workType: "Комерційний ремонт",
      offerDate: daysFromNow(-60),
      plannedStartDate: daysFromNow(-25),
      plannedEndDate: daysFromNow(-1),
      contractAmount: 54000,
      status: "AWAITING_INSPECTION",
    },
  });
  await prisma.projectStatusHistory.createMany({
    data: [
      { projectId: p10.id, status: "IN_PROGRESS", changedAt: daysFromNow(-25) },
      { projectId: p10.id, status: "AWAITING_INSPECTION", changedById: pm1.id, note: "Усі роботи виконано, чекаємо клієнта для приймання", changedAt: daysFromNow(-1) },
    ],
  });
  await prisma.extraWork.create({
    data: {
      projectId: p10.id,
      description: "Додаткові розетки в переговорній кімнаті (6 шт)",
      reason: "Запит клієнта під час фінальної перевірки",
      laborCost: 240,
      materialCost: 90,
      sentDate: daysFromNow(-3),
      clientConfirmed: false,
      executionStatus: "AWAITING_CLIENT_CONFIRMATION",
      paymentStatus: "NOT_INVOICED",
    },
  });
  await prisma.task.create({ data: { title: "Запланувати фінальну перевірку з клієнтом", relatedType: "PROJECT", projectId: p10.id, assigneeId: pm1.id, createdById: pm1.id, dueDate: daysFromNow(2), priority: "MEDIUM", status: "OPEN" } });

  // =================================================================
  // PROJECT 11 — AWAITING_FIXES
  // =================================================================
  const p11 = await prisma.project.create({
    data: {
      number: "RR-2026-111",
      name: "Zolderverbouwing",
      clientId: cBakker.id,
      address: "Rozengracht 150, 1016 NG Amsterdam",
      pmId: pm2.id,
      workType: "Прибудова",
      offerDate: daysFromNow(-50),
      plannedStartDate: daysFromNow(-20),
      plannedEndDate: daysFromNow(-3),
      contractAmount: 24500,
      status: "AWAITING_FIXES",
    },
  });
  await prisma.projectStatusHistory.createMany({
    data: [
      { projectId: p11.id, status: "AWAITING_INSPECTION", changedAt: daysFromNow(-4) },
      { projectId: p11.id, status: "AWAITING_FIXES", changedById: pm2.id, note: "Клієнт виявив 2 дефекти під час приймання", changedAt: daysFromNow(-2) },
    ],
  });
  await prisma.issue.createMany({
    data: [
      { projectId: p11.id, description: "Шпаклівка тріснула біля димохідного вікна", category: "Якість", responsibleId: respUser(w2.id), priority: "MEDIUM", plannedSolution: "Перешпаклювати ділянку", dueDate: daysFromNow(2), status: "OPEN", affectsEndDate: false },
      { projectId: p11.id, description: "Двері мансардного вікна не щільно закриваються", category: "Монтаж", responsibleId: respUser(w1.id), priority: "LOW", plannedSolution: "Відрегулювати петлі", dueDate: daysFromNow(3), status: "OPEN", affectsEndDate: false },
    ],
  });
  await prisma.task.create({ data: { title: "Виправити дефекти перед повторним прийманням", relatedType: "ISSUE", projectId: p11.id, assigneeId: pm2.id, createdById: pm2.id, dueDate: daysFromNow(3), priority: "HIGH", status: "OPEN" } });

  // =================================================================
  // PROJECT 12 — AWAITING_FINAL_PAYMENT
  // =================================================================
  const p12 = await prisma.project.create({
    data: {
      number: "RR-2026-112",
      name: "Nieuwe vloer en schilderwerk",
      clientId: cSmit.id,
      address: "Van Baerlestraat 77, 1071 BA Amsterdam",
      pmId: pm1.id,
      workType: "Повний ремонт квартири",
      offerDate: daysFromNow(-45),
      plannedStartDate: daysFromNow(-25),
      plannedEndDate: daysFromNow(-5),
      actualEndDate: daysFromNow(-4),
      contractAmount: 19800,
      status: "AWAITING_FINAL_PAYMENT",
    },
  });
  await prisma.projectStatusHistory.createMany({
    data: [
      { projectId: p12.id, status: "COMPLETED", changedAt: daysFromNow(-4) },
      { projectId: p12.id, status: "AWAITING_FINAL_PAYMENT", changedById: accountant.id, note: "Фінальну фактуру виставлено", changedAt: daysFromNow(-3) },
    ],
  });
  await prisma.invoice.createMany({
    data: [
      { projectId: p12.id, number: "INV-2026-1201", type: "DEPOSIT", amount: 5940, issueDate: daysFromNow(-45), paidDate: daysFromNow(-42), status: "PAID" },
      { projectId: p12.id, number: "INV-2026-1202", type: "FINAL", amount: 13860, issueDate: daysFromNow(-3), dueDate: daysFromNow(11), status: "SENT" },
    ],
  });

  // =================================================================
  // PROJECT 13 — COMPLETED (with full handover checklist)
  // =================================================================
  const p13 = await prisma.project.create({
    data: {
      number: "RR-2026-113",
      name: "Renovatie badkamer",
      clientId: cDeBoer.id,
      address: "Prinsengracht 88, 1015 DZ Amsterdam",
      pmId: pm1.id,
      workType: "Ремонт ванної кімнати",
      offerDate: daysFromNow(-90),
      plannedStartDate: daysFromNow(-70),
      plannedEndDate: daysFromNow(-55),
      actualEndDate: daysFromNow(-53),
      contractAmount: 16400,
      warrantyMonths: 24,
      status: "COMPLETED",
    },
  });
  await prisma.projectStatusHistory.createMany({
    data: [
      { projectId: p13.id, status: "IN_PROGRESS", changedAt: daysFromNow(-70) },
      { projectId: p13.id, status: "AWAITING_INSPECTION", changedAt: daysFromNow(-56) },
      { projectId: p13.id, status: "AWAITING_FINAL_PAYMENT", changedAt: daysFromNow(-54) },
      { projectId: p13.id, status: "COMPLETED", changedById: pm1.id, note: "Проєкт завершено, клієнт задоволений", changedAt: daysFromNow(-53) },
    ],
  });
  await prisma.invoice.createMany({
    data: [
      { projectId: p13.id, number: "INV-2026-1301", type: "DEPOSIT", amount: 4920, issueDate: daysFromNow(-90), paidDate: daysFromNow(-88), status: "PAID" },
      { projectId: p13.id, number: "INV-2026-1302", type: "FINAL", amount: 11480, issueDate: daysFromNow(-54), paidDate: daysFromNow(-50), status: "PAID" },
    ],
  });
  await prisma.expense.createMany({
    data: [
      { projectId: p13.id, category: "MATERIAL", description: "Плитка, сантехніка, змішувачі", amount: 6200, status: "PAID", date: daysFromNow(-75) },
      { projectId: p13.id, category: "LABOR", description: "Оплата праці бригади", amount: 3800, status: "PAID", date: daysFromNow(-60) },
      { projectId: p13.id, category: "SUBCONTRACTOR", description: "Nowak Loodgieters", amount: 600, status: "PAID", date: daysFromNow(-62) },
      { projectId: p13.id, category: "CONTAINER", description: "AfvalContainer Service", amount: 260, status: "PAID", date: daysFromNow(-70) },
    ],
  });
  await prisma.handoverChecklist.create({
    data: {
      projectId: p13.id,
      allWorkDone: true,
      extraWorksConfirmed: true,
      defectsFixed: true,
      siteCleaned: true,
      wasteAndContainerRemoved: true,
      materialsToolsRemoved: true,
      finalPhotosTaken: true,
      clientInspectionDone: true,
      handoverProtocolSigned: true,
      finalInvoiceIssued: true,
      finalPaymentReceived: true,
      warrantyDocsHanded: true,
    },
  });
  await prisma.document.create({ data: { projectId: p13.id, category: "HANDOVER_PROTOCOL", name: "Opleveringsprotocol_deBoer.pdf", url: "/uploads/placeholder-handover.pdf", uploadedById: pm1.id } });

  // =================================================================
  // PROJECT 14 — ARCHIVED
  // =================================================================
  const p14 = await prisma.project.create({
    data: {
      number: "RR-2025-070",
      name: "Schuurrenovatie",
      clientId: cJansen.id,
      address: "Watergraafsmeer 8, 1097 VA Amsterdam",
      pmId: pm2.id,
      workType: "Прибудова",
      offerDate: monthsFromNow(-8),
      plannedStartDate: monthsFromNow(-7),
      plannedEndDate: monthsFromNow(-6),
      actualEndDate: monthsFromNow(-6),
      contractAmount: 8900,
      status: "ARCHIVED",
    },
  });
  await prisma.projectStatusHistory.createMany({
    data: [
      { projectId: p14.id, status: "COMPLETED", changedAt: monthsFromNow(-6) },
      { projectId: p14.id, status: "ARCHIVED", changedById: admin.id, note: "Архівовано після завершення гарантійного супроводу", changedAt: monthsFromNow(-1) },
    ],
  });

  console.log("Seed complete:");
  console.log("  Users:", await prisma.user.count());
  console.log("  Projects:", await prisma.project.count());
  console.log("  Stages:", await prisma.stage.count());
  console.log("  Materials:", await prisma.material.count());
  console.log("  Containers:", await prisma.container.count());
  console.log("  Tasks:", await prisma.task.count());
  console.log("  Invoices:", await prisma.invoice.count());
  console.log("  Extra works:", await prisma.extraWork.count());
  console.log("  Issues:", await prisma.issue.count());
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
