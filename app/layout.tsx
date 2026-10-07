import "./globals.css";
import type { Metadata } from "next";
export const metadata: Metadata={title:"Puja Collection 2026",description:"Maa Laxmi Puja Committee collection records"};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}