import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getNews } from "@/lib/api/news";
import { News } from "@/types/news";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function RentalNews() {
  const [, setLocation] = useLocation();
  const { data: news, isLoading } = useQuery<News[]>({
    queryKey: ["news"],
    queryFn: getNews,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-foreground">렌탈 뉴스</h1>
          <Button
            variant="outline"
            onClick={() => setLocation("/")}
            className="hover:bg-primary hover:text-white transition-colors"
          >
            홈으로 돌아가기
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news?.map((item) => (
            <div
              key={item.id}
              className="bg-card rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              {item.image_url && (
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-2 text-foreground">
                  {item.title}
                </h2>
                <p className="text-muted-foreground mb-4 line-clamp-3">
                  {item.content}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    {formatDate(item.created_at)}
                  </span>
                  <Button
                    variant="ghost"
                    onClick={() => window.open(item.link, "_blank")}
                    className="text-primary hover:text-primary/80"
                  >
                    자세히 보기
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 