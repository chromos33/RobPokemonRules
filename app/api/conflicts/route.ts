import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isPasswordValid, extractPasswordFromRequest } from '@/lib/auth'

// POST add a conflict between two rules
export async function POST(request: Request) {
  // Check password authorization
  const password = extractPasswordFromRequest(request)
  console.log('[API /api/conflicts POST] Password provided:', password ? 'yes' : 'no')
  if (!isPasswordValid(password)) {
    console.warn('[API /api/conflicts POST] Unauthorized: Invalid or missing password')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
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
    
    console.log('[API /api/conflicts POST] Conflict added successfully between', ruleId, 'and', conflictWithId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[API /api/conflicts POST] Error adding conflict:', error)
    return NextResponse.json({ error: 'Failed to add conflict' }, { status: 500 })
  }
}

// DELETE remove a conflict between two rules
export async function DELETE(request: Request) {
  // Check password authorization
  const password = extractPasswordFromRequest(request)
  console.log('[API /api/conflicts DELETE] Password provided:', password ? 'yes' : 'no')
  if (!isPasswordValid(password)) {
    console.warn('[API /api/conflicts DELETE] Unauthorized: Invalid or missing password')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
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
    
    console.log('[API /api/conflicts DELETE] Conflict removed successfully between', ruleId, 'and', conflictWithId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[API /api/conflicts DELETE] Error removing conflict:', error)
    return NextResponse.json({ error: 'Failed to remove conflict' }, { status: 500 })
  }
}
