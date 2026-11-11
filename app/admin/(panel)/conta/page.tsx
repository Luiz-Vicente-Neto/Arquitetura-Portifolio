import { getUser } from "@/lib/db";
import AccountForm from "./AccountForm";

export default async function AccountPage() {
  const user = await getUser();
  return <AccountForm name={user.name} email={user.email} isDefault={user.isDefaultPassword} />;
}
