// 페이지가 로드된 후 실행
document.addEventListener('DOMContentLoaded', function() {
  // 1. 렌탈시스템 구축 버튼 찾기
  setTimeout(function() {
    // 모든 버튼 요소 순회
    document.querySelectorAll('button').forEach(button => {
      // 텍스트가 "자세히 보기"이고 부모 요소에 "렌탈시스템 구축" 텍스트가 포함된 경우
      if (button.textContent.trim() === '자세히 보기') {
        const parentText = button.closest('div').textContent;
        if (parentText.includes('렌탈시스템 구축')) {
          // 버튼 클릭 이벤트 변경
          button.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            window.open('https://jcob.dokbun2.com/', '_blank');
            return false;
          };
          console.log('렌탈시스템 구축 버튼의 클릭 이벤트가 수정되었습니다.');
        }
      }
    });

    // 2. 입력창 스타일 수정
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      input.style.color = 'black';
      input.style.backgroundColor = 'white';
    });
    console.log('입력창 스타일이 수정되었습니다.');
  }, 1000);
}); 