import { AccountPanel } from '@/components/account-panel'
import { SiteHeader } from '@/components/site-header'
import { getSafeNextPath } from '@/utils/auth-next'

interface RegisterPageProps {
  searchParams: Promise<{ next?: string | string[] }>
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const params = await searchParams
  const nextPath = getSafeNextPath(params.next)

  return <main className="min-h-screen bg-[#fbf7ee] text-center text-[#112f22]"><SiteHeader authPage /><section className="mx-auto w-[min(28rem,calc(100%_-_2.5rem))] pt-3"><p className="mb-[.3rem] text-left text-[.84rem] text-[#e5763d]">Private and secure</p><h1 className="m-0 text-left font-[family-name:var(--happi-font-title)] text-[2rem]">Your Happi account</h1><span className="block text-left text-[.87rem] text-[#566458]">Manage your therapists, bookings and sessions in one place.</span><AccountPanel mode="register" nextPath={nextPath} /></section></main>
}
