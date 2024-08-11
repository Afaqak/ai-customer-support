import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@mui/material";
import { theme } from "@/client-layout";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Ai Assistant",
  description: "An Ai chatbot to assist you in your search for answers",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <ThemeProvider theme={theme}>

      <body className={inter.className}>{children}</body>
      </ThemeProvider>
    </html>
  );
}
