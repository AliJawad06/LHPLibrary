import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { AmbientBand } from "@/components/ornaments";
import { AdminPanel } from "@/components/AdminPanel";

export const metadata = { title: "Librarian desk — The Light House Project Library" };

export default function AdminPage() {
  return (
    <>
      <AmbientBand />
      <SiteHeader active="admin" />
      <main className="page">
        <AdminPanel />
      </main>
      <SiteFooter />
    </>
  );
}
