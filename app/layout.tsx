import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'FlowKeys — Learn by Doing', description: 'Typing, maths and physics practice for students.' }

export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="en"><body>{children}</body></html> }