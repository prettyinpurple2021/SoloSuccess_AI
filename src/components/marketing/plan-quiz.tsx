"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'

export default function PlanQuiz() {
  const [answers, setAnswers] = useState({ team: 'solo', automation: 'low', budget: 'low' })
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const recommend = () => {
    if (answers.automation === 'high' || answers.team !== 'solo') return 'Dominator'
    if (answers.automation === 'medium') return 'Accelerator'
    return 'Launch'
  }

  const submit = async () => {
    await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_name: 'quiz_submit', metadata: { answers, recommended: recommend() }, path: '/pricing' }),
    })
    if (email) {
      await fetch('/api/newsletter', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, source: 'plan_quiz' }) })
    }
    setSubmitted(true)
  }

  if (submitted) {
    const rec = recommend()
    const href = rec === 'Launch' ? '/pricing/launch' : rec === 'Accelerator' ? '/pricing/accelerator' : '/pricing/dominator'
    return (
      <div className="rounded-sm border border-neon-cyan bg-dark-card p-8 shadow-[0_0_20px_rgba(11,228,236,0.15)] backdrop-blur-xl">
        <div className="text-xl font-bold font-orbitron text-white mb-4 uppercase tracking-wider">
          Recommended plan: <span className="text-neon-lime">{rec}</span>
        </div>
        <a className="text-neon-cyan hover:text-neon-lime underline underline-offset-4 transition-colors font-mono" href={href}>
          Go to {rec}
        </a>
      </div>
    )
  }

  return (
    <div className="rounded-sm border border-neon-cyan bg-dark-card p-8 shadow-[0_0_20px_rgba(11,228,236,0.15)] backdrop-blur-xl max-w-xl mx-auto">
      <div className="text-xl font-bold font-orbitron text-white mb-6 uppercase tracking-wider shadow-neon-cyan/50 text-shadow-sm">
        Which plan fits you?
      </div>
      <div className="grid gap-6">
        <div>
          <label className="text-sm font-bold font-mono text-neon-cyan mb-2 block uppercase tracking-wider">Team Size</label>
          <Select value={answers.team} onValueChange={(val) => setAnswers(a => ({ ...a, team: val }))}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select team size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="solo">I work solo</SelectItem>
              <SelectItem value="small">Small team</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-bold font-mono text-neon-cyan mb-2 block uppercase tracking-wider">Automation Needs</label>
          <Select value={answers.automation} onValueChange={(val) => setAnswers(a => ({ ...a, automation: val }))}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select automation level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low (Manual)</SelectItem>
              <SelectItem value="medium">Medium (Assisted)</SelectItem>
              <SelectItem value="high">High (Fully Automated)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-bold font-mono text-neon-cyan mb-2 block uppercase tracking-wider">Budget</label>
          <Select value={answers.budget} onValueChange={(val) => setAnswers(a => ({ ...a, budget: val }))}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select budget" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Lean</SelectItem>
              <SelectItem value="medium">Growing</SelectItem>
              <SelectItem value="high">Flexible</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
           <label className="text-sm font-bold font-mono text-neon-cyan mb-2 block uppercase tracking-wider">Email (Optional)</label>
           <Input 
             className="bg-dark-bg border-gray-700 focus:border-neon-cyan focus:ring-neon-cyan/20" 
             type="email" 
             placeholder="For your plan guide" 
             value={email} 
             onChange={(e) => setEmail(e.target.value)} 
           />
        </div>
      </div>
      <div className="mt-8 flex justify-end">
        <Button onClick={submit} variant="lime" className="w-full sm:w-auto shadow-[0_0_15px_rgba(57,255,20,0.3)]">
          Get Recommendation
        </Button>
      </div>
    </div>
  )
}


