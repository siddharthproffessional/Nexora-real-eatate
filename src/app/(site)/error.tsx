"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SiteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  React.useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-start justify-center py-24">
      <h1 className="display text-[2.4rem] sm:text-[3.2rem]">This page didn&rsquo;t load</h1>
      <p className="mt-4 max-w-[52ch] text-[16.5px] leading-relaxed text-slate">
        Something went wrong on our side while loading this page. Try again, or contact us if it keeps happening.
        {error.digest ? <span className="mt-2 block text-[13px]">Reference: {error.digest}</span> : null}
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button onClick={() => reset()}>Try again</Button>
        <Button asChild variant="outline">
          <Link href="/contact">Contact us</Link>
        </Button>
      </div>
    </div>
  );
}
