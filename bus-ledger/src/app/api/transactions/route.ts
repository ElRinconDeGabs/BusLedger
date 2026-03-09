import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const transactions = await prisma.transaction.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  })

  return NextResponse.json(transactions)
}

export async function POST(req: Request) {
  try {

    const body = await req.json()

    const transaction = await prisma.transaction.create({
      data: {
        amount: Number(body.amount),
        description: body.description,
        type: body.type,
        userId: body.userId
      }
    })

    return NextResponse.json(transaction)

  } catch (error) {

    console.error(error)

    return NextResponse.json(
      { error: 'Error creating transaction' },
      { status: 500 }
    )
  }
}