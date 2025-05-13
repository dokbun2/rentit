import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// src 디렉토리 위치
const srcDir = path.join(__dirname, 'client', 'src');

// 파일 확장자 필터링
const extensions = ['.ts', '.tsx', '.js', '.jsx'];

// 모든 파일을 재귀적으로 찾는 함수
function findFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      findFiles(filePath, fileList);
    } else if (extensions.includes(path.extname(file))) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// 경로 변환 함수 (절대 경로를 상대 경로로)
function convertToRelativePath(filePath, importPath) {
  // @/로 시작하는 import 경로에서 @/를 제거
  const targetPath = importPath.replace('@/', '');
  
  // 현재 파일이 있는 디렉토리
  const fileDir = path.dirname(filePath);
  
  // client/src 디렉토리를 기준으로 상대 경로 계산
  const relativePath = path.relative(fileDir, path.join(srcDir, targetPath));
  
  // 상대 경로가 현재 디렉토리에서 시작하지 않으면 ./를 추가
  let result = relativePath.startsWith('.') ? relativePath : './' + relativePath;
  
  // Windows에서는 경로 구분자를 /로 변경
  result = result.replace(/\\/g, '/');
  
  return result;
}

// 파일의 import 문을 변경하는 함수
function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    let modified = false;
    
    // @/ 로 시작하는 import 문을 찾아 상대 경로로 변경
    const importRegex = /import\s+(.+)\s+from\s+["'](@\/.+)["']/g;
    
    content = content.replace(importRegex, (match, imports, importPath) => {
      modified = true;
      const relativePath = convertToRelativePath(filePath, importPath);
      return `import ${imports} from "${relativePath}"`;
    });
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`수정됨: ${filePath}`);
    }
  } catch (error) {
    console.error(`파일 처리 오류 (${filePath}):`, error);
  }
}

// 메인 함수
function main() {
  const files = findFiles(srcDir);
  let modifiedCount = 0;
  
  files.forEach(file => {
    const beforeContent = fs.readFileSync(file, 'utf-8');
    processFile(file);
    const afterContent = fs.readFileSync(file, 'utf-8');
    
    if (beforeContent !== afterContent) {
      modifiedCount++;
    }
  });
  
  console.log(`총 ${files.length}개 파일 중 ${modifiedCount}개 파일 수정됨`);
}

main(); 