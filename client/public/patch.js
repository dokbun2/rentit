// React 애플리케이션에 패치 적용
(function() {
  // 서비스별 URL 매핑
  const serviceUrls = {
    '렌탈사 설립': 'https://jcob.dokbun2.com/',
    '렌탈업무 제휴': 'https://jcob.dokbun2.com/',
    '렌탈시스템 구축': 'https://jcob.dokbun2.com/',
    '렌탈 부업': 'https://jcob.dokbun2.com/'
  };

  // 주기적으로 DOM 검사 및 수정
  function applyPatches() {
    console.log('[패치] DOM 검사 중...');
    
    // 1. 모든 서비스 버튼 처리
    patchServiceButtons();
    
    // 2. 입력창 스타일 수정
    patchInputStyles();
    
    // 3초마다 패치 재적용 (React가 DOM을 다시 렌더링할 수 있기 때문)
    setTimeout(applyPatches, 1000);
  }
  
  // 모든 서비스 버튼 패치 - 방법 1: 직접 링크 추가
  function patchServiceButtons() {
    // 1. 모든 서비스 카드 컨테이너 찾기
    const allCards = findServiceCards();
    
    // 2. 각 카드별로 패치 적용
    allCards.forEach(card => {
      // 3. 카드 내용 및 서비스 타입 확인
      const cardText = card.textContent || '';
      let serviceType = '';
      
      // 4. 서비스 타입 결정
      for (const service of Object.keys(serviceUrls)) {
        if (cardText.includes(service)) {
          serviceType = service;
          break;
        }
      }
      
      if (!serviceType) return; // 서비스 타입을 찾지 못함
      
      // 5. 버튼 찾기
      const buttons = card.querySelectorAll('button');
      buttons.forEach(button => {
        if (button.textContent.trim() === '자세히 보기') {
          console.log(`[패치] 발견: ${serviceType} 버튼`);
          
          // 기존 버튼 숨기기
          button.style.display = 'none';
          
          // 새 링크 버튼 생성 및 추가
          if (!button.nextElementSibling || 
              !button.nextElementSibling.classList.contains('patched-link')) {
            addLinkButton(button, serviceType);
          }
        }
      });
    });
    
    // 방법 2: 전체 이벤트 리스너 제어
    overrideAllButtons();
  }
  
  // 모든 버튼의 클릭 이벤트 오버라이드
  function overrideAllButtons() {
    document.querySelectorAll('button').forEach(button => {
      if (button.textContent.trim() === '자세히 보기' && 
          !button.hasAttribute('data-override-applied')) {
        
        // 버튼에 클릭 이벤트 리스너 추가
        button.addEventListener('click', function(e) {
          // 부모 요소에서 서비스 타입 찾기
          let serviceType = '';
          let parent = this.parentElement;
          
          // 최대 5단계까지 부모 탐색
          for (let i = 0; i < 5 && parent; i++) {
            const text = parent.textContent || '';
            for (const service of Object.keys(serviceUrls)) {
              if (text.includes(service)) {
                serviceType = service;
                break;
              }
            }
            if (serviceType) break;
            parent = parent.parentElement;
          }
          
          if (serviceType) {
            e.preventDefault();
            e.stopPropagation();
            console.log(`[패치] 버튼 클릭 이벤트 오버라이드: ${serviceType}`);
            window.open(serviceUrls[serviceType], '_blank');
            return false;
          }
        }, true);
        
        button.setAttribute('data-override-applied', 'true');
      }
    });
    
    // 방법 3: document 레벨에서 전체 클릭 이벤트 가로채기
    if (!document.body.hasAttribute('data-click-capture')) {
      document.body.addEventListener('click', function(e) {
        // 클릭된 요소나 그 부모가 '자세히 보기' 버튼인지 확인
        let target = e.target;
        let isViewMoreButton = false;
        
        // 클릭 대상이 버튼인지 확인
        for (let i = 0; i < 5 && target; i++) {
          if (target.tagName === 'BUTTON' && 
              target.textContent.trim() === '자세히 보기') {
            isViewMoreButton = true;
            break;
          }
          target = target.parentElement;
        }
        
        if (isViewMoreButton) {
          // 버튼의 부모 요소에서 서비스 타입 찾기
          let serviceType = '';
          let parent = target.parentElement;
          
          // 최대 5단계까지 부모 탐색
          for (let i = 0; i < 8 && parent; i++) {
            const text = parent.textContent || '';
            for (const service of Object.keys(serviceUrls)) {
              if (text.includes(service)) {
                serviceType = service;
                break;
              }
            }
            if (serviceType) break;
            parent = parent.parentElement;
          }
          
          if (serviceType) {
            e.preventDefault();
            e.stopPropagation();
            console.log(`[패치] 전역 이벤트 가로채기: ${serviceType} 버튼 클릭`);
            window.open(serviceUrls[serviceType], '_blank');
            return false;
          }
        }
      }, true);
      
      document.body.setAttribute('data-click-capture', 'true');
    }
  }
  
  // 링크 버튼 추가 함수
  function addLinkButton(button, serviceType) {
    const targetUrl = serviceUrls[serviceType];
    
    // 링크 버튼 생성
    const link = document.createElement('a');
    link.href = targetUrl;
    link.target = '_blank';
    link.className = button.className + ' patched-link';
    link.textContent = '자세히 보기';
    link.setAttribute('data-service', serviceType);
    
    // 스타일 적용
    link.style.display = 'block';
    link.style.textAlign = 'center';
    link.style.padding = '8px 16px';
    link.style.borderRadius = '9999px';
    link.style.background = 'linear-gradient(to right, #8b5cf6, #a855f7)';
    link.style.color = 'white';
    link.style.fontWeight = '500';
    link.style.width = '100%';
    link.style.textDecoration = 'none';
    link.style.cursor = 'pointer';
    
    // 링크에 클릭 이벤트 명시적 추가
    link.onclick = function(e) {
      e.preventDefault();
      console.log(`[패치] 링크 클릭: ${serviceType} - ${targetUrl}`);
      window.open(targetUrl, '_blank');
      return false;
    };
    
    // 버튼 뒤에 링크 추가
    if (button.parentNode) {
      button.parentNode.insertBefore(link, button.nextSibling);
      console.log(`[패치] ${serviceType} 링크 버튼 추가됨 - ${targetUrl}`);
    }
  }
  
  // 서비스 카드 찾기 함수
  function findServiceCards() {
    const cards = [];
    const allDivs = document.querySelectorAll('div');
    
    allDivs.forEach(div => {
      const text = div.textContent || '';
      
      // 서비스 텍스트와 '자세히 보기' 텍스트를 모두 포함하는 div 찾기
      let containsService = false;
      for (const service of Object.keys(serviceUrls)) {
        if (text.includes(service)) {
          containsService = true;
          break;
        }
      }
      
      if (containsService && text.includes('자세히 보기')) {
        // 이미 찾은 카드의 자식이 아닌지 확인
        let isChildOfFoundCard = false;
        for (const card of cards) {
          if (card.contains(div)) {
            isChildOfFoundCard = true;
            break;
          }
        }
        
        // 부모 카드가 아직 없는 경우에만 추가
        if (!isChildOfFoundCard) {
          cards.push(div);
        }
      }
    });
    
    return cards;
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
      setTimeout(applyPatches, 500);
    });
  } else {
    setTimeout(applyPatches, 500);
  }
  
  // 페이지 내용이 변경될 때마다 추가 대응
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        // DOM이 변경되면 패치 재적용
        patchServiceButtons();
        patchInputStyles();
      }
    });
  });
  
  // 전체 문서 관찰 시작
  observer.observe(document.body, { childList: true, subtree: true });
  
  console.log('[패치] 초기화 완료 - 모든 자세히 보기 버튼이 jcob.dokbun2.com으로 연결됩니다.');
})(); 