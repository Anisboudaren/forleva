import { Hero3 } from '@/components/hero3/Hero3'
import { Header3 } from '@/components/header3/Header3'
import { WhyUs3 } from '@/components/why-us3/WhyUs3'
import { CategoriesMarquee } from '@/components/categories/CategoriesMarquee'
import { HowItWorks3 } from '@/components/how-it-works3/HowItWorks3'
import { PopularCourses } from '@/components/popular-courses/PopularCourses'
import { CtaSection3 } from '@/components/cta-section3/CtaSection3'
import { Certificates3 } from '@/components/certificates3/Certificates3'
import { Testimonials3 } from '@/components/testimonials3/Testimonials3'
import { Faq } from '@/components/faq/Faq'
import { Footer } from '@/components/footer/Footer'

export default function Home () {
  return (
    <div className="overflow-x-hidden bg-white scroll-smooth">
      <Header3 />
      <Hero3 />
      <WhyUs3 />
      <CategoriesMarquee />
      <HowItWorks3 />
      <PopularCourses />
      <CtaSection3 />
      <Certificates3 />
      <Testimonials3 />
      <Faq />
      <Footer />
    </div>
  )
}
