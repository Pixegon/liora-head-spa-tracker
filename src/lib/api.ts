import { getServicesCollection, ServiceDoc } from "@/lib/db";
import { SERVICES } from "@/data/services";
import type { Service, ServicesResponse } from "@/lib/types";

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

export async function getServices(): Promise<ServicesResponse> {
  await ensureSeeded();
  const col = await getServicesCollection();
  const docs = await col.find({}).sort({ sortOrder: 1 }).toArray();
  return { services: docs.map(docToService) };
}

export async function getServiceById(id: string): Promise<Service | null> {
  const col = await getServicesCollection();
  const doc = await col.findOne({ _id: id });
  if (!doc) return null;
  return docToService(doc);
}
