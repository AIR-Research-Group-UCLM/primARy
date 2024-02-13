"use client";

import Typography from "@mui/material/Typography";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Drawer from "@mui/material/Drawer";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Button from "@mui/material/Button";
import MuiLink from "@mui/material/Link";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";

import { usePathname } from "next/navigation";
import Link from 'next/link';

import { useState } from "react";

interface Link {
  name: string;
  href: string;
}

const links = [
  { name: "Protocols", href: "/protocols" },
  { name: "Model training" , href: "/training"},
  { name: 'Settings', href: '/settings' },
];

function UpperBar({ drawerWidth }: { drawerWidth: number }) {
  const pathname = usePathname();

  const title = links.find((link) => link.href === pathname)?.name ?? "";

  return (
    <AppBar
      position="fixed"
      sx={{ width: `calc(100% - ${drawerWidth}px)`, ml: `${drawerWidth}px` }}
    >
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          {title}
        </Typography>
      </Toolbar>
    </AppBar>
  )
}

function SideBar({ drawerWidth}: { drawerWidth: number }) {
  const pathname = usePathname();

  return (
    <Drawer
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
        },
      }}
      variant="permanent"
      anchor="left"
    >
      <Toolbar disableGutters sx={{
        px: 3
      }}>
        <Typography sx={{
          fontWeight: 800,
          fontSize: 20,
          mr: 4
        }}>
          PrimaARy
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {
          links.map((link) =>
            <ListItem key={link.name} sx={{
              padding: 0
            }}>
              <ListItemButton disableGutters component={Link} href={link.href} sx={{
                width: "100%",
                margin: "5px",
                border: `solid ${pathname == link.href ? "#4295f5" : "#c5c8c9"}`,
                borderRadius: 3,
                padding: "10px"
              }}>
                <Typography component="div">
                  {link.name}
                </Typography>
              </ListItemButton>
            </ListItem>
          )
        }
      </List>
    </Drawer>
  )
}

export function Navigation({ drawerWidth }: { drawerWidth: number }
) {

  return (
    <>
      <UpperBar drawerWidth={drawerWidth} />
      <SideBar drawerWidth={drawerWidth} />
    </>
  )
}