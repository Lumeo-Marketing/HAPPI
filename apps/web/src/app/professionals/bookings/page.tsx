import { SiteHeader } from '@/components/site-header'
import { TherapistPortalTabs } from '@/components/therapist-portal-tabs'

const stats = [['PENDING REQUESTS', '0 to review'], ['CONFIRMED SESSIONS', '0 upcoming'], ['WALLET BALANCE', '₦184,000'], ['NEXT PAYOUT', 'Friday · ₦96,000']]

export default function BookingsPage() {
  const card = 'rounded-[1.25rem] border border-[#e1d9cc] bg-[#fffdf8]'
  return <main className="min-h-screen bg-[#fbf7ee] text-[#112f22]"><SiteHeader active="therapists-portal" /><div className="mx-auto w-[min(1240px,calc(100%_-_2.5rem))] pt-[.6rem] max-md:w-[calc(100%_-_2rem)]"><TherapistPortalTabs active="bookings" /><section className="pt-6"><div className="mb-[2.2rem] grid grid-cols-4 gap-4 max-md:grid-cols-1">{stats.map(([label, value]) => <article className={`${card} p-[1.35rem]`} key={label}><span className="text-[.73rem] tracking-[.08em] text-[#657167]">{label}</span><strong className="mt-3 block text-[1.1rem]">{value}</strong></article>)}</div><h1 className="m-0 font-[family-name:var(--happi-font-title)] text-[1.35rem]">Booking requests</h1><p className="mt-2 mb-5 text-[.87rem] leading-[1.55] text-[#566458]">Review what the client shared, then approve to confirm the session or decline the request.</p><div className={`${card} mt-[1.2rem] mb-8 p-6 text-[.9rem] text-[#657167]`}>No booking requests waiting for you.</div><h1 className="m-0 font-[family-name:var(--happi-font-title)] text-[1.35rem]">Confirmed schedule</h1><div className={`${card} mt-[1.2rem] mb-8 p-6 text-[.9rem] text-[#657167]`}>Approved sessions appear here and in the client’s dashboard.</div></section></div></main>
}
