import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST add a conflict between two rules
export async function POST(request: Request) {
  try {
    const { ruleId, conflictWithId } = await request.json()
    
    // Validate IDs are integers
    if (typeof ruleId !== 'number' || !Number.isInteger(ruleId)) {
      return NextResponse.json({ error: 'Invalid rule ID' }, { status: 400 })
    }
    if (typeof conflictWithId !== 'number' || !Number.isInteger(conflictWithId)) {
      return NextResponse.json({ error: 'Invalid conflict rule ID' }, { status: 400 })
    }
    if (ruleId === conflictWithId) {
      return NextResponse.json({ error: 'A rule cannot conflict with itself' }, { status: 400 })
    }
    
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
    
    // Validate IDs are integers
    if (typeof ruleId !== 'number' || !Number.isInteger(ruleId)) {
      return NextResponse.json({ error: 'Invalid rule ID' }, { status: 400 })
    }
    if (typeof conflictWithId !== 'number' || !Number.isInteger(conflictWithId)) {
      return NextResponse.json({ error: 'Invalid conflict rule ID' }, { status: 400 })
    }
    
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
