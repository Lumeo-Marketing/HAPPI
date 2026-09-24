import Image from 'next/image'
import Link from 'next/link'

import { SiteHeader } from '@/components/site-header'

import heroImage from '../../public/images/hero-wellbeing.png'
import adaezeImage from '../../public/images/therapist-adaeze.png'
import hauwaImage from '../../public/images/therapist-hauwa.png'
import tundeImage from '../../public/images/therapist-tunde.png'

const therapists = [
  { name: 'Dr Adaeze Nwosu', title: 'Clinical Psychologist', focus: 'Anxiety · Burnout', price: 'From ₦25,000 · 50 min', image: adaezeImage },
  { name: 'Tunde Bakare', title: 'Licensed Psychotherapist', focus: 'Relationships · Life transitions', price: 'From ₦30,000 · 50 min', image: tundeImage },
  { name: 'Hauwa Ibrahim', title: 'Counselling Psychologist', focus: 'Sleep · Student pressure', price: 'From ₦18,000 · 50 min', image: hauwaImage },
]

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#fbf7ee] text-[#112f22]">
      <SiteHeader />

      <section className="relative isolate mt-4 min-h-[516px] overflow-hidden rounded-lg bg-[#164c32] mx-[clamp(1.25rem,4.1vw,3.5rem)] max-md:mx-0 max-md:min-h-[560px] max-md:rounded-none">
        <Image className="absolute inset-0 -z-20 h-full w-full object-cover" src={heroImage} alt="Woman taking a quiet moment at home" priority />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(14,74,48,.96),rgba(16,75,48,.79)_43%,rgba(16,43,25,.14)_75%)] max-md:bg-[linear-gradient(90deg,rgba(14,74,48,.94),rgba(16,75,48,.55))]" />
        <div className="w-[min(41rem,100%)] px-[clamp(2rem,4.4vw,4rem)] py-[clamp(3rem,5vw,5.5rem)] text-[#fffaf0]">
          <h1 className="m-0 max-w-lg font-[family-name:var(--happi-font-title)] text-[clamp(3rem,5.2vw,5rem)] leading-[1.02]">Mental healthcare that understands where you come from.</h1>
          <p className="my-7 max-w-[38rem] text-[1.06rem] leading-7">Meet qualified professionals who understand your culture, family, identity and lived experience. Compare openly, choose confidently and meet securely online.</p>
          <div className="flex flex-wrap gap-3">
            <Link className="inline-flex min-h-[2.6rem] items-center justify-center gap-3 rounded-md bg-[#fbf3de] px-[1.9rem] py-[.65rem] text-[.85rem] font-semibold text-[#163727] no-underline" href="/therapists">Find a therapist <span>→</span></Link>
            <Link className="inline-flex min-h-[2.6rem] items-center justify-center rounded-md border border-white/60 px-[1.9rem] py-[.65rem] text-[.85rem] font-semibold text-white no-underline" href="/professionals">Join as a therapist</Link>
          </div>
        </div>
      </section>

      <section className="mx-[clamp(1.25rem,4.1vw,3.5rem)] grid grid-cols-3 gap-12 border-b border-[#e2d9ca] py-[2.7rem] max-md:grid-cols-1 max-md:gap-6" aria-label="Why Happi">
        {[["✿", 'Verified professionals', 'Credentials reviewed before a profile goes live.'], ["◎", 'Culturally informed', 'Compare language, location and diaspora experience.'], ["▣", 'Care wherever you are', 'Private video and voice sessions across time zones.']].map(([icon, title, copy]) => <article className="flex gap-4" key={title}><span className="text-[1.55rem] text-[#e5763d]">{icon}</span><div><h2 className="m-0 mb-[.35rem] font-[family-name:var(--happi-font-title)] text-base">{title}</h2><p className="m-0 text-[.85rem] text-[#59665b]">{copy}</p></div></article>)}
      </section>

      <section className="px-[clamp(1.25rem,4.1vw,3.5rem)] pt-[4.2rem] pb-16">
        <div className="mb-[1.8rem] flex items-end justify-between gap-8 max-md:flex-col max-md:items-start"><div><p className="m-0 mb-[.45rem] text-[.88rem] text-[#e5763d]">Choose with confidence</p><h2 className="m-0 font-[family-name:var(--happi-font-title)] text-[clamp(2rem,3vw,2.75rem)]">Professionals ready to listen</h2></div><Link className="whitespace-nowrap rounded-md border border-[#dfd7ca] bg-[#fffdf7] px-4 py-[.65rem] text-center text-[.84rem] font-semibold text-[#182d22] no-underline shadow-sm" href="/therapists">View all therapists →</Link></div>
        <div className="grid grid-cols-3 gap-5 max-md:grid-cols-1">
          {therapists.map((therapist) => <article className="overflow-hidden rounded-lg border border-[#e1d9cc] bg-[#fffdf7]" key={therapist.name}>
            <Image className="h-[250px] w-full object-cover object-[center_22%] max-md:h-[300px]" src={therapist.image} alt={therapist.name} />
            <div className="p-5"><h3 className="m-0 font-[family-name:var(--happi-font-title)] text-[1.15rem]">{therapist.name} <span className="font-sans text-[.9rem] text-[#1f6143]">✿</span></h3><p className="mt-[.3rem] text-[.88rem] text-[#657167]">{therapist.title}</p><p className="mt-4 text-[.88rem]">{therapist.focus}</p><p className="mt-4 text-[.88rem]">{therapist.price}</p><Link className="mt-[1.35rem] block rounded-md border border-[#dfd7ca] bg-[#fffdf7] px-4 py-[.65rem] text-center text-[.84rem] font-semibold text-[#182d22] no-underline shadow-sm" href="/therapists">View profile</Link></div>
          </article>)}
        </div>
      </section>

      <section className="mx-[clamp(1.25rem,4.1vw,3.5rem)] mb-[6.5rem] bg-[linear-gradient(110deg,#fff2d9,#f3dabe)] px-10 py-[3.25rem] max-md:mx-5 max-md:mb-16 max-md:px-6 max-md:py-8">
        <p className="m-0 mb-[.45rem] text-[.88rem] text-[#e5763d]">How Happi works</p><h2 className="m-0 font-[family-name:var(--happi-font-title)] text-[clamp(2rem,3vw,2.75rem)]">From search to session, simply.</h2>
        <div className="mt-12 grid grid-cols-3 gap-12 max-md:mt-8 max-md:grid-cols-1 max-md:gap-6">
          {[['01', '♢', 'Discover and compare', 'Filter verified professionals by expertise, language, cultural experience, format and price.'], ['02', '▣', 'Book and pay', 'Choose a time in your timezone, review every detail and see the full cost before payment.'], ['03', '▱', 'Connect securely', 'Join your private video or voice session from your Happi care dashboard.']].map(([number, icon, title, copy]) => <article key={number}><span className="text-[.78rem] text-[#e5763d]">{number}</span><b className="my-[1.2rem] block text-[1.7rem] text-[#215a3d]">{icon}</b><h3 className="m-0 font-[family-name:var(--happi-font-title)] text-xl">{title}</h3><p className="text-[.9rem] leading-[1.7] text-[#5f675d]">{copy}</p></article>)}
        </div>
      </section>

      <footer className="grid grid-cols-[minmax(16rem,.7fr)_1.3fr] gap-16 border-t border-[#e2d9ca] bg-[#fffdf7] px-[clamp(1.25rem,4.1vw,3.5rem)] py-[2.6rem] max-md:grid-cols-1 max-md:gap-6"><div><Link className="font-[family-name:var(--happi-font-title)] text-[1.65rem] font-bold text-[#194e33] no-underline" href="/">Happi</Link><p className="max-w-lg text-[.82rem] leading-[1.55] text-[#59665b]">Professional mental-health care that understands where you come from, wherever you are.</p></div><p className="max-w-lg text-[.82rem] leading-[1.55] text-[#59665b]">♢ &nbsp; Happi is not an emergency service. If you are in immediate danger, contact local emergency services. In Nigeria, call 112 or the Nigeria Suicide Prevention Initiative on 0806 210 6493.</p></footer>
    </main>
  )
}
