#!/bin/bash

# Test Verification Script
# Run this after testing to verify cleanup happened correctly

echo "🧪 Testing Sign-Up Bug Fix - Verification Script"
echo "================================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test emails to check
TEST_EMAILS=(
  "test-plan@example.com"
  "test-company@example.com"
  "test-member@example.com"
)

echo "${YELLOW}📧 Checking if test users were cleaned up...${NC}"
echo ""

# Note: This requires Supabase CLI to be installed and authenticated
# Install with: npm install -g supabase
# Login with: supabase login

for email in "${TEST_EMAILS[@]}"; do
  echo "Checking: $email"
  
  # Check in auth.users table
  # This command requires Supabase CLI
  # result=$(supabase db query "SELECT email FROM auth.users WHERE email = '$email';")
  
  echo "  → Check manually in Supabase Dashboard: Authentication → Users"
  echo ""
done

echo ""
echo "${YELLOW}📊 Manual Verification Checklist:${NC}"
echo ""
echo "1. Go to Supabase Dashboard → Authentication → Users"
echo "   Check that these emails DO NOT exist:"
for email in "${TEST_EMAILS[@]}"; do
  echo "   - $email"
done
echo ""

echo "2. Go to Supabase Dashboard → Table Editor → companies"
echo "   Check that these companies DO NOT exist:"
echo "   - Test Plan Failure"
echo "   - Test Company Failure"
echo "   - Test Member Failure"
echo ""

echo "3. Go to Supabase Dashboard → Table Editor → company_members"
echo "   Check that no orphaned memberships exist"
echo ""

echo "${YELLOW}🔍 Quick Test Steps:${NC}"
echo ""
echo "1. Visit: http://localhost:3001/test-signup"
echo "2. Click each 'Test [X] Failure' button"
echo "3. Verify you see an error message on /sign-up page"
echo "4. Try signing in with the test email (should fail - user doesn't exist)"
echo "5. Visit / (should show landing page, NOT logged in)"
echo ""

echo "${GREEN}✅ If all checks pass, the bug fix is working correctly!${NC}"
echo ""
echo "${RED}⚠️  Remember to delete these files after testing:${NC}"
echo "   - app/test-signup/page.tsx"
echo "   - app/actions/test-auth.ts"
echo "   - TEST_PLAN.md"
echo "   - verify-test.sh"
echo ""

