import { MongoClient, Collection } from "mongodb";

export interface SubServiceDoc {
  id: string;
  name: string;
  durationSeconds: number;
}

export interface ServiceDoc {
  _id: string;
  name: string;
  tagline: string;
  sortOrder: number;
  subServices: SubServiceDoc[];
}

const uri = process.env.MONGODB_URI!;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = new MongoClient(uri).connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  clientPromise = new MongoClient(uri).connect();
}

export async function getServicesCollection(): Promise<Collection<ServiceDoc>> {
  const client = await clientPromise;
  return client.db("liora").collection<ServiceDoc>("services");
}

export interface SettingsDoc {
  _id: string;
  dashboardPin: string;
}

export async function getSettingsCollection(): Promise<Collection<SettingsDoc>> {
  const client = await clientPromise;
  return client.db("liora").collection<SettingsDoc>("settings");
}
