import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Inter } from "next/font/google";
import AppErrorBoundary from "@/components/AppErrorBoundary";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className={inter.variable}>
      <AppErrorBoundary>
        <Component {...pageProps} />
      </AppErrorBoundary>
    </div>
  );
}
