import type { Route } from "./+types/home";
import HomeHero from "../components/HomeHero";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "FreshMart — Fresh groceries, smarter shopping" },
    { name: "description", content: "Browse products with realtime updates and share feedback. Admins get insights and price trends." },
  ];
}

export default function Home() {
  return <HomeHero />;
}
