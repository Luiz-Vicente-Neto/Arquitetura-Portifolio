import { db } from "@/lib/db";
import Inbox from "./Inbox";

export default async function MessagesPage() {
  return <Inbox messages={await (await db()).listMessages()} />;
}
