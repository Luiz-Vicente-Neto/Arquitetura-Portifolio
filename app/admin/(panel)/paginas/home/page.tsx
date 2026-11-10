import { readDb } from "@/lib/db";
import HomeForm from "./HomeForm";

export default function HomeContentPage() {
  return <HomeForm initial={readDb().home} />;
}
