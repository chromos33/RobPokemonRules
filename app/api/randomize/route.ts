import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface ConflictRef {
  id: number
}

interface Rule {
  id: number
  text: string
  conflictsWith: ConflictRef[]
}

// POST randomize rules
export async function POST(request: Request) {
  try {
    const { count, avoidConflicts } = await request.json()
    
    const allRules = await prisma.rule.findMany({
      include: { conflictsWith: true },
    })
    
    if (allRules.length === 0) {
      return NextResponse.json({ rules: [], message: 'No rules available' })
    }
    
    if (count > allRules.length) {
      return NextResponse.json({ 
        error: `Requested ${count} rules but only ${allRules.length} available` 
      }, { status: 400 })
    }
    
    let selectedRules: Rule[] = []
    
    if (avoidConflicts) {
      // Greedy selection avoiding conflicts
      const shuffled = [...allRules].sort(() => Math.random() - 0.5)
      const selectedIds = new Set<number>()
      
      for (const rule of shuffled) {
        if (selectedRules.length >= count) break
        
        // Check if this rule conflicts with any already selected
        const hasConflict = rule.conflictsWith.some((c: ConflictRef) => selectedIds.has(c.id))
        
        if (!hasConflict) {
          selectedRules.push(rule)
          selectedIds.add(rule.id)
        }
      }
      
      if (selectedRules.length < count) {
        return NextResponse.json({ 
          rules: selectedRules,
          message: `Could only select ${selectedRules.length} non-conflicting rules out of ${count} requested`
        })
      }
    } else {
      // Simple random selection without conflict checking
      const shuffled = [...allRules].sort(() => Math.random() - 0.5)
      selectedRules = shuffled.slice(0, count)
    }
    
    return NextResponse.json({ rules: selectedRules })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to randomize rules' }, { status: 500 })
  }
}
