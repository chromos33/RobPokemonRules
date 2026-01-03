import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET all rules with their conflicts
export async function GET() {
  try {
    const rules = await prisma.rule.findMany({
      include: {
        conflictsWith: true,
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(rules)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch rules' }, { status: 500 })
  }
}

// POST create a new rule
export async function POST(request: Request) {
  try {
    const { text } = await request.json()
    const rule = await prisma.rule.create({
      data: { text },
      include: { conflictsWith: true },
    })
    return NextResponse.json(rule)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create rule' }, { status: 500 })
  }
}

// DELETE a rule
export async function DELETE(request: Request) {
  try {
    const { id } = await request.json()
    await prisma.rule.delete({
      where: { id },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete rule' }, { status: 500 })
  }
}
