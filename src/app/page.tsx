import { getServices } from "@/lib/api";
import SelectionView from "@/components/SelectionView";

export default async function HomePage() {
  const { services } = await getServices();
  return <SelectionView services={services} />;
}
