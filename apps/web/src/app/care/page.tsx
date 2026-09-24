import { SiteHeader } from '@/components/site-header'

const card =
  'rounded-[.65rem] border border-[#e1d9cc] bg-[#fffdf8] shadow-[0_1px_2px_rgba(39,29,17,.04)]'

export default function CarePage() {
  return (
    <main className="min-h-screen bg-[#fbf7ee] text-[#112f22]">
      <SiteHeader />
      <section className="mx-auto w-[min(1240px,calc(100%_-_2.5rem))] pt-[.9rem] pb-10 max-md:w-[calc(100%_-_2rem)]">
        <p className="mb-[.3rem] text-[.84rem] text-[#e5763d]">
          Private and secure
        </p>
        <h1 className="m-0 font-[family-name:var(--happi-font-title)] text-[2rem]">
          My care
        </h1>
        <span className="mt-[.45rem] block max-w-[42rem] text-[.9rem] leading-6 text-[#566458]">
          Manage your therapists, booking requests and upcoming sessions in one
          place.
        </span>

        <div className="mt-8 grid grid-cols-3 gap-4 max-md:grid-cols-1">
          <section className={`${card} p-[1.35rem]`}>
            <p className="m-0 text-[.73rem] tracking-[.08em] text-[#657167]">
              SAVED THERAPISTS
            </p>
            <strong className="mt-[.7rem] block text-lg">0 saved</strong>
          </section>
          <section className={`${card} p-[1.35rem]`}>
            <p className="m-0 text-[.73rem] tracking-[.08em] text-[#657167]">
              BOOKING REQUESTS
            </p>
            <strong className="mt-[.7rem] block text-lg">0 pending</strong>
          </section>
          <section className={`${card} p-[1.35rem]`}>
            <p className="m-0 text-[.73rem] tracking-[.08em] text-[#657167]">
              UPCOMING SESSIONS
            </p>
            <strong className="mt-[.7rem] block text-lg">0 scheduled</strong>
          </section>
        </div>

        <section className={`${card} mt-8 p-[1.35rem]`}>
          <p className="m-0 text-[.9rem] leading-6 text-[#566458]">
            Your confirmed sessions and therapist messages will appear here once
            booking is connected.
          </p>
        </section>
      </section>
    </main>
  )
}
