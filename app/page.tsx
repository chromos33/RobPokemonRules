'use client'

import { useState, useEffect } from 'react'

interface Rule {
  id: number
  text: string
  description?: string | null
  conflictsWith: { id: number; text: string }[]
}

export default function Home() {
  const [rules, setRules] = useState<Rule[]>([])
  const [newRuleText, setNewRuleText] = useState('')
  const [newRuleDescription, setNewRuleDescription] = useState('')
  const [loading, setLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [password, setPassword] = useState<string | null>(null)
  
  // Edit rule
  const [editingRule, setEditingRule] = useState<Rule | null>(null)
  const [editText, setEditText] = useState('')
  const [editDescription, setEditDescription] = useState('')
  
  // Conflict popup
  const [conflictPopupRule, setConflictPopupRule] = useState<Rule | null>(null)
  const [conflictFilter, setConflictFilter] = useState('')
  
  // Rules filter
  const [rulesFilter, setRulesFilter] = useState('')
  
  // Randomizer
  const [randomCount, setRandomCount] = useState(1)
  const [avoidConflicts, setAvoidConflicts] = useState(false)
  const [randomizedRules, setRandomizedRules] = useState<Rule[]>([])
  const [randomMessage, setRandomMessage] = useState('')
  
  // Fetch rules on load and check for password
  useEffect(() => {
    // Check for password in URL
    const params = new URLSearchParams(window.location.search)
    const pw = params.get('pw')
    
    if (pw) {
      setPassword(pw)
      setIsAuthorized(true)
    }
    
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
      const url = password ? `/api/rules?pw=${encodeURIComponent(password)}` : '/api/rules'
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newRuleText, description: newRuleDescription || null }),
      })
      if (res.ok) {
        setNewRuleText('')
        setNewRuleDescription('')
        fetchRules()
      } else {
        alert('Failed to add rule. Unauthorized or server error.')
      }
    } catch (error) {
      console.error('Failed to add rule')
    }
  }
  
  const updateRule = async () => {
    if (!editingRule || !editText.trim()) return
    try {
      const url = password ? `/api/rules?pw=${encodeURIComponent(password)}` : '/api/rules'
      const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingRule.id, text: editText, description: editDescription || null }),
      })
      if (res.ok) {
        setEditingRule(null)
        setEditText('')
        setEditDescription('')
        fetchRules()
      } else {
        alert('Failed to update rule. Unauthorized or server error.')
      }
    } catch (error) {
      console.error('Failed to update rule')
    }
  }
  
  const startEditing = (rule: Rule) => {
    setEditingRule(rule)
    setEditText(rule.text)
    setEditDescription(rule.description || '')
  }
  
  const cancelEditing = () => {
    setEditingRule(null)
    setEditText('')
    setEditDescription('')
  }

  const deleteRule = async (id: number) => {
    try {
      const url = password ? `/api/rules?pw=${encodeURIComponent(password)}` : '/api/rules'
      await fetch(url, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      fetchRules()
    } catch (error) {
      console.error('Failed to delete rule')
    }
  }
  
  const addConflict = async (ruleId: number, conflictWithId: number) => {
    if (ruleId === conflictWithId) return
    try {
      const url = password ? `/api/conflicts?pw=${encodeURIComponent(password)}` : '/api/conflicts'
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ruleId, conflictWithId }),
      })
      fetchRules()
      // Update the popup rule with fresh data
      const updatedRules = await (await fetch('/api/rules')).json()
      const updatedRule = updatedRules.find((r: Rule) => r.id === ruleId)
      if (updatedRule) setConflictPopupRule(updatedRule)
    } catch (error) {
      console.error('Failed to add conflict')
    }
  }
  
  const removeConflict = async (ruleId: number, conflictId: number) => {
    try {
      const url = password ? `/api/conflicts?pw=${encodeURIComponent(password)}` : '/api/conflicts'
      await fetch(url, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ruleId, conflictWithId: conflictId }),
      })
      fetchRules()
      // Update the popup rule with fresh data if popup is open
      if (conflictPopupRule) {
        const updatedRules = await (await fetch('/api/rules')).json()
        const updatedRule = updatedRules.find((r: Rule) => r.id === conflictPopupRule.id)
        if (updatedRule) setConflictPopupRule(updatedRule)
      }
    } catch (error) {
      console.error('Failed to remove conflict')
    }
  }
  
  const randomizeRules = async () => {
    try {
      const actualCount = Math.min(randomCount, rules.length)
      if (actualCount === 0) {
        setRandomMessage('No rules available to randomize')
        return
      }
      const res = await fetch('/api/randomize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: actualCount, avoidConflicts }),
      })
      const data = await res.json()
      if (data.error) {
        setRandomMessage(data.error)
        setRandomizedRules([])
      } else {
        setRandomizedRules(data.rules || [])
        setRandomMessage(data.message || '')
      }
    } catch (error) {
      console.error('Failed to randomize')
    }
  }

  // Get available rules to add as conflicts (not already conflicting and not self)
  const getAvailableConflicts = (rule: Rule) => {
    const conflictIds = new Set(rule.conflictsWith.map(c => c.id))
    return rules.filter(r => r.id !== rule.id && !conflictIds.has(r.id))
  }
  
  if (loading) {
    return <div className="p-8 text-center">Loading...</div>
  }
  
  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center">Pokemon Rules Manager</h1>
      
      {!isAuthorized && (
        <div className="mb-4 p-3 bg-yellow-900 border border-yellow-700 rounded text-yellow-200 text-center">
          Read-only mode. Add ?pw=yourpassword to the URL to enable editing.
        </div>
      )}
      
      {/* Add New Rule */}
      {isAuthorized && (
        <section className="mb-8 p-4 border border-gray-700 rounded">
          <h2 className="text-xl font-semibold mb-4">Add New Rule</h2>
          <div className="space-y-2">
            <input
              type="text"
              value={newRuleText}
              onChange={(e) => setNewRuleText(e.target.value)}
              placeholder="Rule name (short)..."
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white"
            />
            <textarea
              value={newRuleDescription}
              onChange={(e) => setNewRuleDescription(e.target.value)}
              placeholder="Description (optional, more details)..."
              rows={2}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white resize-none"
            />
            <button
              onClick={addRule}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded font-medium"
            >
              Add Rule
            </button>
          </div>
        </section>
      )}
      
      {/* Rules List */}
      <section className="mb-8 p-4 border border-gray-700 rounded">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Rules ({rules.length})</h2>
          <input
            type="text"
            value={rulesFilter}
            onChange={(e) => setRulesFilter(e.target.value)}
            placeholder="Filter rules..."
            className="px-3 py-1 bg-gray-900 border border-gray-700 rounded text-white text-sm w-48"
          />
        </div>
        {rules.length === 0 ? (
          <p className="text-gray-500">No rules yet. Add one above!</p>
        ) : (
          <ul className="space-y-3">
            {rules
              .filter((rule) => 
                rule.text.toLowerCase().includes(rulesFilter.toLowerCase()) ||
                (rule.description && rule.description.toLowerCase().includes(rulesFilter.toLowerCase()))
              )
              .map((rule) => (
              <li key={rule.id} className="p-3 bg-gray-900 rounded">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <span className="text-gray-400 mr-2">#{rule.id}</span>
                    <span className="font-medium">{rule.text}</span>
                    {rule.description && (
                      <p className="mt-1 text-sm text-gray-400">{rule.description}</p>
                    )}
                    {rule.conflictsWith.length > 0 && (
                      <div className="mt-2 text-sm">
                        <span className="text-red-400">Conflicts with: </span>
                        {rule.conflictsWith.map((conflict, idx) => (
                          <span key={conflict.id} className="text-red-300">
                            #{conflict.id}
                            {isAuthorized && (
                              <button
                                onClick={() => removeConflict(rule.id, conflict.id)}
                                className="ml-1 text-red-500 hover:text-red-300"
                                title="Remove conflict"
                              >
                                ×
                              </button>
                            )}
                            {idx < rule.conflictsWith.length - 1 && ', '}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  {isAuthorized && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEditing(rule)}
                        className="px-2 py-1 bg-gray-600 hover:bg-gray-500 rounded text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setConflictPopupRule(rule)}
                        className="px-2 py-1 bg-orange-600 hover:bg-orange-700 rounded text-sm"
                      >
                        Conflicts
                      </button>
                      <button
                        onClick={() => deleteRule(rule.id)}
                        className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
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

      {/* Conflict Popup Modal */}
      {conflictPopupRule && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={() => { setConflictPopupRule(null); setConflictFilter(''); }}
        >
          <div 
            className="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold">
                Manage Conflicts for Rule #{conflictPopupRule.id}
              </h3>
              <button
                onClick={() => { setConflictPopupRule(null); setConflictFilter(''); }}
                className="text-gray-400 hover:text-white text-2xl leading-none"
              >
                ×
              </button>
            </div>
            
            <p className="text-gray-300 mb-4 p-2 bg-gray-800 rounded">
              {conflictPopupRule.text}
            </p>

            {/* Filter input */}
            <input
              type="text"
              value={conflictFilter}
              onChange={(e) => setConflictFilter(e.target.value)}
              placeholder="Filter rules..."
              className="w-full px-3 py-2 mb-4 bg-gray-800 border border-gray-700 rounded text-white text-sm"
            />
            
            {/* Current Conflicts */}
            <div className="mb-4">
              <h4 className="font-medium text-red-400 mb-2">Current Conflicts:</h4>
              {conflictPopupRule.conflictsWith.length === 0 ? (
                <p className="text-gray-500 text-sm">No conflicts yet</p>
              ) : (
                <ul className="space-y-2 max-h-36 overflow-y-auto">
                  {conflictPopupRule.conflictsWith
                    .filter((c) => c.text.toLowerCase().includes(conflictFilter.toLowerCase()))
                    .map((conflict) => (
                    <li key={conflict.id} className="flex justify-between items-center p-2 bg-gray-800 rounded">
                      <span>
                        <span className="text-gray-400">#{conflict.id}</span> {conflict.text}
                      </span>
                      <button
                        onClick={() => removeConflict(conflictPopupRule.id, conflict.id)}
                        className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-sm"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            {/* Add New Conflict */}
            <div>
              <h4 className="font-medium text-orange-400 mb-2">Add Conflict:</h4>
              {getAvailableConflicts(conflictPopupRule).length === 0 ? (
                <p className="text-gray-500 text-sm">No other rules available to add as conflicts</p>
              ) : (
                <ul className="space-y-2 max-h-48 overflow-y-auto">
                  {getAvailableConflicts(conflictPopupRule)
                    .filter((r) => r.text.toLowerCase().includes(conflictFilter.toLowerCase()))
                    .map((rule) => (
                    <li key={rule.id} className="flex justify-between items-center p-2 bg-gray-800 rounded">
                      <span>
                        <span className="text-gray-400">#{rule.id}</span> {rule.text}
                      </span>
                      <button
                        onClick={() => addConflict(conflictPopupRule.id, rule.id)}
                        className="px-2 py-1 bg-orange-600 hover:bg-orange-700 rounded text-sm"
                      >
                        Add
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            <button
              onClick={() => { setConflictPopupRule(null); setConflictFilter(''); }}
              className="mt-6 w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Edit Rule Modal */}
      {editingRule && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={cancelEditing}
        >
          <div 
            className="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-lg w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold">
                Edit Rule #{editingRule.id}
              </h3>
              <button
                onClick={cancelEditing}
                className="text-gray-400 hover:text-white text-2xl leading-none"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Rule Name</label>
                <input
                  type="text"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Description (optional)</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white resize-none"
                />
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <button
                onClick={updateRule}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded font-medium"
              >
                Save
              </button>
              <button
                onClick={cancelEditing}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
