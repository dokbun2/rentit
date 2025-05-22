import nodemailer from 'nodemailer';

// 서비스 값과 한글 라벨 매핑
const serviceMap: { [key: string]: string } = {
  establishment: "렌탈사 설립",
  partnership: "렌탈업무 제휴",
  system: "렌탈시스템 구축",
  parttime: "렌탈 부업",
  other: "기타",
};

// 서비스 값을 한글 라벨로 변환하는 함수
const getServiceLabel = (serviceValue: string): string => {
  return serviceMap[serviceValue] || serviceValue; // 매핑되지 않은 값은 그대로 반환
};

// 환경 변수에서 값 가져오기
const GMAIL_USER = process.env.GMAIL_USER as string;
const GMAIL_PASSWORD = process.env.GMAIL_PASSWORD as string;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL as string;

// 필수 환경 변수 확인
if (!GMAIL_USER || !GMAIL_PASSWORD || !ADMIN_EMAIL) {
  console.error('FATAL ERROR: Missing environment variables for email service');
  // 애플리케이션이 시작되지 않도록 프로세스 종료 또는 적절한 오류 처리
  process.exit(1); // 환경 변수가 없으면 프로세스 종료
}

// 이메일 전송을 위한 트랜스포터 설정
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // SSL
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_PASSWORD
  },
  debug: true, // 디버그 모드 활성화
  logger: true  // 로깅 활성화
});

// 이메일 전송 함수
export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    // SMTP 연결 테스트
    await transporter.verify();
    console.log('SMTP 서버 연결 성공!');

    const mailOptions = {
      from: `"렌잇 고객센터" <${GMAIL_USER}>`,
      to,
      subject,
      html
    };

    console.log('이메일 전송 시도...', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject
    });

    const info = await transporter.sendMail(mailOptions);
    console.log('이메일 전송 성공:', info.messageId);
    return true;
  } catch (error: any) {
    console.error('이메일 전송 실패:', error);
    throw new Error(`이메일 전송 실패: ${error.message}`);
  }
};

// 관리자에게 상담 신청 알림 보내기
export const sendContactNotification = async (formData: {
  name: string;
  phone: string;
  email: string;
  service: string;
  message: string;
}) => {
  const { name, phone, email, service, message } = formData;
  
  const emailContent = `
    <h2>새로운 상담 신청이 접수되었습니다</h2>
    <p><strong>이름:</strong> ${name}</p>
    <p><strong>연락처:</strong> ${phone}</p>
    <p><strong>이메일:</strong> ${email}</p>
    <p><strong>관심 서비스:</strong> ${getServiceLabel(service)}</p>
    <p><strong>문의 내용:</strong> ${message}</p>
    <p><strong>접수 시간:</strong> ${new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}</p>
    <hr>
    <p>* 이 이메일은 자동으로 발송되었습니다.</p>
  `;

  return sendEmail(
    ADMIN_EMAIL,
    `[렌잇] 새로운 상담 신청 - ${name}님`,
    emailContent
  );
};

// 고객에게 상담 신청 접수 확인 이메일 보내기
export const sendConfirmationEmail = async (formData: {
  name: string;
  email: string;
  service: string;
}) => {
  const { name, email, service } = formData;
  
  const emailContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #8b5cf6;">렌잇 상담 신청이 접수되었습니다</h2>
      <p>${name}님, 상담 신청해 주셔서 감사합니다.</p>
      <p>귀하의 <strong>${getServiceLabel(service)}</strong> 관련 문의가 성공적으로 접수되었습니다.</p>
      <p>영업일 기준 1-2일 내에 담당자가 연락드릴 예정입니다.</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="color: #666; font-size: 14px;">
        추가 문의사항이 있으시면 언제든지 <a href="mailto:ceo@rnpick.co.kr" style="color: #8b5cf6;">ceo@rnpick.co.kr</a>로 연락주세요.
      </p>
      <div style="margin-top: 30px; text-align: center; color: #888; font-size: 12px;">
        <p>© 2025 렌잇. 모든 권리 보유.</p>
        <p>서울 성동구 아차산로17길 49(성수동2가) 15층 1504호</p>
      </div>
    </div>
  `;

  return sendEmail(
    email,
    `[렌잇] ${name}님의 상담 신청이 접수되었습니다`,
    emailContent
  );
};

// 테스트 실행
const testEmailService = async () => {
  const testData = {
    name: "테스트",
    phone: "010-1234-5678",
    email: "test@example.com",
    service: "테스트 서비스",
    message: "테스트 메시지"
  };

  try {
    // 관리자 알림 이메일 전송
    await sendContactNotification(testData);
    console.log("관리자 알림 이메일 전송 성공");

    // 고객 확인 이메일 전송
    await sendConfirmationEmail({
      name: testData.name,
      email: testData.email,
      service: testData.service
    });
    console.log("고객 확인 이메일 전송 성공");

    return true;
  } catch (error) {
    console.error("이메일 전송 테스트 실패:", error);
    return false;
  }
};

// 직접 실행 시 테스트 실행
if (import.meta.url === `file://${process.argv[1]}`) {
  testEmailService().then(console.log).catch(console.error);
} 