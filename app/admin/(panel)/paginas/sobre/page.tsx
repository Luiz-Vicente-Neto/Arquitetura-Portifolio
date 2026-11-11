import { getAbout } from "@/lib/db";
import AboutForm from "./AboutForm";

export default async function AboutContentPage() {
  return <AboutForm initial={await getAbout()} />;
}
