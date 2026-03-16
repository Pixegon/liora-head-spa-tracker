import { getServicesCollection, getCategoriesCollection, ServiceDoc } from "@/lib/db";
import { SERVICES } from "@/data/services";
import type { Service, Category, ServicesResponse } from "@/lib/types";

function docToService(doc: ServiceDoc): Service {
  return {
    id: doc._id,
    name: doc.name,
    tagline: doc.tagline,
    totalDurationSeconds: doc.subServices.reduce((sum, ss) => sum + ss.durationSeconds, 0),
    subServices: doc.subServices.map((ss) => ({
      id: ss.id,
      name: ss.name,
      durationSeconds: ss.durationSeconds,
    })),
    ...(doc.categoryId ? { categoryId: doc.categoryId } : {}),
  };
}

async function ensureSeeded() {
  const col = await getServicesCollection();
  const count = await col.countDocuments();
  if (count > 0) return;

  const docs = SERVICES.map((s, i) => ({
    _id: s.id,
    name: s.name,
    tagline: s.tagline,
    sortOrder: i,
    subServices: s.subServices.map((ss) => ({
      id: ss.id,
      name: ss.name,
      durationSeconds: ss.durationSeconds,
    })),
  }));

  await col.insertMany(docs);
}

// Timer screen — only enabled services
export async function getServices(): Promise<ServicesResponse> {
  await ensureSeeded();
  const col = await getServicesCollection();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const docs = await col.find({ enabled: { $ne: false } } as any).sort({ sortOrder: 1 }).toArray();
  return { services: docs.map(docToService) };
}

// Dashboard — all services including disabled
export async function getAllServices(): Promise<{ services: (Service & { enabled: boolean })[] }> {
  await ensureSeeded();
  const col = await getServicesCollection();
  const docs = await col.find({}).sort({ sortOrder: 1 }).toArray();
  return {
    services: docs.map((doc) => ({
      ...docToService(doc),
      enabled: doc.enabled !== false,
    })),
  };
}

export async function getServiceById(id: string): Promise<Service | null> {
  const col = await getServicesCollection();
  const doc = await col.findOne({ _id: id });
  if (!doc) return null;
  return docToService(doc);
}

export async function getCategories(): Promise<{ categories: Category[] }> {
  const col = await getCategoriesCollection();
  const docs = await col.find({}).sort({ sortOrder: 1 }).toArray();
  return {
    categories: docs.map((doc) => ({
      id: doc._id,
      name: doc.name,
      sortOrder: doc.sortOrder,
    })),
  };
}
