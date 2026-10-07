import type { Metadata, Viewport } from "next";
import { sans, script, serif } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "TellXR",
    template: "%s · TellXR",
  },
  description: "Immersive invitations that open beautifully on any phone.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0F2E2B",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${serif.variable} ${script.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
