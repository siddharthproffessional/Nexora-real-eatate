import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SiteNotFound() {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-start justify-center py-24">
      <p className="tabular text-[14px] text-gold-deep">Error 404</p>
      <h1 className="display mt-3 text-[2.6rem] sm:text-[3.6rem]">This page could not be found</h1>
      <p className="mt-4 max-w-[52ch] text-[16.5px] leading-relaxed text-slate">
        The listing may have been sold, let or withdrawn, or the link may be mistyped. Try searching current properties instead.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/properties">Search properties</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Go to the homepage</Link>
        </Button>
      </div>
    </div>
  );
}
