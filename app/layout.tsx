import type { Metadata, Viewport } from "next";
import { Baloo_Bhaijaan_2 } from "next/font/google";
import "./globals.css";

const baloo = Baloo_Bhaijaan_2({
  variable: "--font-baloo",
  subsets: ["latin", "arabic"],
  weight: ["500", "700", "800"],
});

export const metadata: Metadata = {
  title: "Yalla Wash",
  description: "Book a wash for your car, bike or auto, join the live queue and collect stamps.",
  applicationName: "Yalla Wash",
  appleWebApp: { capable: true, title: "Yalla Wash", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  themeColor: "#0B1F3A",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${baloo.variable} antialiased`}>
      <body>
        {/* The app is a phone-width column; on wider screens it sits centred on navy. */}
        <div className="relative mx-auto min-h-dvh w-full max-w-[430px] bg-surface shadow-[0_0_40px_rgb(0_0_0/0.25)]">
          {children}
        </div>
      </body>
    </html>
  );
}
