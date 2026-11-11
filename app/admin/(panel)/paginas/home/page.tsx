import { getHome } from "@/lib/db";
import HomeForm from "./HomeForm";

export default async function HomeContentPage() {
  return <HomeForm initial={await getHome()} />;
}
