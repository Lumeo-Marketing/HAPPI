import Link from 'next/link'

type PortalTab = 'application' | 'availability' | 'bookings'

export function TherapistPortalTabs({ active }: { active: PortalTab }) {
  const link = 'whitespace-nowrap px-[.55rem] py-[.45rem] text-[.85rem] text-[#566458] no-underline'
  const selected = '-m-0.5 rounded-[.55rem] border-2 border-[#195438] bg-[#fffdf8] text-[#112f22]'
  return <nav className="flex gap-[.35rem] overflow-x-auto rounded-[.55rem] bg-[#f0ede3] px-[.45rem] py-[.3rem]" aria-label="Professional portal"><Link className={`${link} ${active === 'application' ? selected : ''}`} href="/professionals">Application</Link><Link className={link} href="/professionals">Profile management</Link><Link className={`${link} ${active === 'availability' ? selected : ''}`} href="/professionals/availability">Availability</Link><Link className={`${link} ${active === 'bookings' ? selected : ''}`} href="/professionals/bookings">Bookings &amp; earnings</Link></nav>
}
