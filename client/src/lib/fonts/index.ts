// 폰트 가중치 유틸리티
export type FontWeight = 
  | 'thin' 
  | 'extralight' 
  | 'light' 
  | 'regular' 
  | 'medium' 
  | 'semibold' 
  | 'bold' 
  | 'extrabold' 
  | 'black';

export const fontWeightMap: Record<FontWeight, number> = {
  thin: 100,
  extralight: 200,
  light: 300,
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
  black: 900
};

// 폰트 클래스를 동적으로 생성하는 유틸리티 함수
export const getPaperlogyStyle = (weight: FontWeight = 'regular', fontSize?: string): string => {
  return `font-paperlogy font-${weight} ${fontSize ? `text-[${fontSize}]` : ''}`.trim();
};