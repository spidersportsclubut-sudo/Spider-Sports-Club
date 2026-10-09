import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Team Login | Spider Sports Club',
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
