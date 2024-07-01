import { PrismaClient } from '@prisma/client'

const connectionString = `${process.env.POSTGRES_URL}`

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: connectionString,
    },
  },
  log: ['query', 'info', 'warn', 'error'],
})

export type PrismaClientX = typeof prisma

// // Basic query logging
// prisma.$on('query', (e) => {
//   console.log('Query: ' + e.query)
//   console.log('Params: ' + e.params)
//   console.log('Duration: ' + e.duration + 'ms')
// })
