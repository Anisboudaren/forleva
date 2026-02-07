import Image from "next/image"
import { AdminLoginForm } from "@/components/admin-login-form"

export default function AdminLoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2 bg-gray-50">
      {/* Left section with image */}
      <div className="relative hidden lg:flex items-center justify-center overflow-hidden bg-gradient-to-br from-amber-50 to-yellow-100">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-200/20 via-transparent to-transparent" />
        <Image
          src="/login/login image.png"
          alt="Admin Login"
          fill
          className="object-cover opacity-90"
          priority
        />
        <div className="absolute inset-0 bg-amber-900/10" />
        <div className="relative z-10 text-center p-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 text-amber-800 font-medium text-sm mb-4">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            لوحة إدارة المنصة
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">إدارة شاملة للمنصة</h2>
          <p className="text-gray-600 max-w-sm">
            إدارة المستخدمين والدورات والإعدادات من مكان واحد
          </p>
        </div>
      </div>
      
      {/* Right section with form */}
      <div className="flex flex-col gap-4 p-6 md:p-10 relative bg-white">
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
            <AdminLoginForm />
          </div>
        </div>
      </div>
    </div>
  )
}
