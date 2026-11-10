import { readDb } from "@/lib/db";
import AboutForm from "./AboutForm";

export default function AboutContentPage() {
  return <AboutForm initial={readDb().about} />;
}
