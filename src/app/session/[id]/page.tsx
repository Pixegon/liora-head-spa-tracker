import { notFound } from "next/navigation";
import { getServiceById } from "@/lib/api";
import SessionView from "@/components/SessionView";

interface Props {
  params: { id: string };
}

export default async function SessionPage({ params }: Props) {
  const service = await getServiceById(params.id);
  if (!service) notFound();
  return <SessionView service={service} />;
}
