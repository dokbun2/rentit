// DOM이 완전히 로드된 후 실행
document.addEventListener('DOMContentLoaded', function() {
  // 스크롤 이벤트 처리
  window.addEventListener('scroll', function() {
    // 헤더에 스크롤 클래스 토글
    const header = document.querySelector('header');
    if (window.scrollY > 100) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // 문의하기 폼 제출 이벤트
  const inquiryForm = document.getElementById('inquiryForm');
  if (inquiryForm) {
    inquiryForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // 폼 데이터 수집
      const formData = {
        name: document.getElementById('name').value,
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value,
        service: document.getElementById('service').value,
        message: document.getElementById('message').value
      };
      
      // 폼 제출 성공 메시지
      alert('문의가 성공적으로 접수되었습니다. 빠른 시일 내에 연락드리겠습니다.');
      
      // 폼 초기화
      inquiryForm.reset();
      
      // 여기에 실제 API 호출이나 데이터 처리 로직이 들어갈 수 있습니다.
      console.log('폼 데이터:', formData);
    });
  }

  // 스무스 스크롤 구현
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 80, // 헤더 높이 고려
          behavior: 'smooth'
        });
      }
    });
  });

  // 반응형 메뉴 토글 버튼 처리 
  // (HTML에는 버튼이 없지만, 미래에 추가될 수 있으므로 미리 코드 작성)
  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('nav');
  
  if (menuToggle && nav) {
    menuToggle.addEventListener('click', function() {
      nav.classList.toggle('active');
      menuToggle.classList.toggle('active');
    });
  }
}); 