import { readDb } from "@/lib/db";
import Inbox from "./Inbox";

export default function MessagesPage() {
  const messages = [...readDb().messages].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return <Inbox messages={messages} />;
}
