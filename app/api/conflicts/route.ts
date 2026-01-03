import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST add a conflict between two rules
export async function POST(request: Request) {
  try {
    const { ruleId, conflictWithId } = await request.json()
    
    // Add bidirectional conflict
    await prisma.rule.update({
      where: { id: ruleId },
      data: {
        conflictsWith: {
          connect: { id: conflictWithId },
        },
      },
    })
    
    await prisma.rule.update({
      where: { id: conflictWithId },
      data: {
        conflictsWith: {
          connect: { id: ruleId },
        },
      },
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add conflict' }, { status: 500 })
  }
}

// DELETE remove a conflict between two rules
export async function DELETE(request: Request) {
  try {
    const { ruleId, conflictWithId } = await request.json()
    
    // Remove bidirectional conflict
    await prisma.rule.update({
      where: { id: ruleId },
      data: {
        conflictsWith: {
          disconnect: { id: conflictWithId },
        },
      },
    })
    
    await prisma.rule.update({
      where: { id: conflictWithId },
      data: {
        conflictsWith: {
          disconnect: { id: ruleId },
        },
      },
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to remove conflict' }, { status: 500 })
  }
}
