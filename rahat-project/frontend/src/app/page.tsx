import { HomePage } from "@/components/home-page";

/** Pre-render home at build time so Netlify/CDN always serves "/" */
export const dynamic = "force-static";

export default function Page() {
  return <HomePage />;
}
