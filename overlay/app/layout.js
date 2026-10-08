import { Bricolage_Grotesque } from "next/font/google";
import "./globals.css";

const sans = Bricolage_Grotesque({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "Reel Log",
  description: "Track the movies you've watched, are watching, and want to watch.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={sans.variable}>
      <body>{children}</body>
    </html>
  );
}
