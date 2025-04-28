"use client";

import WebHero from "@/components/website/WebHero";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center px-4">
      <WebHero />
      <div className="text-center text-gray-500 mt-10">
        &copy; {new Date().getFullYear()} OratorsBase. All rights reserved.
      </div>
    </main>
  );
}
