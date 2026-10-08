import "./globals.css";
import type {Metadata} from "next";

export const metadata:Metadata={
  title:"Puja Collection 2026 | Maa Laxmi Puja Committee",
  description:"Public collection records for Maa Laxmi Puja Committee 2026.",
  applicationName:"Puja Collection 2026",
  manifest:"/manifest.json",
  themeColor:"#8f3217",
  openGraph:{
    title:"Puja Collection 2026 | Maa Laxmi Puja Committee",
    description:"Transparent public collection records for Maa Laxmi Puja Committee 2026.",
    type:"website",
  },
  twitter:{
    card:"summary",
    title:"Puja Collection 2026 | Maa Laxmi Puja Committee",
    description:"Transparent public collection records for Maa Laxmi Puja Committee 2026.",
  },
};

export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
