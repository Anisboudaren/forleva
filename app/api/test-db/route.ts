import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Test database connection by running a simple query
    // Note: In serverless environments, we don't need to explicitly connect/disconnect
    // The Prisma client singleton handles connection pooling automatically
    
    // Try a simple query (this will work even with an empty schema)
    const result = await prisma.$queryRaw`SELECT 1 as test`
    
    return NextResponse.json(
      {
        success: true,
        message: 'Database connection successful',
        data: result,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Database connection error:', error)
    
    return NextResponse.json(
      {
        success: false,
        message: 'Database connection failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}



