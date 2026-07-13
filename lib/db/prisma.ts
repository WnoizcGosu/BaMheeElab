import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
// @ts-ignore: Adapter types might not be resolved depending on the local TS environment
import { PrismaPg } from '@prisma/adapter-pg'

const prismaClientSingleton = () => {
  const connectionString = process.env.DATABASE_URL
  const pool = new Pool({ connectionString })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma
