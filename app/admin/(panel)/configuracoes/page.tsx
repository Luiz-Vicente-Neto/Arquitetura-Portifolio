import { getSettings } from "@/lib/db";
import SettingsForm from "./SettingsForm";

export default async function SettingsPage() {
  return <SettingsForm initial={await getSettings()} />;
}
