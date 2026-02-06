'use client'
import { useState, useEffect } from 'react'

interface Props {
  targetDate: string
  compact?: boolean
}

export default function CountdownTimer({ targetDate, compact }: Props) {
  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 })

  useEffect(() => {
    const calc = () => {
      const diff = new Date(targetDate).getTime() - Date.now()
      if (diff <= 0) return { d: 0, h: 0, m: 0, s: 0 }
      return {
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      }
    }
    setTimeLeft(calc())
    const timer = setInterval(() => setTimeLeft(calc()), 1000)
    return () => clearInterval(timer)
  }, [targetDate])

  if (compact) {
    return (
      <div className="flex items-center gap-1.5">
        {[
          { v: timeLeft.d, l: 'd' },
          { v: timeLeft.h, l: 'h' },
          { v: timeLeft.m, l: 'm' },
          { v: timeLeft.s, l: 's' },
        ].map((u, i) => (
          <div key={i} className="flex items-center">
            <span className="bg-dark-800 text-white text-xs font-bold px-1.5 py-0.5 rounded min-w-[28px] text-center">
              {String(u.v).padStart(2, '0')}
            </span>
            <span className="text-dark-500 text-[10px] ml-0.5">{u.l}</span>
            {i < 3 && <span className="text-dark-600 text-xs mx-0.5">:</span>}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3">
      {[
        { v: timeLeft.d, l: 'Dias' },
        { v: timeLeft.h, l: 'Horas' },
        { v: timeLeft.m, l: 'Min' },
        { v: timeLeft.s, l: 'Seg' },
      ].map((u, i) => (
        <div key={i} className="text-center">
          <div className="bg-dark-800 border border-white/10 rounded-xl px-3.5 py-2.5 min-w-[56px]">
            <div className="text-white font-black text-xl tabular-nums">{String(u.v).padStart(2, '0')}</div>
          </div>
          <div className="text-dark-500 text-[10px] font-semibold uppercase tracking-wider mt-1.5">{u.l}</div>
        </div>
      ))}
    </div>
  )
}
