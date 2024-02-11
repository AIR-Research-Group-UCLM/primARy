"use client";

import Typography from "@mui/material/Typography";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Drawer from "@mui/material/Drawer";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";

import { useRouter } from "next/navigation";

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

function UpperBar({ drawerWidth, title }: { drawerWidth: number, title: string }) {
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

function SideBar({ drawerWidth, onLinkClick }: { drawerWidth: number, onLinkClick?: (link: Link) => void }) {
  const router = useRouter();

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
        {links.map(link => (
          <ListItem key={link.name} disablePadding>
            <ListItemButton sx={{ pl: 3 }} onClick={() => {
              router.push(link.href)
              onLinkClick?.(link)
            }
            }>
              <ListItemText primary={link.name} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  )
}

export function Navigation({ drawerWidth }: { drawerWidth: number }
) {

  const [title, setTitle] = useState("");

  // TODO: the correct way to set the title is by looking at URL.
  // Otherwise, there exist a situation in which the title is out of sync
  // with the page currently being watched
  function handleLinkClick(link: Link) {
    setTitle(link.name);
  }

  return (
    <>
      <UpperBar drawerWidth={drawerWidth} title={title} />
      <SideBar drawerWidth={drawerWidth} onLinkClick={handleLinkClick} />
    </>
  )
}