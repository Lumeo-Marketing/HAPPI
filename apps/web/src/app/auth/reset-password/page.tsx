import Link from 'next/link'

import { ResetPasswordForm } from '@/components/password-recovery-forms'
import { SiteHeader } from '@/components/site-header'

interface ResetPasswordPageProps {
  searchParams: Promise<{
    requested?: string | string[]
    token?: string | string[]
  }>
}

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const params = await searchParams
  const requested = params.requested === '1'
  const token = typeof params.token === 'string' ? params.token : ''

  return (
    <main className="min-h-screen bg-[#fbf7ee] text-[#112f22]">
      <SiteHeader />
      <section className="mx-auto w-[min(28rem,calc(100%_-_2.5rem))] pt-3">
        <p className="mb-[.3rem] text-left text-[.84rem] text-[#e5763d]">
          Account recovery
        </p>
        <h1 className="m-0 text-left font-[family-name:var(--happi-font-title)] text-[2rem]">
          Create a new password
        </h1>
        <span className="block text-left text-[.87rem] text-[#566458]">
          Use the token from your email and choose a new password.
        </span>
        <div className="mt-[1.8rem]">
          <ResetPasswordForm initialToken={token} requestSent={requested} />
        </div>
        <Link
          className="mt-6 block text-center text-[.85rem] text-[#195438] no-underline"
          href="/auth/login"
        >
          Back to sign in
        </Link>
      </section>
    </main>
  )
}
