"use client";

import Typography from "@mui/material/Typography";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Drawer from "@mui/material/Drawer";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";

import { usePathname } from "next/navigation";
import Link from 'next/link';


interface Link {
  name: string;
  href: string;
}

const links = [
  { name: "Protocols", href: "/protocols" },
  { name: "LLM", href: "/llm" },
  { name: "Settings", href: "/settings" },
];

function getRootPath(pathname: string) {
  const [_, rootPath] = pathname.split("/");
  return `/${rootPath}`;
}

function UpperBar({ drawerWidth }: { drawerWidth: number }) {
  const pathname = usePathname();
  const rootPath = getRootPath(pathname);

  const title = links.find((link) => link.href === rootPath)?.name ?? "";

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

function SideBar({ drawerWidth }: { drawerWidth: number }) {
  const pathname = usePathname();
  const rootPath = getRootPath(pathname);

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
                border: `solid ${rootPath === link.href ? "#4295f5" : "#c5c8c9"}`,
                backgroundColor: rootPath == link.href ? "#ebf8fc" : "white",
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