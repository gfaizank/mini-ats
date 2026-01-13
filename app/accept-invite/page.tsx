'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

function AcceptInviteContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [companyName, setCompanyName] = useState('a team')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const handleInvite = async () => {
      const supabase = createClient()
      
      // Get tokens from URL hash (Supabase redirect includes them in hash)
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const accessToken = hashParams.get('access_token')
      const refreshToken = hashParams.get('refresh_token')
      const type = hashParams.get('type') || searchParams.get('type')

      console.log('🔵 [ACCEPT INVITE] Processing invite...', { type, hasAccessToken: !!accessToken })

      if (type !== 'invite' || !accessToken) {
        setError('Invalid invitation link')
        setLoading(false)
        return
      }

      // Set the session with the tokens from the URL
      const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken!,
      })

      if (sessionError || !sessionData.user) {
        console.error('❌ [ACCEPT INVITE] Session error:', sessionError)
        setError('Invalid or expired invitation')
        setLoading(false)
        return
      }

      console.log('✅ [ACCEPT INVITE] Session set, user:', sessionData.user.id)
      
      setEmail(sessionData.user.email || '')

      // Get company name from user metadata
      const invitedToCompany = sessionData.user.user_metadata?.invited_to_company
      
      if (invitedToCompany) {
        const { data: membership } = await supabase
          .from('company_members')
          .select(`
            companies (
              name
            )
          `)
          .eq('user_id', sessionData.user.id)
          .eq('company_id', invitedToCompany)
          .single() as { data: { companies: { name: string } } | null }

        if (membership?.companies) {
          setCompanyName(membership.companies.name)
        }
      }

      setLoading(false)
    }

    handleInvite()
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    console.log('🔵 [ACCEPT INVITE] Submitting password...')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setIsSubmitting(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setIsSubmitting(false)
      return
    }

    const supabase = createClient()

    // Update the user's password
    const { error: updateError } = await supabase.auth.updateUser({
      password: password,
    })

    if (updateError) {
      console.error('❌ [ACCEPT INVITE] Password update failed:', updateError)
      setError(`Failed to set password: ${updateError.message}`)
      setIsSubmitting(false)
      return
    }

    console.log('✅ [ACCEPT INVITE] Password updated successfully')
    console.log('🎉 [ACCEPT INVITE] Invitation accepted! Redirecting...')

    // Redirect to dashboard
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fb]">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-gray-600">Loading invitation...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error && !email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fb] px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Invalid Invitation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => router.push('/sign-in')} variant="outline" className="w-full">
              Go to Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f9fb] px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Accept Your Invitation</CardTitle>
          <CardDescription>
            You&apos;ve been invited to join <strong>{companyName}</strong> on Mini ATS
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                readOnly
                disabled
                className="bg-gray-50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Set Your Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter a secure password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoFocus
                disabled={isSubmitting}
              />
              <p className="text-xs text-gray-500">Minimum 6 characters</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                disabled={isSubmitting}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Setting up your account...' : 'Accept Invitation & Join Team'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fb]">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-gray-600">Loading invitation...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    }>
      <AcceptInviteContent />
    </Suspense>
  )
}
