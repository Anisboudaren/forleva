import { Hero2 } from '@/components/hero2/Hero2'
import { Categories } from '@/components/categories/Categories'
import { PopularCourses } from '@/components/popular-courses/PopularCourses'
import { CtaSection } from '@/components/cta-section/CtaSection'
import { Testimonials } from '@/components/testimonials/Testimonials'
import { Faq } from '@/components/faq/Faq'
import { Footer } from '@/components/footer/Footer'

export default function Home () {
  return (
    <div className='overflow-x-hidden bg-gray-50'>
      <Hero2 />
      <Categories />
      <PopularCourses />
      <CtaSection />
      <Testimonials />
      <Faq />
      <Footer />
    </div>
  )
}
