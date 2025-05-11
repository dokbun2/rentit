export interface News {
  id: number;
  title: string;
  content: string;
  category?: string;
  tag?: string;
  tag_color?: string;
  image_url?: string;
  link?: string;
  created_at: string;
  active: boolean;
} 