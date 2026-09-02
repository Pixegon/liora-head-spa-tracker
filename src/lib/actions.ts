"use server";

import { revalidatePath } from "next/cache";
import { getServicesCollection, getCategoriesCollection, getSettingsCollection } from "@/lib/db";

function generateId(name: string): string {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "item";
  return `${slug}-${Date.now().toString(36)}`;
}

function refresh() {
  revalidatePath("/dashboard");
  revalidatePath("/");
}

// ── Services ──────────────────────────────────────────────────────────

export async function createService(formData: FormData): Promise<string> {
  const name = (formData.get("name") as string).trim();
  const categoryId = (formData.get("categoryId") as string | null)?.trim() || undefined;
  if (!name) return "";

  const col = await getServicesCollection();
  const last = await col.find({}).sort({ sortOrder: -1 }).limit(1).toArray();
  const order = last.length ? last[0].sortOrder + 1 : 0;
  const id = generateId(name);

  await col.insertOne({
    _id: id,
    name,
    sortOrder: order,
    subServices: [],
    ...(categoryId ? { categoryId } : {}),
  });
  refresh();
  return id;
}

export async function updateService(id: string, formData: FormData) {
  const name = (formData.get("name") as string).trim();
  const categoryId = (formData.get("categoryId") as string | null)?.trim() || null;
  if (!name) return;

  const col = await getServicesCollection();
  if (categoryId) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await col.updateOne({ _id: id }, { $set: { name, categoryId } } as any);
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await col.updateOne({ _id: id }, { $set: { name }, $unset: { categoryId: "" } } as any);
  }
  refresh();
}

export async function deleteService(id: string) {
  const col = await getServicesCollection();
  await col.deleteOne({ _id: id });
  refresh();
}

export async function duplicateService(id: string) {
  const col = await getServicesCollection();
  const source = await col.findOne({ _id: id });
  if (!source) return;

  const last = await col.find({}).sort({ sortOrder: -1 }).limit(1).toArray();
  const order = last.length ? last[0].sortOrder + 1 : 0;
  const newName = `${source.name} - copy`;

  const newSubServices = source.subServices.map((ss: { id: string; name: string; durationSeconds: number }) => ({
    ...ss,
    id: generateId(ss.name),
  }));

  await col.insertOne({
    _id: generateId(newName),
    name: newName,
    sortOrder: order,
    enabled: source.enabled,
    ...(source.categoryId ? { categoryId: source.categoryId } : {}),
    subServices: newSubServices,
  });
  refresh();
}

export async function toggleService(id: string) {
  const col = await getServicesCollection();
  const service = await col.findOne({ _id: id });
  if (!service) return;
  const currentEnabled = service.enabled !== false;
  await col.updateOne({ _id: id }, { $set: { enabled: !currentEnabled } });
  refresh();
}

export async function moveService(id: string, direction: "up" | "down") {
  const col = await getServicesCollection();
  const all = await col.find({}).sort({ sortOrder: 1 }).toArray();
  const idx = all.findIndex((s) => s._id === id);
  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (idx < 0 || swapIdx < 0 || swapIdx >= all.length) return;

  await col.updateOne({ _id: all[idx]._id }, { $set: { sortOrder: all[swapIdx].sortOrder } });
  await col.updateOne({ _id: all[swapIdx]._id }, { $set: { sortOrder: all[idx].sortOrder } });
  refresh();
}

export async function moveServiceInGroup(id: string, direction: "up" | "down", categoryId: string | null) {
  const col = await getServicesCollection();
  const query = categoryId
    ? { categoryId }
    : { $or: [{ categoryId: { $exists: false } }, { categoryId: null }] };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const group = await col.find(query as any).sort({ sortOrder: 1 }).toArray();
  const idx = group.findIndex((s) => s._id === id);
  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (idx < 0 || swapIdx < 0 || swapIdx >= group.length) return;

  await col.updateOne({ _id: group[idx]._id }, { $set: { sortOrder: group[swapIdx].sortOrder } });
  await col.updateOne({ _id: group[swapIdx]._id }, { $set: { sortOrder: group[idx].sortOrder } });
  refresh();
}

// ── Categories ─────────────────────────────────────────────────────────

