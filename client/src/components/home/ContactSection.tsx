import { motion } from "framer-motion";
import { useState } from "react";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin,
  BookOpen
} from "lucide-react";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { fadeIn } from "@/lib/motion";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import GlassEffect from "@/components/ui/glass-effect";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/lib/supabase";

const formSchema = z.object({
  name: z.string().min(2, { message: "이름을 입력해주세요" }),
  phone: z.string().min(10, { message: "연락처를 입력해주세요" }),
  email: z.string().email({ message: "유효한 이메일 주소를 입력해주세요" }),
  service: z.string().min(1, { message: "관심 서비스를 선택해주세요" }),
  message: z.string().min(10, { message: "문의 내용을 10자 이상 입력해주세요" }),
  privacy: z.boolean().refine(val => val === true, { message: "개인정보 수집에 동의해주세요" }),
});

type FormValues = z.infer<typeof formSchema>;

const ContactSection = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      service: "",
      message: "",
      privacy: false,
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      // privacy 필드를 제외한 데이터 준비
      const { privacy, ...contactData } = data;
      
      console.log('전송할 데이터:', contactData);
      
      // 현재 시간을 ISO 문자열로 추가
      const contactWithTimestamp = {
        ...contactData,
        created_at: new Date().toISOString(),
        is_processed: false
      };
      
      // Supabase API 직접 사용
      if (!supabase) {
        throw new Error('Supabase 클라이언트가 초기화되지 않았습니다');
      }
      
      const { error } = await supabase
        .from('contact_submissions')
        .insert([contactWithTimestamp]);
      
      if (error) {
        console.error('Supabase 오류:', error);
        throw new Error(error.message || '데이터 저장 중 오류가 발생했습니다');
      }
      
      toast({
        title: "상담 신청이 완료되었습니다",
        description: "빠른 시일 내에 연락드리겠습니다.",
      });
      form.reset();
    } catch (error) {
      console.error('상담 신청 오류:', error);
      toast({
        title: "오류가 발생했습니다",
        description: error instanceof Error ? error.message : "잠시 후 다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-20 dark-lighter relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-radial from-primary/10 to-transparent opacity-70"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          className="text-center mb-16"
        >
          <motion.h2 
            variants={fadeIn("up", 0.1)}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            문의 <span className="text-primary">하기</span>
          </motion.h2>
          <motion.p 
            variants={fadeIn("up", 0.2)}
            className="text-gray-400 max-w-2xl mx-auto"
          >
            렌탈 비즈니스에 대한 궁금증이나 상담 요청은 아래 양식으로 연락주세요.
          </motion.p>
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.1 }}
            variants={fadeIn("right", 0.3)}
          >
            {/* Contact Information */}
            <GlassEffect className="rounded-xl p-8 mb-8">
              <h3 className="text-2xl font-bold mb-6">REN'T</h3>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mr-4">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white mb-1">주소</h4>
                    <p className="text-gray-400">서울 성동구 아차산로17길 49(성수동2가) 15층 1504호</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mr-4">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white mb-1">전화번호</h4>
                    <p className="text-gray-400">010-3180-0038</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mr-4">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white mb-1">이메일</h4>
                    <p className="text-gray-400">ceo@rnpick.co.kr</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mr-4">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white mb-1">영업시간</h4>
                    <p className="text-gray-400">월-금: 09:00 - 18:00<br/>토, 일, 공휴일: 휴무</p>
                  </div>
                </div>
              </div>
            </GlassEffect>
            
            {/* Social Media Links */}
            <GlassEffect className="rounded-xl p-8">
              <h3 className="text-xl font-bold mb-6">소셜 미디어</h3>
              
              <div className="flex space-x-4">
                <a href="#" className="w-12 h-12 rounded-full bg-background flex items-center justify-center text-gray-400 hover:text-primary hover:bg-dark-light transition-all">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="#" className="w-12 h-12 rounded-full bg-background flex items-center justify-center text-gray-400 hover:text-primary hover:bg-dark-light transition-all">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="#" className="w-12 h-12 rounded-full bg-background flex items-center justify-center text-gray-400 hover:text-primary hover:bg-dark-light transition-all">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="#" className="w-12 h-12 rounded-full bg-background flex items-center justify-center text-gray-400 hover:text-primary hover:bg-dark-light transition-all">
                  <Linkedin className="h-5 w-5" />
                </a>
                <a href="#" className="w-12 h-12 rounded-full bg-background flex items-center justify-center text-gray-400 hover:text-primary hover:bg-dark-light transition-all">
                  <BookOpen className="h-5 w-5" />
                </a>
              </div>
            </GlassEffect>
          </motion.div>
          
          {/* Contact Form */}
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.1 }}
            variants={fadeIn("left", 0.3)}
          >
            <GlassEffect className="rounded-xl p-8">
              <h3 className="text-2xl font-bold mb-6">무료 상담 신청</h3>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-400">이름 *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="이름을 입력하세요" 
                              className="bg-white border-gray-700 focus:border-primary" 
                              style={{color: 'black'}}
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-400">연락처 *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="연락처를 입력하세요" 
                              className="bg-white border-gray-700 focus:border-primary" 
                              style={{color: 'black'}}
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-400">이메일 *</FormLabel>
                        <FormControl>
                          <Input 
                            type="email" 
                            placeholder="이메일을 입력하세요" 
                            className="bg-white border-gray-700 focus:border-primary" 
                            style={{color: 'black'}}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="service"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-400">관심 서비스 *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-white border-gray-700 focus:border-primary" style={{color: 'black'}}>
                              <SelectValue placeholder="선택해주세요" style={{color: 'black'}} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-white border-gray-700" style={{color: 'black'}}>
                            <SelectItem value="establishment" style={{color: 'black'}}>렌탈사 설립</SelectItem>
                            <SelectItem value="partnership" style={{color: 'black'}}>렌탈업무 제휴</SelectItem>
                            <SelectItem value="system" style={{color: 'black'}}>렌탈시스템 구축</SelectItem>
                            <SelectItem value="parttime" style={{color: 'black'}}>렌탈 부업</SelectItem>
                            <SelectItem value="other" style={{color: 'black'}}>기타</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-400">문의 내용 *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="문의 내용을 입력하세요" 
                            className="bg-white border-gray-700 focus:border-primary min-h-[120px]" 
                            style={{color: 'black'}}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="privacy"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox 
                            checked={field.value} 
                            onCheckedChange={field.onChange} 
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-gray-400 text-sm">
                            개인정보 수집 및 이용에 동의합니다. *
                          </FormLabel>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full py-6 bg-gradient-to-r from-primary to-purple-500 rounded-lg text-white font-medium hover:shadow-lg hover:shadow-primary/30 transition-all"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "처리 중..." : "상담 신청하기"}
                  </Button>
                </form>
              </Form>
            </GlassEffect>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
