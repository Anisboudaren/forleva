import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import bcrypt from 'bcrypt'

const url = process.env.DATABASE_URL
if (!url) throw new Error('DATABASE_URL is not set')
const adapter = new PrismaNeon({ connectionString: url })
const prisma = new PrismaClient({ adapter })

const TEACHER_EMAIL = 'teacher@forleva.demo'
const TEACHER_PASSWORD = 'Teacher123!'

async function main() {
  await prisma.$connect()

  // --- Super admin (optional) ---
  const email = process.env.SEED_SUPER_ADMIN_EMAIL
  const password = process.env.SEED_SUPER_ADMIN_PASSWORD
  if (email && password) {
    const existing = await prisma.user.findUnique({ where: { email } })
    if (!existing) {
      const passwordHash = await bcrypt.hash(password, 10)
      await prisma.user.create({
        data: {
          email,
          passwordHash,
          role: 'SUPER_ADMIN',
          status: 'ACTIVE',
          fullName: 'Super Admin',
        },
      })
      console.log('Default super admin created for', email)
    } else {
      console.log('Default super admin already exists for', email)
    }
  }

  // --- Teacher for demo course ---
  let teacher = await prisma.user.findUnique({ where: { email: TEACHER_EMAIL } })
  if (!teacher) {
    const teacherHash = await bcrypt.hash(TEACHER_PASSWORD, 10)
    teacher = await prisma.user.create({
      data: {
        email: TEACHER_EMAIL,
        passwordHash: teacherHash,
        role: 'TEACHER',
        status: 'ACTIVE',
        fullName: 'مدرب المكياج',
      },
    })
    console.log('Demo teacher created:', TEACHER_EMAIL)
  }

  // --- Single demo course: Professional Makeup (Arabic) ---
  const existingCourse = await prisma.course.findFirst({
    where: { teacherId: teacher.id, title: 'دورة فن المكياج الاحترافي' },
  })
  if (existingCourse) {
    console.log('Demo course already exists, skipping.')
    return
  }

  const courseImageUrl =
    'https://bhaavyakapur.com/assets-admin/images/blog/thumbnail_images/1743054268Professional%20Makeup%20Artist%20Course.webp'

  await prisma.course.create({
    data: {
      teacherId: teacher.id,
      status: 'PUBLISHED',
      title: 'دورة فن المكياج الاحترافي',
      category: 'تصميم',
      price: 2990,
      imageUrl: courseImageUrl,
      duration: '6 أسابيع',
      level: 'مبتدئ',
      language: 'العربية',
      description:
        'دورة شاملة لتعلم أساسيات المكياج الاحترافي من الصفر. تشمل العيون، الخدود، الوجه، الشفاه، واستخدام الأدوات الصحيحة.',
      learningOutcomes: [
        'إتقان مكياج العيون بأنواعه',
        'تطبيق البلاتو والكونتور للخدود والوجه',
        'اختيار ألوان تناسب لون البشرة',
        'استخدام فرش وأدوات المكياج بشكل صحيح',
        'تنفيذ مكياج نهاري ومسائي كامل',
      ],
      sections: {
        create: [
          {
            title: 'العيون',
            position: 0,
            items: {
              create: [
                {
                  type: 'VIDEO',
                  title: 'مكياج العيون للمبتدئين',
                  duration: '12:00',
                  url: 'https://www.youtube.com/watch?v=wwKv0UM6IwQ',
                  position: 0,
                  extraData: { description: 'شرح تطبيق مكياج العيون خطوة بخطوة للمبتدئين.' },
                },
              ],
            },
          },
          {
            title: 'للمبتدئين',
            position: 1,
            items: {
              create: [
                {
                  type: 'VIDEO',
                  title: 'أساسيات المكياج من الصفر',
                  duration: '15:30',
                  url: 'https://www.youtube.com/watch?v=xcyC_5rOIbs',
                  position: 0,
                  extraData: { description: 'مقدمة وأساسيات يجب معرفتها قبل البدء في المكياج.' },
                },
              ],
            },
          },
          {
            title: 'الخدود والوجه',
            position: 2,
            items: {
              create: [
                {
                  type: 'VIDEO',
                  title: 'البلاتو والكونتور للخدود والوجه',
                  duration: '18:00',
                  url: 'https://www.youtube.com/watch?v=n55z6Rk-NJU',
                  position: 0,
                  extraData: { description: 'كيفية تظليل وتضيء الخدود والوجه لإبراز الملامح.' },
                },
              ],
            },
          },
          {
            title: 'الشفاه',
            position: 3,
            items: {
              create: [
                {
                  type: 'VIDEO',
                  title: 'تحديد وتلوين الشفاه',
                  duration: '08:00',
                  url: 'https://www.youtube.com/watch?v=wwKv0UM6IwQ',
                  position: 0,
                  extraData: { description: 'طريقة تحديد الشفاه واختيار الألوان المناسبة.' },
                },
              ],
            },
          },
          {
            title: 'أدوات المكياج',
            position: 4,
            items: {
              create: [
                {
                  type: 'TITLE',
                  title: 'الفرش والأدوات الأساسية',
                  position: 0,
                },
                {
                  type: 'VIDEO',
                  title: 'دليل شراء فرش المكياج',
                  duration: '10:00',
                  url: 'https://www.youtube.com/watch?v=xcyC_5rOIbs',
                  position: 1,
                  extraData: { description: 'كيف تختارين الفرش الجيدة وما هي الأساسيات التي تحتاجينها.' },
                },
              ],
            },
          },
          {
            title: 'نصائح نهائية',
            position: 5,
            items: {
              create: [
                {
                  type: 'VIDEO',
                  title: 'نصائح لإطالة بقاء المكياج',
                  duration: '07:00',
                  url: 'https://www.youtube.com/watch?v=n55z6Rk-NJU',
                  position: 0,
                  extraData: { description: 'طرق تثبيت المكياج وحمايته طوال اليوم.' },
                },
              ],
            },
          },
        ],
      },
    },
  })

  console.log('Demo course "دورة فن المكياج الاحترافي" created.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
