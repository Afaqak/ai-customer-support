import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@mui/material";

import Navbar from "@/components/navbar";
import { getAuth } from "@/utils/get-auth";
import { theme } from "@/theme";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Ai Assistant",
  description: "An Ai chatbot to assist you in your search for answers",
};

export default async function RootLayout({ children }) {
  const auth = await getAuth();

  return (
    <html lang="en">
      <ThemeProvider theme={theme}>
        <body className={inter.className}>
          <Navbar user={auth?.user} />
          {children}
        </body>
      </ThemeProvider>
    </html>
  );
}
