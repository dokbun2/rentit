import { News } from "@/types/news";

export async function getNews(): Promise<News[]> {
  const response = await fetch("/api/news");
  if (!response.ok) {
    throw new Error("Failed to fetch news");
  }
  return response.json();
} 