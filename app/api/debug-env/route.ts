import { NextResponse } from 'next/server'

export async function GET() {
  // This endpoint helps debug environment variable loading
  // DO NOT expose this in production - it shows sensitive info
  
  const databaseUrl = process.env.DATABASE_URL
  
  return NextResponse.json({
    hasDatabaseUrl: !!databaseUrl,
    databaseUrlLength: databaseUrl?.length || 0,
    databaseUrlPreview: databaseUrl 
      ? `${databaseUrl.substring(0, 20)}...${databaseUrl.substring(databaseUrl.length - 10)}` 
      : 'NOT SET',
    allEnvKeys: Object.keys(process.env)
      .filter(k => k.toLowerCase().includes('database'))
      .sort(),
    nodeEnv: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  })
}



