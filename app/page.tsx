'use client'

import { useState, useEffect } from 'react'

interface Rule {
  id: number
  text: string
  conflictsWith: { id: number; text: string }[]
}

export default function Home() {
  const [rules, setRules] = useState<Rule[]>([])
  const [newRuleText, setNewRuleText] = useState('')
  const [loading, setLoading] = useState(true)
  
  // Conflict management
  const [selectedRule, setSelectedRule] = useState<number | null>(null)
  const [conflictTarget, setConflictTarget] = useState<number | null>(null)
  
  // Randomizer
  const [randomCount, setRandomCount] = useState(3)
  const [avoidConflicts, setAvoidConflicts] = useState(false)
  const [randomizedRules, setRandomizedRules] = useState<Rule[]>([])
  const [randomMessage, setRandomMessage] = useState('')
  
  // Fetch rules on load
  useEffect(() => {
    fetchRules()
  }, [])
  
  const fetchRules = async () => {
    try {
      const res = await fetch('/api/rules')
      const data = await res.json()
      setRules(data)
    } catch (error) {
      console.error('Failed to fetch rules')
    } finally {
      setLoading(false)
    }
  }
  
  const addRule = async () => {
    if (!newRuleText.trim()) return
    try {
      const res = await fetch('/api/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newRuleText }),
      })
      if (res.ok) {
        setNewRuleText('')
        fetchRules()
      }
    } catch (error) {
      console.error('Failed to add rule')
    }
  }
  
  const deleteRule = async (id: number) => {
    try {
      await fetch('/api/rules', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      fetchRules()
    } catch (error) {
      console.error('Failed to delete rule')
    }
  }
  
  const addConflict = async () => {
    if (!selectedRule || !conflictTarget || selectedRule === conflictTarget) return
    try {
      await fetch('/api/conflicts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ruleId: selectedRule, conflictWithId: conflictTarget }),
      })
      setSelectedRule(null)
      setConflictTarget(null)
      fetchRules()
    } catch (error) {
      console.error('Failed to add conflict')
    }
  }
  
  const removeConflict = async (ruleId: number, conflictId: number) => {
    try {
      await fetch('/api/conflicts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ruleId, conflictWithId: conflictId }),
      })
      fetchRules()
    } catch (error) {
      console.error('Failed to remove conflict')
    }
  }
  
  const randomizeRules = async () => {
    try {
      const res = await fetch('/api/randomize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: randomCount, avoidConflicts }),
      })
      const data = await res.json()
      setRandomizedRules(data.rules || [])
      setRandomMessage(data.message || '')
    } catch (error) {
      console.error('Failed to randomize')
    }
  }
  
  if (loading) {
    return <div className="p-8 text-center">Loading...</div>
  }
  
  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center">Pokemon Rules Manager</h1>
      
      {/* Add New Rule */}
      <section className="mb-8 p-4 border border-gray-700 rounded">
        <h2 className="text-xl font-semibold mb-4">Add New Rule</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={newRuleText}
            onChange={(e) => setNewRuleText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addRule()}
            placeholder="Enter rule text..."
            className="flex-1 px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white"
          />
          <button
            onClick={addRule}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded font-medium"
          >
            Add Rule
          </button>
        </div>
      </section>
      
      {/* Rules List */}
      <section className="mb-8 p-4 border border-gray-700 rounded">
        <h2 className="text-xl font-semibold mb-4">Rules ({rules.length})</h2>
        {rules.length === 0 ? (
          <p className="text-gray-500">No rules yet. Add one above!</p>
        ) : (
          <ul className="space-y-3">
            {rules.map((rule) => (
              <li key={rule.id} className="p-3 bg-gray-900 rounded">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <span className="text-gray-400 mr-2">#{rule.id}</span>
                    <span>{rule.text}</span>
                    {rule.conflictsWith.length > 0 && (
                      <div className="mt-2 text-sm">
                        <span className="text-red-400">Conflicts with: </span>
                        {rule.conflictsWith.map((conflict, idx) => (
                          <span key={conflict.id} className="text-red-300">
                            #{conflict.id}
                            <button
                              onClick={() => removeConflict(rule.id, conflict.id)}
                              className="ml-1 text-red-500 hover:text-red-300"
                              title="Remove conflict"
                            >
                              ×
                            </button>
                            {idx < rule.conflictsWith.length - 1 && ', '}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => deleteRule(rule.id)}
                    className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-sm"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
      
      {/* Add Conflict */}
      <section className="mb-8 p-4 border border-gray-700 rounded">
        <h2 className="text-xl font-semibold mb-4">Add Conflict</h2>
        <div className="flex gap-2 items-center flex-wrap">
          <select
            value={selectedRule || ''}
            onChange={(e) => setSelectedRule(Number(e.target.value) || null)}
            className="px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white"
          >
            <option value="">Select Rule 1</option>
            {rules.map((rule) => (
              <option key={rule.id} value={rule.id}>
                #{rule.id}: {rule.text.substring(0, 30)}...
              </option>
            ))}
          </select>
          <span className="text-gray-500">conflicts with</span>
          <select
            value={conflictTarget || ''}
            onChange={(e) => setConflictTarget(Number(e.target.value) || null)}
            className="px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white"
          >
            <option value="">Select Rule 2</option>
            {rules
              .filter((r) => r.id !== selectedRule)
              .map((rule) => (
                <option key={rule.id} value={rule.id}>
                  #{rule.id}: {rule.text.substring(0, 30)}...
                </option>
              ))}
          </select>
          <button
            onClick={addConflict}
            disabled={!selectedRule || !conflictTarget}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded font-medium"
          >
            Add Conflict
          </button>
        </div>
      </section>
      
      {/* Randomizer */}
      <section className="p-4 border border-gray-700 rounded">
        <h2 className="text-xl font-semibold mb-4">Randomize Rules</h2>
        <div className="flex gap-4 items-center flex-wrap mb-4">
          <div className="flex items-center gap-2">
            <label>Number of rules:</label>
            <input
              type="number"
              min="1"
              max={rules.length}
              value={randomCount}
              onChange={(e) => setRandomCount(Number(e.target.value))}
              className="w-20 px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white"
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={avoidConflicts}
              onChange={(e) => setAvoidConflicts(e.target.checked)}
              className="w-4 h-4"
            />
            <span>Avoid conflicting rules</span>
          </label>
          <button
            onClick={randomizeRules}
            disabled={rules.length === 0}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded font-medium"
          >
            Randomize!
          </button>
        </div>
        
        {randomMessage && (
          <p className="text-yellow-400 mb-3">{randomMessage}</p>
        )}
        
        {randomizedRules.length > 0 && (
          <div className="p-4 bg-gray-900 rounded">
            <h3 className="font-semibold mb-2 text-green-400">Selected Rules:</h3>
            <ol className="list-decimal list-inside space-y-1">
              {randomizedRules.map((rule) => (
                <li key={rule.id}>
                  <span className="text-gray-400">#{rule.id}</span> {rule.text}
                </li>
              ))}
            </ol>
          </div>
        )}
      </section>
    </main>
  )
}
