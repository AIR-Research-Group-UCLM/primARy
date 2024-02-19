"use client";

import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useRouter } from "next/navigation";

function ProtocolCard() {
  const router = useRouter();

  return (
    <Paper
      sx={{
        // width: "250px",
        minWidth: "170px",
        width: "20%",
        border: "solid 1px",
        height: "200px",
        display: "flex",
        flexDirection: "column",
        padding: "5px",
        borderRadius: "30px",
      }}>
      <Box sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "2px",
        flex: "3 0",
        overflow: "scroll"
      }}>
        <Typography
          variant="h5"
          component="div"
          sx={{
            display: "flex",
            justifyContent: "center",
            alignContent: "center",
            alignItems: "center",
          }}
        >
          Overweight diagnosis
        </Typography>
      </Box>
      <Divider />
      <Box sx={{
        display: "flex",
        justifyContent: "space-around",
        padding: "10px 5px",
        gap: "10px",
        flex: "1 0"
      }}>
        <Button
          size="small"
          variant="outlined"
          startIcon={<DeleteIcon />}
        >
          Delete
        </Button>
        <Button
          size="small"
          variant="contained"
          startIcon={<EditIcon />}
          onClick={() => router.push("protocols/2")}
        >
          Edit
        </Button>
      </Box>
    </Paper>
  );
}

export default function Page() {
  return (
    <Box sx={{
      display: "flex",
      flexWrap: "wrap",
      gap: "30px 20px",
      backgroundColor: "inherit"
    }}>
      <ProtocolCard />
      <ProtocolCard />
      <ProtocolCard />
      <ProtocolCard />
      <ProtocolCard />
      <ProtocolCard />
      <ProtocolCard />
      <ProtocolCard />
      <ProtocolCard />
      <ProtocolCard />
    </Box>
  );
}