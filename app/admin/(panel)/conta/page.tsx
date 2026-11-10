import { readDb } from "@/lib/db";
import AccountForm from "./AccountForm";

export default function AccountPage() {
  const { user } = readDb();
  return <AccountForm name={user.name} email={user.email} isDefault={user.isDefaultPassword} />;
}
