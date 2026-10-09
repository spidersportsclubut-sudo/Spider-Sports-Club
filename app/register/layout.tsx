import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Register | Spider Sports Club',
}

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
