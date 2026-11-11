import { redirect } from "next/navigation";

/** A antiga página "Escritório" virou "Sobre". Mantém os links antigos funcionando. */
export default function LegacyAboutPage() {
  redirect("/sobre");
}
