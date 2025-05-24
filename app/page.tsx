"use client"

import { Hero } from '@/components/ui/animated-hero'
import Image from 'next/image'
import Link from 'next/link'

export default function Home() {
  return (
    <>
      <nav className="w-full flex justify-between items-center p-4 border-b mb-6">
        <div className="text-lg font-bold">CM Salary Tool</div>
        <div className="flex gap-2">
          <Link href="/sign-up">
            <button className="px-4 py-2 bg-black text-white rounded">Sign Up</button>
          </Link>
          <Link href="/accountant/">
            <button className="px-4 py-2 bg-blue-600 text-white rounded">Accountant Cycle</button>
          </Link>
        </div>
      </nav>
      <Hero />
    </>
  )
}
