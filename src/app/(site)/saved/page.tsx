import type { Metadata } from "next";
import { PageIntro } from "@/components/site/page-intro";
import { SavedList } from "./saved-list";

export const metadata: Metadata = {
  title: "Saved properties",
  description: "Properties you have saved on this device.",
  robots: { index: false },
};

export default function SavedPage() {
  return (
    <>
      <PageIntro title="Saved properties" intro="Properties you save are kept in this browser on this device. No account is needed." />
      <div className="container-page py-14 lg:py-16">
        <SavedList />
      </div>
    </>
  );
}
