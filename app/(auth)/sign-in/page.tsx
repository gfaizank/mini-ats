'use client'

import { signIn } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { useTransition, useEffect, Suspense } from 'react'
import { Loader2, CheckCircle2 } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'

function SignInForm() {
  const [isPending, startTransition] = useTransition()
  const searchParams = useSearchParams()
  const verified = searchParams.get('verified')
  const error = searchParams.get('error')

  useEffect(() => {
    if (verified === 'true') {
      toast.success('Email verified successfully! You can now sign in.', {
        duration: 5000,
      })
    }
    if (error) {
      toast.error(decodeURIComponent(error))
    }
  }, [verified, error])

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      await signIn(formData)
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f9fb] px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome back</CardTitle>
          <CardDescription>
            Sign in to your account to continue
          </CardDescription>
          {verified === 'true' && (
            <div className="mt-4 p-3 bg-green-50 rounded-md border border-green-200">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-green-900">Email Verified!</p>
                  <p className="text-green-700 text-xs mt-1">
                    Your email has been successfully verified. Please sign in to continue.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                disabled={isPending}
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
                disabled={isPending}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/sign-up" className="text-indigo-600 hover:underline cursor-pointer">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fb] px-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </CardContent>
        </Card>
      </div>
    }>
      <SignInForm />
    </Suspense>
  )
}

