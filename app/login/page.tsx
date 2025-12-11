import Image from "next/image"
import { LoginForm } from "@/components/login-form"
import { BookOpen, GraduationCap, Award, TrendingUp } from "lucide-react"

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2 bg-gray-50">
      {/* Left section with background video and floating cards */}
      <div className="bg-gradient-to-br from-yellow-50 to-amber-50 relative hidden lg:flex items-center justify-center overflow-hidden">
        {/* Background video */}
        <div className="absolute inset-0 w-full h-full">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source src="/someone typing.mp4" type="video/mp4" />
          </video>
          {/* Overlay for better readability */}
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-50/80 to-amber-50/80" />
        </div>
        
        {/* Floating cards */}
        <div className="absolute top-20 left-10 animate-float z-10">
          <div className="bg-black/60 backdrop-blur-md rounded-2xl p-5 shadow-xl border border-white/20 max-w-[220px] hover:shadow-2xl transition-shadow duration-300">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold text-sm text-white">تعلم مهارات جديدة</h3>
            </div>
            <p className="text-xs text-white/90 leading-relaxed">اكتشف آلاف الدورات التعليمية</p>
          </div>
        </div>

        <div className="absolute top-40 right-16 animate-float-delay z-10">
          <div className="bg-black/60 backdrop-blur-md rounded-2xl p-5 shadow-xl border border-white/20 max-w-[220px] hover:shadow-2xl transition-shadow duration-300">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold text-sm text-white">شهادات معتمدة</h3>
            </div>
            <p className="text-xs text-white/90 leading-relaxed">احصل على شهادات معترف بها</p>
          </div>
        </div>

        <div className="absolute bottom-32 left-16 animate-float-delay-2 z-10">
          <div className="bg-black/60 backdrop-blur-md rounded-2xl p-5 shadow-xl border border-white/20 max-w-[220px] hover:shadow-2xl transition-shadow duration-300">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-500 to-amber-500">
                <Award className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold text-sm text-white">تطوير المسيرة</h3>
            </div>
            <p className="text-xs text-white/90 leading-relaxed">ارتقِ بمستوى مهاراتك المهنية</p>
          </div>
        </div>

        <div className="absolute bottom-20 right-10 animate-float z-10">
          <div className="bg-black/60 backdrop-blur-md rounded-2xl p-5 shadow-xl border border-white/20 max-w-[220px] hover:shadow-2xl transition-shadow duration-300">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-green-600">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold text-sm text-white">تقدم مستمر</h3>
            </div>
            <p className="text-xs text-white/90 leading-relaxed">تابع تقدمك في التعلم</p>
          </div>
        </div>
      </div>
      
      {/* Right section with form */}
      <div className="flex flex-col gap-4 p-6 md:p-10 relative bg-white">
        {/* Small logo in corner */}
        <div className="absolute top-6 right-6 z-10">
          <a href="/" className="flex items-center hover:opacity-80 transition-opacity">
            <Image
              src="/logo.png"
              alt="Logo"
              width={40}
              height={40}
              className="object-contain"
            />
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  )
}
