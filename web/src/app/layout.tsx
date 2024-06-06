"use client";

import "@/ui/global.css";

import { AppRouterCacheProvider } from "@mui/material-nextjs/v14-appRouter"
import { CssBaseline, ThemeProvider } from "@mui/material";

import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";

import { Navigation } from "../ui/navigation";
import theme from '@/ui/theme';
import ToastMessageProvider from "@/providers/toast";


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
              <Navigation drawerWidth={160} />
              <Box
                component="main"
                sx={{
                  height: "100vh",
                  width: "100%",
                  flex: "1",
                  bgcolor: "#f5f5f5",
                  padding: "10px"
                }}
              >
                <Toolbar variant="dense" />
                <ToastMessageProvider>
                  {children}
                </ToastMessageProvider>
              </Box>
            </Box>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}