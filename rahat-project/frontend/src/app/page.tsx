import { HomePage } from "@/components/home-page";

/** Pre-render "/" at build time (static HTML in .next/server/app) */
export const dynamic = "force-static";

export default function Home() {
  return <HomePage />;
}
