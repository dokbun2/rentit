import { cn } from "./utils";

const getPaperlogyStyle = (weight: 'thin' | 'extralight' | 'light' | 'regular' | 'medium' | 'semibold' | 'bold' | 'extrabold' | 'black') => {
  const weightMap = {
    thin: 'font-paperlogy-thin',
    extralight: 'font-paperlogy-extralight',
    light: 'font-paperlogy-light',
    regular: 'font-paperlogy-regular',
    medium: 'font-paperlogy-medium',
    semibold: 'font-paperlogy-semibold',
    bold: 'font-paperlogy-bold',
    extrabold: 'font-paperlogy-extrabold',
    black: 'font-paperlogy-black'
  };

  return weightMap[weight];
};

export { getPaperlogyStyle }; 