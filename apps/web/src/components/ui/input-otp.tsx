'use client'

import { REGEXP_ONLY_DIGITS } from 'input-otp'
import {
  OTPInput,
  OTPInputContext,
} from 'input-otp'
import { useContext } from 'react'
import type { ComponentPropsWithoutRef } from 'react'

export function InputOTP({ className, ...props }: ComponentPropsWithoutRef<typeof OTPInput>) {
  return <OTPInput pattern={REGEXP_ONLY_DIGITS} containerClassName={`flex items-center gap-2 ${className ?? ''}`} {...props} />
}

export function InputOTPGroup({ className = '', ...props }: ComponentPropsWithoutRef<'div'>) {
  return <div className={`flex items-center gap-2 ${className}`} {...props} />
}

export function InputOTPSlot({ index, className = '', ...props }: ComponentPropsWithoutRef<'div'> & { index: number }) {
  const inputContext = useContext(OTPInputContext)
  const slot = inputContext.slots[index]

  return <div className={`grid h-12 w-10 place-items-center rounded-md border border-[#e1d9cc] bg-[#fffdf8] text-lg font-semibold text-[#112f22] ${className}`} {...props}>{slot?.char}</div>
}

export function InputOTPSeparator() {
  return <span className="px-2 text-[#566458]">-</span>
}
