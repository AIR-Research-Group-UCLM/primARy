"use client";

import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';

import Link from "next/link";

function ProtocolCard() {
  return (
    <Paper
      sx={{
        border: "solid 1px",
        display: "flex",
        flex: "1",
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
        flex: "1"
      }}>
        <Button
          size="small"
          variant="outlined"
          startIcon={<DeleteIcon />}
        >
          Delete
        </Button>
        <Button
          href="/protocols/9"
          component={Link}
          size="small"
          variant="contained"
          startIcon={<EditIcon />}
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
      flexDirection: "column",
      backgroundColor: "inherit",
      height: "91%",
      gap: "10px"
    }}>
      <Paper elevation={5} sx={{
        border: "solid 1px",
        borderRadius: "10px",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gridAutoRows: "200px",
        gridGap: "30px 20px",
        backgroundColor: "inherit",
        flex: "12",
        padding: "10px",
        overflow: "scroll"
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
        {/* <ProtocolCard /> */}
        {/* <ProtocolCard /> */}
        {/* <ProtocolCard /> */}
      </Paper>
      <Box sx={{
        display: "flex",
        justifyContent: "center",
        flex: "1",
        paddingBottom: "10px"
      }}>
        <Button
          variant="contained"
          size="medium"
          sx={{
            borderRadius: "30px"
          }}
          startIcon={<AddIcon />}
        >
          Create Protocol
        </Button>
      </Box>
    </Box>
  );
}
{/* <Button
  variant="contained"
  size="medium"
  sx={{
    borderRadius: "100px"
  }}
>
  <AddIcon />
</Button> */}