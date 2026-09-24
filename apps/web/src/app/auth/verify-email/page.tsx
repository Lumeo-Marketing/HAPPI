import { AuthPageShell } from '@/components/auth-page-shell'
import { VerifyEmailForm } from '@/components/verify-email-form'
import { getSafeNextPath } from '@/utils/auth-next'

interface VerifyEmailPageProps {
  searchParams: Promise<{
    email?: string | string[]
    next?: string | string[]
  }>
}

export default async function VerifyEmailPage({
  searchParams,
}: VerifyEmailPageProps) {
  const params = await searchParams
  const email = typeof params.email === 'string' ? params.email : ''
  const nextPath = getSafeNextPath(params.next)

  return (
    <AuthPageShell
      eyebrow="Email verification"
      title="Check your email"
      description="Enter your email address and the 6-digit code we sent you. The code expires after 10 minutes."
    >
      <VerifyEmailForm initialEmail={email} nextPath={nextPath} />
    </AuthPageShell>
  )
}