export async function createCategory(formData: FormData) {
  const name = (formData.get("name") as string).trim();
  if (!name) return;

  const col = await getCategoriesCollection();
  const last = await col.find({}).sort({ sortOrder: -1 }).limit(1).toArray();
  const order = last.length ? last[0].sortOrder + 1 : 0;

  await col.insertOne({ _id: generateId(name), name, sortOrder: order });
  refresh();
}

export async function updateCategory(id: string, formData: FormData) {
  const name = (formData.get("name") as string).trim();
  if (!name) return;

  const col = await getCategoriesCollection();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await col.updateOne({ _id: id } as any, { $set: { name } });
  refresh();
}

export async function deleteCategory(id: string) {
  // Unassign services in this category so they become uncategorized
  const serviceCol = await getServicesCollection();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await serviceCol.updateMany({ categoryId: id } as any, { $unset: { categoryId: "" } } as any);

  const col = await getCategoriesCollection();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await col.deleteOne({ _id: id } as any);
  refresh();
}

export async function moveCategory(id: string, direction: "up" | "down") {
  const col = await getCategoriesCollection();
  const all = await col.find({}).sort({ sortOrder: 1 }).toArray();
  const idx = all.findIndex((c) => c._id === id);
  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (idx < 0 || swapIdx < 0 || swapIdx >= all.length) return;

  await col.updateOne({ _id: all[idx]._id }, { $set: { sortOrder: all[swapIdx].sortOrder } });
  await col.updateOne({ _id: all[swapIdx]._id }, { $set: { sortOrder: all[idx].sortOrder } });
  refresh();
}

// ── Sub-services ───────────────────────────────────────────────────────

export async function createSubService(serviceId: string, formData: FormData) {
  const name = (formData.get("name") as string).trim();
  const minutes = parseFloat(formData.get("minutes") as string);
  if (!name || isNaN(minutes) || minutes <= 0) return;

  const col = await getServicesCollection();
  await col.updateOne(
    { _id: serviceId },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    { $push: { subServices: { id: generateId(name), name, durationSeconds: Math.round(minutes * 60) } } } as any
  );
  refresh();
}

export async function updateSubService(id: string, formData: FormData) {
  const name = (formData.get("name") as string).trim();
  const minutes = parseFloat(formData.get("minutes") as string);
  if (!name || isNaN(minutes) || minutes <= 0) return;

  const col = await getServicesCollection();
  await col.updateOne(
    { "subServices.id": id } as any, // eslint-disable-line @typescript-eslint/no-explicit-any
    { $set: { "subServices.$.name": name, "subServices.$.durationSeconds": Math.round(minutes * 60) } } as any // eslint-disable-line @typescript-eslint/no-explicit-any
  );
  refresh();
}

export async function deleteSubService(id: string) {
  const col = await getServicesCollection();
  await col.updateOne(
    { "subServices.id": id } as any, // eslint-disable-line @typescript-eslint/no-explicit-any
    { $pull: { subServices: { id } } } as any // eslint-disable-line @typescript-eslint/no-explicit-any
  );
  refresh();
}

export async function moveSubService(id: string, direction: "up" | "down") {
  const col = await getServicesCollection();
  const service = await col.findOne({ "subServices.id": id } as any); // eslint-disable-line @typescript-eslint/no-explicit-any
  if (!service) return;

  const subs = [...service.subServices];
  const idx = subs.findIndex((ss) => ss.id === id);
  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (idx < 0 || swapIdx < 0 || swapIdx >= subs.length) return;

  [subs[idx], subs[swapIdx]] = [subs[swapIdx], subs[idx]];
  await col.updateOne({ _id: service._id }, { $set: { subServices: subs } });
  refresh();
}

// ── PIN ────────────────────────────────────────────────────────────────

export async function verifyPin(pin: string): Promise<boolean> {
  const col = await getSettingsCollection();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const settings = await col.findOne({ _id: "settings" } as any);
  const correct = settings?.dashboardPin ?? "1337";
  return pin === correct;
}

export async function updatePin(newPin: string): Promise<void> {
  if (!/^\d{4}$/.test(newPin)) return;
  const col = await getSettingsCollection();
  await col.updateOne(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    { _id: "settings" } as any,
    { $set: { dashboardPin: newPin } },
    { upsert: true }
  );
}
