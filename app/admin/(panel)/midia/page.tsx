import { readDb } from "@/lib/db";
import MediaLibrary from "./MediaLibrary";

export default function MediaPage() {
  return <MediaLibrary items={readDb().media} />;
}
