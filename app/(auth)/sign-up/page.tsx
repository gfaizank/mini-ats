'use client'

import { signUp } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Link from 'next/link'
import { useTransition, useState, useEffect } from 'react'
import { Loader2, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface Plan {
  id: string
  name: string
  max_jobs: number
  max_candidates: number
}

export default function SignUpPage() {
  const [isPending, startTransition] = useTransition()
  const [plans, setPlans] = useState<Plan[]>([])
  const [selectedPlan, setSelectedPlan] = useState<string>('')
  const [loadingPlans, setLoadingPlans] = useState(true)
  const [companyName, setCompanyName] = useState('')
  const [checkingCompanyName, setCheckingCompanyName] = useState(false)
  const [companyNameError, setCompanyNameError] = useState('')

  useEffect(() => {
    async function fetchPlans() {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .order('max_jobs', { ascending: true })

      if (error) {
        console.error('Error fetching plans:', error)
        toast.error('Failed to load plans')
      } else if (data) {
        setPlans(data)
        // Set Free plan as default
        const freePlan = data.find(p => p.name === 'Free')
        if (freePlan) {
          setSelectedPlan(freePlan.id)
        }
      }
      setLoadingPlans(false)
    }

    fetchPlans()
  }, [])

  // Check company name availability with debouncing
  useEffect(() => {
    if (!companyName || companyName.trim().length < 2) {
      setCompanyNameError('')
      return
    }

    const timer = setTimeout(async () => {
      setCheckingCompanyName(true)
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('companies')
        .select('id, name')
        .ilike('name', companyName.trim())
        .limit(1)
        .single()

      setCheckingCompanyName(false)

      if (data && !error) {
        setCompanyNameError(`Company name "${companyName.trim()}" is already taken`)
      } else {
        setCompanyNameError('')
      }
    }, 500) // Debounce by 500ms

    return () => clearTimeout(timer)
  }, [companyName])

  const handleSubmit = async (formData: FormData) => {
    if (!selectedPlan) {
      toast.error('Please select a plan')
      return
    }

    if (companyNameError) {
      toast.error('Please fix the errors before submitting')
      return
    }

    if (!companyName || companyName.trim().length < 2) {
      toast.error('Please enter a valid company name')
      return
    }

    formData.append('planId', selectedPlan)

    startTransition(async () => {
      const result = await signUp(formData)
      if (result?.error) {
        toast.error(result.error, {
          duration: 5000,
        })
      } else if (result?.success) {
        toast.success('Account created! Please check your email to verify your account before signing in.', {
          duration: 6000,
        })
      }
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f9fb] px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create an account</CardTitle>
          <CardDescription>
            Sign up to start managing your hiring process
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <div className="relative">
                <Input
                  id="companyName"
                  name="companyName"
                  type="text"
                  placeholder="Acme Inc"
                  required
                  disabled={isPending || loadingPlans}
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className={companyNameError ? 'border-red-500 focus-visible:ring-red-500' : ''}
                />
                {checkingCompanyName && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                  </div>
                )}
              </div>
              {companyNameError && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  {companyNameError}
                </p>
              )}
              {companyName && !companyNameError && !checkingCompanyName && companyName.trim().length >= 2 && (
                <p className="text-sm text-green-600 flex items-center gap-1">
                  <Check className="h-3 w-3" />
                  Company name is available
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                disabled={isPending || loadingPlans}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                minLength={6}
                disabled={isPending || loadingPlans}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="plan">Select Plan</Label>
              {loadingPlans ? (
                <div className="flex items-center justify-center py-2">
                  <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                  <span className="ml-2 text-sm text-gray-500">Loading plans...</span>
                </div>
              ) : (
                <>
                  <Select value={selectedPlan} onValueChange={setSelectedPlan} disabled={isPending}>
                    <SelectTrigger disabled={isPending}>
                      <SelectValue placeholder="Choose a plan" />
                    </SelectTrigger>
                    <SelectContent>
                      {plans.map((plan) => (
                        <SelectItem key={plan.id} value={plan.id}>
                          <div className="flex items-center justify-between w-full">
                            <span className="font-medium">{plan.name}</span>
                            <span className="text-xs text-gray-500 ml-4">
                              {plan.max_jobs} jobs · {plan.max_candidates} candidates
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedPlan && plans.find(p => p.id === selectedPlan) && (
                    <div className="mt-2 p-3 bg-blue-50 rounded-md border border-blue-200">
                      <div className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-blue-600 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium text-blue-900">
                            {plans.find(p => p.id === selectedPlan)?.name} Plan
                          </p>
                          <p className="text-blue-700 text-xs mt-1">
                            Up to {plans.find(p => p.id === selectedPlan)?.max_jobs} open jobs and{' '}
                            {plans.find(p => p.id === selectedPlan)?.max_candidates} candidates
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isPending || loadingPlans || !selectedPlan || !!companyNameError || checkingCompanyName || !companyName.trim()}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Sign Up'
              )}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <Link href="/sign-in" className="text-indigo-600 hover:underline cursor-pointer">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

