import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { AmbientBand } from "@/components/ornaments";
import { Catalog } from "@/components/Catalog";

export default function HomePage() {
  return (
    <>
      <AmbientBand />
      <SiteHeader active="library" />
      <main id="main">
        <Catalog />
      </main>
      <SiteFooter />
    </>
  );
}
