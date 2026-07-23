import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { AmbientBand } from "@/components/ornaments";
import { MyShelf } from "@/components/MyShelf";

export const metadata = { title: "My shelf — The Light House Project Library" };

export default function AccountPage() {
  return (
    <>
      <AmbientBand />
      <SiteHeader active="account" />
      <main className="page">
        <MyShelf />
      </main>
      <SiteFooter />
    </>
  );
}
