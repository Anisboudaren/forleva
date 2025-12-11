"use client"

import Link from "next/link"

export function DashboardFooter() {
  return (
    <footer className="mt-auto border-t border-gray-200 bg-white">
      <div className="px-4 md:px-6 py-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Links */}
          <div className="flex items-center gap-6 text-sm">
            <Link
              href="/help"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              المساعدة
            </Link>
            <Link
              href="/contact"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              تواصل معنا
            </Link>
            <Link
              href="/privacy"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              الخصوصية
            </Link>
          </div>
          
          {/* Copyright */}
          <div className="text-sm text-gray-500">
            <p>© {new Date().getFullYear()} منصة التعلم</p>
          </div>
        </div>
      </div>
    </footer>
  )
}


