import "./globals.css";

export const metadata = {
  title: "Reel Log",
  description: "Track the movies you've watched, are watching, and want to watch.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
