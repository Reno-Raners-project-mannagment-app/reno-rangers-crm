"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "../db";
import { str, num, dateOrNull, bool, requireUser } from "./helpers";

// ------------------ MATERIALS ------------------

export async function createMaterialAction(projectId: string, fd: FormData) {
  await requireUser();
  const name = str(fd, "name");
  const unit = str(fd, "unit");
  if (!name || !unit) return;

  let supplierId = str(fd, "supplierId");
  const newSupplierName = str(fd, "newSupplierName");
  if (newSupplierName) {
    const supplier = await prisma.supplier.create({ data: { name: newSupplierName, category: str(fd, "category") } });
    supplierId = supplier.id;
  }

  await prisma.material.create({
    data: {
      projectId,
      name,
      category: str(fd, "category"),
      quantity: num(fd, "quantity") ?? 1,
      unit,
      supplierId: supplierId || null,
      purchasePrice: num(fd, "purchasePrice"),
      plannedOrderDate: dateOrNull(fd, "plannedOrderDate"),
      actualOrderDate: dateOrNull(fd, "actualOrderDate"),
      orderNumber: str(fd, "orderNumber"),
      expectedDeliveryDate: dateOrNull(fd, "expectedDeliveryDate"),
      actualDeliveryDate: dateOrNull(fd, "actualDeliveryDate"),
      deliveryAddress: str(fd, "deliveryAddress"),
      responsibleId: str(fd, "responsibleId"),
      status: str(fd, "status") ?? "TO_BE_DEFINED",
      comment: str(fd, "comment"),
    },
  });
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/materials");
}

export async function updateMaterialAction(materialId: string, projectId: string, fd: FormData) {
  await requireUser();
  await prisma.material.update({
    where: { id: materialId },
    data: {
      name: str(fd, "name"),
      category: str(fd, "category"),
      quantity: num(fd, "quantity"),
      unit: str(fd, "unit"),
      purchasePrice: num(fd, "purchasePrice"),
      plannedOrderDate: dateOrNull(fd, "plannedOrderDate"),
      actualOrderDate: dateOrNull(fd, "actualOrderDate"),
      orderNumber: str(fd, "orderNumber"),
      expectedDeliveryDate: dateOrNull(fd, "expectedDeliveryDate"),
      actualDeliveryDate: dateOrNull(fd, "actualDeliveryDate"),
      deliveryAddress: str(fd, "deliveryAddress"),
      status: str(fd, "status"),
      comment: str(fd, "comment"),
    },
  });
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/materials");
}

export async function updateMaterialStatusAction(materialId: string, projectId: string, status: string) {
  await requireUser();
  const data: Record<string, unknown> = { status };
  if (status === "ORDERED") data.actualOrderDate = new Date();
  if (status === "DELIVERED") data.actualDeliveryDate = new Date();
  await prisma.material.update({ where: { id: materialId }, data });
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/materials");
}

export async function deleteMaterialAction(materialId: string, projectId: string) {
  await requireUser();
  await prisma.material.delete({ where: { id: materialId } });
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/materials");
}

// ------------------ CONTAINERS ------------------

export async function createContainerAction(projectId: string, fd: FormData) {
  await requireUser();
  const wasteType = str(fd, "wasteType");
  const size = str(fd, "size");
  if (!wasteType || !size) return;

  let supplierId = str(fd, "supplierId");
  const newSupplierName = str(fd, "newSupplierName");
  if (newSupplierName) {
    const supplier = await prisma.supplier.create({ data: { name: newSupplierName, category: "Контейнери" } });
    supplierId = supplier.id;
  }

  await prisma.container.create({
    data: {
      projectId,
      wasteType,
      size,
      supplierId: supplierId || null,
      price: num(fd, "price"),
      orderDate: dateOrNull(fd, "orderDate"),
      plannedDeliveryDate: dateOrNull(fd, "plannedDeliveryDate"),
      actualDeliveryDate: dateOrNull(fd, "actualDeliveryDate"),
      location: str(fd, "location"),
      permitNeeded: bool(fd, "permitNeeded"),
      permitExpiry: dateOrNull(fd, "permitExpiry"),
      plannedPickupDate: dateOrNull(fd, "plannedPickupDate"),
      actualPickupDate: dateOrNull(fd, "actualPickupDate"),
      invoiceNumber: str(fd, "invoiceNumber"),
      status: str(fd, "status") ?? "TO_ORDER",
      comment: str(fd, "comment"),
    },
  });
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/containers");
}

export async function updateContainerAction(containerId: string, projectId: string, fd: FormData) {
  await requireUser();
  await prisma.container.update({
    where: { id: containerId },
    data: {
      wasteType: str(fd, "wasteType"),
      size: str(fd, "size"),
      price: num(fd, "price"),
      orderDate: dateOrNull(fd, "orderDate"),
      plannedDeliveryDate: dateOrNull(fd, "plannedDeliveryDate"),
      actualDeliveryDate: dateOrNull(fd, "actualDeliveryDate"),
      location: str(fd, "location"),
      permitNeeded: bool(fd, "permitNeeded"),
      permitExpiry: dateOrNull(fd, "permitExpiry"),
      plannedPickupDate: dateOrNull(fd, "plannedPickupDate"),
      actualPickupDate: dateOrNull(fd, "actualPickupDate"),
      invoiceNumber: str(fd, "invoiceNumber"),
      status: str(fd, "status"),
      comment: str(fd, "comment"),
    },
  });
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/containers");
}

export async function updateContainerStatusAction(containerId: string, projectId: string, status: string) {
  await requireUser();
  const data: Record<string, unknown> = { status };
  if (status === "DELIVERED") data.actualDeliveryDate = new Date();
  if (status === "PICKED_UP") data.actualPickupDate = new Date();
  await prisma.container.update({ where: { id: containerId }, data });
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/containers");
}

export async function deleteContainerAction(containerId: string, projectId: string) {
  await requireUser();
  await prisma.container.delete({ where: { id: containerId } });
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/containers");
}
