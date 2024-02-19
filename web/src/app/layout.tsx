import "@/ui/global.css";

import type { Metadata } from "next";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v14-appRouter"
import { CssBaseline, ThemeProvider } from "@mui/material";

import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";

import { Navigation } from "../ui/navigation";
import theme from '@/ui/theme';

export const metadata: Metadata = {
  title: "PrimARy",
  description: "An app to help healthcare professionals",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <body>
        <AppRouterCacheProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box sx={{
              display: "flex"
            }}>
              <Navigation drawerWidth={200} />
              <Box
                component="main"
                sx={{
                  height: "100vh",
                  width: "100%",
                  flexGrow: 1,
                  bgcolor: "#f5f5f5",
                  padding: "10px"
                }}
              >
                <Toolbar />
                {children}
              </Box>
            </Box>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}