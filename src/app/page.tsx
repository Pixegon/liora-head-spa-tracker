import { getServices, getCategories } from "@/lib/api";
import SelectionView from "@/components/SelectionView";

export default async function HomePage() {
  const [{ services }, { categories }] = await Promise.all([getServices(), getCategories()]);
  return <SelectionView services={services} categories={categories} />;
}
