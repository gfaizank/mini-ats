import { signUpWithFailure } from '@/app/actions/test-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function TestSignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f9fb] px-4 py-8">
      <div className="w-full max-w-4xl space-y-6">
        <Card className="bg-yellow-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="text-yellow-800">🧪 TEST PAGE - Sign Up Bug Fix Testing</CardTitle>
            <CardDescription className="text-yellow-700">
              This page is for testing the sign-up error handling. Delete /app/test-signup after testing.
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Test 1: Plan Failure */}
          <Card>
            <CardHeader>
              <CardTitle>Test 1: Plan Lookup Failure</CardTitle>
              <CardDescription>
                Simulates: Free plan not found in database
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={(formData) => signUpWithFailure(formData, 'plan')} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName1">Company Name</Label>
                  <Input
                    id="companyName1"
                    name="companyName"
                    type="text"
                    defaultValue="Test Plan Failure"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email1">Email</Label>
                  <Input
                    id="email1"
                    name="email"
                    type="email"
                    defaultValue="test-plan@example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password1">Password</Label>
                  <Input
                    id="password1"
                    name="password"
                    type="password"
                    defaultValue="password123"
                    required
                    minLength={6}
                  />
                </div>
                <Button type="submit" className="w-full" variant="destructive">
                  Test Plan Failure
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Test 2: Company Failure */}
          <Card>
            <CardHeader>
              <CardTitle>Test 2: Company Creation Failure</CardTitle>
              <CardDescription>
                Simulates: Database error when creating company
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={(formData) => signUpWithFailure(formData, 'company')} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName2">Company Name</Label>
                  <Input
                    id="companyName2"
                    name="companyName"
                    type="text"
                    defaultValue="Test Company Failure"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email2">Email</Label>
                  <Input
                    id="email2"
                    name="email"
                    type="email"
                    defaultValue="test-company@example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password2">Password</Label>
                  <Input
                    id="password2"
                    name="password"
                    type="password"
                    defaultValue="password123"
                    required
                    minLength={6}
                  />
                </div>
                <Button type="submit" className="w-full" variant="destructive">
                  Test Company Failure
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Test 3: Member Failure */}
          <Card>
            <CardHeader>
              <CardTitle>Test 3: Member Insert Failure</CardTitle>
              <CardDescription>
                Simulates: Error adding user to company_members
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={(formData) => signUpWithFailure(formData, 'member')} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName3">Company Name</Label>
                  <Input
                    id="companyName3"
                    name="companyName"
                    type="text"
                    defaultValue="Test Member Failure"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email3">Email</Label>
                  <Input
                    id="email3"
                    name="email"
                    type="email"
                    defaultValue="test-member@example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password3">Password</Label>
                  <Input
                    id="password3"
                    name="password"
                    type="password"
                    defaultValue="password123"
                    required
                    minLength={6}
                  />
                </div>
                <Button type="submit" className="w-full" variant="destructive">
                  Test Member Failure
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Test 4: Normal Flow */}
          <Card>
            <CardHeader>
              <CardTitle>Test 4: Normal Sign Up (Should Work)</CardTitle>
              <CardDescription>
                Use the regular sign-up page for this test
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                This tests that our fix didn&apos;t break the normal flow.
              </p>
              <Button asChild className="w-full" variant="default">
                <Link href="/sign-up">Go to Normal Sign Up</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Expected Results for Each Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">✅ What Should Happen:</h4>
              <ul className="text-sm space-y-1 list-disc list-inside text-gray-700">
                <li>You see an error message on the sign-up page</li>
                <li>You are NOT logged in (check by trying to visit /)</li>
                <li>No user created in Supabase Auth</li>
                <li>No orphaned company or membership records</li>
                <li>You can try signing up again with the same email</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-red-600">❌ What Should NOT Happen:</h4>
              <ul className="text-sm space-y-1 list-disc list-inside text-red-600">
                <li>Getting stuck on the landing page while logged in</li>
                <li>Being unable to access /sign-in or /sign-up</li>
                <li>Seeing &quot;Account Setup Incomplete&quot; error</li>
                <li>Finding orphaned users in the database</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>How to Verify in Supabase</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-gray-700">After each test, check your Supabase dashboard:</p>
            <ol className="text-sm space-y-1 list-decimal list-inside text-gray-700">
              <li>Go to Authentication → Users</li>
              <li>Search for the test email (should NOT exist)</li>
              <li>Go to Table Editor → companies (should NOT have test company)</li>
              <li>Check server logs for cleanup messages</li>
            </ol>
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <Button asChild variant="outline">
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

