// React 애플리케이션에 패치 적용
(function() {
  // 주기적으로 DOM 검사 및 수정
  function applyPatches() {
    console.log('[패치] DOM 검사 중...');
    
    // 1. 렌탈시스템 구축 버튼 처리
    patchRentalSystemButton();
    
    // 2. 입력창 스타일 수정
    patchInputStyles();
    
    // 3초마다 패치 재적용 (React가 DOM을 다시 렌더링할 수 있기 때문)
    setTimeout(applyPatches, 3000);
  }
  
  // 렌탈시스템 구축 버튼 패치
  function patchRentalSystemButton() {
    // 1) 모든 서비스 컨테이너 검색
    const serviceDivs = document.querySelectorAll('div');
    
    serviceDivs.forEach(div => {
      // 텍스트 내용에 "렌탈시스템 구축"이 포함된 div 찾기
      const textContent = div.textContent || '';
      if (textContent.includes('렌탈시스템 구축') && textContent.includes('자세히 보기')) {
        // 해당 div 내부의 모든 버튼 찾기
        const buttons = div.querySelectorAll('button');
        buttons.forEach(button => {
          if (button.textContent.trim() === '자세히 보기' && !button.hasAttribute('data-patched')) {
            // 원래 이벤트 제거를 위한 복제 및 교체
            const newButton = button.cloneNode(true);
            newButton.setAttribute('data-patched', 'true');
            
            // 새 버튼에 이벤트 핸들러 추가
            newButton.addEventListener('click', function(e) {
              e.preventDefault();
              e.stopPropagation();
              console.log('[패치] 렌탈시스템 구축 버튼 클릭 - 외부 링크로 이동');
              window.open('https://jcob.dokbun2.com/', '_blank');
              return false;
            }, true);
            
            // 버튼 교체
            if (button.parentNode) {
              button.parentNode.replaceChild(newButton, button);
              console.log('[패치] 렌탈시스템 구축 버튼 패치 적용됨');
            }
          }
        });
        
        // 또는 a 태그 직접 추가
        if (buttons.length > 0 && !div.querySelector('a[href="https://jcob.dokbun2.com/"]')) {
          const button = buttons[0];
          if (button.parentNode) {
            const link = document.createElement('a');
            link.href = 'https://jcob.dokbun2.com/';
            link.target = '_blank';
            link.className = button.className;
            link.textContent = '자세히 보기';
            link.style.display = 'block';
            link.style.textAlign = 'center';
            link.style.padding = '8px 16px';
            link.style.borderRadius = '9999px';
            link.style.background = 'linear-gradient(to right, #8b5cf6, #a855f7)';
            link.style.color = 'white';
            link.style.fontWeight = '500';
            link.style.width = '100%';
            link.style.textDecoration = 'none';
            
            button.style.display = 'none';
            button.parentNode.insertBefore(link, button);
            console.log('[패치] 렌탈시스템 구축 링크 추가됨');
          }
        }
      }
    });
  }
  
  // 입력창 스타일 패치
  function patchInputStyles() {
    // 모든 입력 요소(input, textarea, select) 찾기
    const inputs = document.querySelectorAll('input, textarea, select');
    
    inputs.forEach(input => {
      if (!input.hasAttribute('data-style-patched')) {
        // 인라인 스타일 적용
        input.style.color = 'black';
        input.style.backgroundColor = 'white';
        
        // 중요! 속성 설정으로 스타일을 강제 적용
        input.setAttribute('style', input.getAttribute('style') + '; color: black !important; background-color: white !important;');
        input.setAttribute('data-style-patched', 'true');
        
        console.log('[패치] 입력창 스타일 수정됨:', input);
        
        // 선택자 값도 스타일 변경
        if (input.tagName.toLowerCase() === 'select') {
          const options = input.querySelectorAll('option');
          options.forEach(option => {
            option.style.color = 'black';
            option.style.backgroundColor = 'white';
          });
        }
      }
    });
  }
  
  // 페이지 로드 시 최초 실행
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      setTimeout(applyPatches, 1000);
    });
  } else {
    setTimeout(applyPatches, 1000);
  }
  
  // 페이지 내용이 변경될 때마다 추가 대응
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        // DOM이 변경되면 패치 재적용
        patchRentalSystemButton();
        patchInputStyles();
      }
    });
  });
  
  // 전체 문서 관찰 시작
  observer.observe(document.body, { childList: true, subtree: true });
  
  console.log('[패치] 초기화 완료');
})(); 