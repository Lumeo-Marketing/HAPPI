import Image from 'next/image'
import Link from 'next/link'

import { SiteHeader } from '@/components/site-header'

import adaezeImage from '../../../public/images/therapist-adaeze.png'
import chineloImage from '../../../public/images/therapist-chinelo.png'
import hauwaImage from '../../../public/images/therapist-hauwa.png'
import tundeImage from '../../../public/images/therapist-tunde.png'

const therapists = [
  { name: 'Dr Adaeze Nwosu', title: 'Clinical Psychologist', tags: ['Anxiety', 'Burnout', 'Work stress'], meta: '9 yrs · English, Igbo · ₦25,000 / $45 · 50 min', availability: 'Next available: Weekday evenings, WAT', image: adaezeImage, slug: 'adaeze-nwosu' },
  { name: 'Tunde Bakare', title: 'Licensed Psychotherapist', tags: ['Relationships', 'Life transitions', 'Grief'], meta: '12 yrs · English, Yoruba · ₦30,000 / $55 · 50 min', availability: 'Next available: Weekday mornings, WAT', image: tundeImage, slug: 'tunde-bakare' },
  { name: 'Hauwa Ibrahim', title: 'Counselling Psychologist', tags: ['Sleep', 'Student pressure', 'Low mood'], meta: '6 yrs · English, Hausa · ₦18,000 / $35 · 50 min', availability: 'Next available: Evenings and weekends, WAT', image: hauwaImage, slug: 'hauwa-ibrahim' },
  { name: 'Dr Chinelo Eze', title: 'Psychotherapist', tags: ['Trauma', 'Emotional wellbeing', 'Anxiety'], meta: '15 yrs · English, Pidgin · ₦40,000 / $70 · 50 min', availability: 'Next available: Weekday afternoons, GMT', image: chineloImage, slug: 'chinelo-eze' },
]

export default function TherapistsPage() {
  const field = 'grid gap-[.4rem] text-[.83rem] text-[#566458]'
  const select = 'min-w-44 rounded-[.6rem] border border-[#e1d9cc] bg-[#fbf7ee] px-[.9rem] py-[.62rem] text-[#112f22]'
  return <main className="min-h-screen bg-[#fbf7ee] text-[#112f22]">
    <SiteHeader active="therapists" />
    <section className="mx-auto w-[min(1112px,calc(100%_-_2.5rem))] pt-1 pb-[6.5rem]">
      <h1 className="m-0 font-[family-name:var(--happi-font-title)] text-[2.1rem]">Verified therapists</h1><p className="mt-[.45rem] mb-[1.6rem] text-[.9rem] text-[#59665b]">Every professional listed is credential-verified before joining Happi.</p>
      <form className="flex items-end gap-4 rounded-2xl border border-[#e1d9cc] bg-[#fffdf8] px-5 py-[1.35rem] max-md:flex-col max-md:items-stretch"><label className={field}>Concern<select className={select} defaultValue="All"><option>All</option><option>Anxiety</option><option>Relationships</option></select></label><label className={field}>Language<select className={select} defaultValue="All"><option>All</option><option>English</option><option>Hausa</option></select></label><label className={`${field} min-w-48 max-md:w-full`}>Max price: ₦40,000<input className="accent-[#195438]" type="range" min="10000" max="50000" defaultValue="40000" /></label></form>
      <div className="mt-[1.45rem] grid grid-cols-2 gap-4 max-md:grid-cols-1">{therapists.map((therapist) => <article className="grid grid-cols-[56px_1fr] gap-x-4 rounded-2xl border border-[#e1d9cc] bg-[#fffdf8] p-6" key={therapist.slug}><Image className="row-start-1 h-14 w-14 rounded-xl object-cover" src={therapist.image} alt={therapist.name} /><div className="flex items-start justify-between"><div><h2 className="my-[.2rem] font-[family-name:var(--happi-font-title)] text-xl">{therapist.name}</h2><p className="mt-[.45rem] text-[.86rem] text-[#566458]">{therapist.title}</p></div><span className="whitespace-nowrap rounded-full bg-[#f1ead3] px-[.7rem] py-[.35rem] text-xs text-[#174d33]">✓ Verified</span></div><div className="col-span-full mt-[1.15rem] flex flex-wrap gap-2">{therapist.tags.map((tag) => <span className="rounded-full bg-[#f1ead3] px-3 py-[.35rem] text-[.73rem]" key={tag}>{tag}</span>)}</div><p className="col-span-full mt-[.45rem] text-[.86rem] text-[#566458]">{therapist.meta}</p><p className="col-span-full mt-[.45rem] text-[.86rem] text-[#e5763d]">{therapist.availability}</p><Link className="col-span-full mt-[1.3rem] rounded-[.35rem] bg-[#195438] p-[.65rem] text-center text-[.85rem] font-semibold text-[#fffdf8] no-underline" href={`/therapists/${therapist.slug}`}>View profile</Link></article>)}</div>
    </section>
    <footer className="grid grid-cols-[minmax(16rem,.7fr)_1.3fr] gap-16 border-t border-[#e2d9ca] bg-[#fffdf7] px-[clamp(1.25rem,4.1vw,3.5rem)] py-[2.6rem] max-md:grid-cols-1 max-md:gap-6"><div><Link className="font-[family-name:var(--happi-font-title)] text-[1.65rem] font-bold text-[#194e33] no-underline" href="/">Happi</Link><p className="max-w-lg text-[.82rem] leading-[1.55] text-[#59665b]">Professional mental-health care that understands where you come from, wherever you are.</p></div><p className="max-w-lg text-[.82rem] leading-[1.55] text-[#59665b]">♢ &nbsp; Happi is not an emergency service. If you are in immediate danger, contact local emergency services. In Nigeria, call 112 or the Nigeria Suicide Prevention Initiative on 0806 210 6493.</p></footer>
  </main>
}
