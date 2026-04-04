import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function daysAgoUtc(days: number): Date {
  const d = new Date()
  d.setUTCDate(d.getUTCDate() - days)
  return d
}

async function main() {
  await prisma.payout.deleteMany()
  await prisma.policy.deleteMany()
  await prisma.fraudFlag.deleteMany()
  await prisma.auditLog.deleteMany()
  await prisma.sensorReading.deleteMany()
  await prisma.worker.deleteMany()

  const workers = await prisma.worker.createMany({
    data: [
      {
        phone: '9999990001',
        name: 'Rajan Kumar',
        city: 'Mumbai',
        pincode: '400001',
        platform: 'zepto',
        upiHandle: 'rajan@upi',
        aadhaarLast4: '1234',
        deviceFingerprint: 'devfp_rajan_01',
        tenureWeeks: 18,
        baselineIncomePaise: 65000,
      },
      {
        phone: '9999990002',
        name: 'Arjun Singh',
        city: 'Delhi',
        pincode: '110001',
        platform: 'blinkit',
        upiHandle: 'arjun@upi',
        aadhaarLast4: '2345',
        deviceFingerprint: 'devfp_shared_01',
        tenureWeeks: 7,
        baselineIncomePaise: 72000,
      },
      {
        phone: '9999990003',
        name: 'Meera Nair',
        city: 'Bengaluru',
        pincode: '560001',
        platform: 'swiggy',
        upiHandle: 'meera@upi',
        aadhaarLast4: '3456',
        deviceFingerprint: 'devfp_meera_01',
        tenureWeeks: 26,
        baselineIncomePaise: 82000,
      },
      {
        phone: '9999990004',
        name: 'Salim Khan',
        city: 'Mumbai',
        pincode: '400001',
        platform: 'zepto',
        upiHandle: 'salim@upi',
        aadhaarLast4: '4567',
        deviceFingerprint: 'devfp_shared_01',
        tenureWeeks: 11,
        baselineIncomePaise: 60000,
      },
    ],
    skipDuplicates: true,
  })

  // eslint-disable-next-line no-console
  console.log(`Seeded workers: ${workers.count}`)

  const allWorkers = await prisma.worker.findMany({
    select: { id: true, city: true, baselineIncomePaise: true },
  })

  const now = new Date()
  const weekStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 7))
  const weekEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))

  for (const w of allWorkers) {
    await prisma.policy.create({
      data: {
        workerId: w.id,
        weekStart,
        weekEnd,
        premiumAmountPaise: 9500,
        riskScore: 0.42,
        status: 'active',
        premiumPaidAt: new Date(),
      },
    })
  }

  const arjun = await prisma.worker.findFirst({
    where: { name: 'Arjun Singh' },
    include: { policies: { take: 1, orderBy: { createdAt: 'desc' } } },
  })
  if (arjun?.policies[0]) {
    const policyId = arjun.policies[0].id
    const payout = await prisma.payout.create({
      data: {
        workerId: arjun.id,
        policyId,
        triggerType: 'aqi',
        triggerValue: 340,
        payoutAmountPaise: Math.round(72000 * 0.5),
        fraudScore: 0.6685,
        fraudComponents: { B: 0.72, G: 0.58, L: 0.71 },
        status: 'review',
      },
    })
    await prisma.fraudFlag.create({
      data: {
        workerId: arjun.id,
        payoutId: payout.id,
        flagType: 'behavioral',
        scoreB: 0.72,
        scoreG: 0.58,
        scoreL: 0.71,
        scoreTotal: 0.6685,
        reviewStatus: 'pending',
      },
    })
  }

  const cities = [
    { city: 'Mumbai', pincode: '400001' },
    { city: 'Delhi', pincode: '110001' },
    { city: 'Bengaluru', pincode: '560001' },
  ]

  for (let d = 13; d >= 0; d--) {
    for (const c of cities) {
      const recordedAt = daysAgoUtc(d)
      const dayOfWeek = recordedAt.getUTCDay()

      // Make one "rain day" on Wednesday-ish for the demo
      const rainfall = dayOfWeek === 3 ? 42 + Math.random() * 8 : Math.max(0, 6 + (Math.random() - 0.6) * 8)
      const heatIndex = 34 + (Math.random() - 0.5) * 4
      const aqi = Math.round(180 + (Math.random() - 0.5) * 60)
      const cancelRate = Math.max(5, 18 + (Math.random() - 0.5) * 10)

      await prisma.sensorReading.create({
        data: {
          city: c.city,
          pincode: c.pincode,
          rainfallMmHr: rainfall,
          heatIndexC: heatIndex,
          aqiScore: aqi,
          cancelRatePct: cancelRate,
          platformStatus: 'online',
          orderDensity: 1.0,
          source: 'platform',
          recordedAt,
        },
      })
    }
  }
}

main()
  .catch(async (e) => {
    // eslint-disable-next-line no-console
    console.error(e)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

