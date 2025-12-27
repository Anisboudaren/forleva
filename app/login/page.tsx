import Image from "next/image"
import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2 bg-gray-50">
      {/* Left section with image */}
      <div className="relative hidden lg:flex items-center justify-center overflow-hidden bg-gray-100">
        <Image
          src="/login/login image.png"
          alt="Login"
          fill
          className="object-cover"
          priority
        />
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
