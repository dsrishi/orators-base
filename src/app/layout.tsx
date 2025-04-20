import type { Metadata } from "next";
import { Inter, Lobster } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import AntdRegistry from "@/components/AntdRegistry";
import { UserProvider } from "@/contexts/UserContext";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// @eslint-disable-next-line no-unused-vars
const lobster = Lobster({
  weight: ["400"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OratorsBase",
  description: "Helping Orators Leave a Lasting Impact",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className}`}>
        <AntdRegistry>
          <ThemeProvider>
            <AuthProvider>
              <UserProvider>{children}</UserProvider>
            </AuthProvider>
          </ThemeProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
