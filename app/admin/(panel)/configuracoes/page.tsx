import { readDb } from "@/lib/db";
import SettingsForm from "./SettingsForm";

export default function SettingsPage() {
  return <SettingsForm initial={readDb().settings} />;
}
