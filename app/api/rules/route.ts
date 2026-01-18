import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isPasswordValid, extractPasswordFromRequest } from '@/lib/auth'

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
  // Check password authorization
  const password = extractPasswordFromRequest(request)
  if (!isPasswordValid(password)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  try {
    const { text, description } = await request.json()
    
    // Validate text is a non-empty string
    if (typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json({ error: 'Rule title is required' }, { status: 400 })
    }
    
    const trimmedText = text.trim()
    const trimmedDescription = typeof description === 'string' && description.trim().length > 0 
      ? description.trim() 
      : null
    
    const rule = await prisma.rule.create({
      data: { text: trimmedText, description: trimmedDescription },
      include: { conflictsWith: true },
    })
    return NextResponse.json(rule)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create rule' }, { status: 500 })
  }
}

// PUT update a rule
export async function PUT(request: Request) {
  // Check password authorization
  const password = extractPasswordFromRequest(request)
  if (!isPasswordValid(password)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  try {
    const { id, text, description } = await request.json()
    
    // Validate id is a number
    if (typeof id !== 'number' || !Number.isInteger(id)) {
      return NextResponse.json({ error: 'Invalid rule ID' }, { status: 400 })
    }
    
    // Validate text is a non-empty string
    if (typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json({ error: 'Rule title is required' }, { status: 400 })
    }
    
    const trimmedText = text.trim()
    const trimmedDescription = typeof description === 'string' && description.trim().length > 0 
      ? description.trim() 
      : null
    
    const rule = await prisma.rule.update({
      where: { id },
      data: { text: trimmedText, description: trimmedDescription },
      include: { conflictsWith: true },
    })
    return NextResponse.json(rule)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update rule' }, { status: 500 })
  }
}

// DELETE a rule
export async function DELETE(request: Request) {
  // Check password authorization
  const password = extractPasswordFromRequest(request)
  if (!isPasswordValid(password)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  try {
    const { id } = await request.json()
    
    // Validate id is a number
    if (typeof id !== 'number' || !Number.isInteger(id)) {
      return NextResponse.json({ error: 'Invalid rule ID' }, { status: 400 })
    }
    
    await prisma.rule.delete({
      where: { id },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete rule' }, { status: 500 })
  }
}
