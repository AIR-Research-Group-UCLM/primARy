import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

import Link from "next/link";

import type {ProtocolSummary} from "@/types";

type Props = {
  protocol: ProtocolSummary;
  onDeleteClick?: (protocolId: number) => void;
}


export default function ProtocolCard({protocol, onDeleteClick}: Props) {
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
        flex: "3",
        overflow: "scroll"
      }}>
        <Typography
          variant="h5"
          component="div"
          sx={{
            display: "flex",
            justifyContent: "center",
            height: "100%",
            alignContent: "center",
            alignItems: "center",
          }}
        >
          {protocol.name}
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
          onClick={() => onDeleteClick?.(protocol.id)}
          size="small"
          variant="outlined"
          startIcon={<DeleteIcon />}
        >
          Delete
        </Button>
        <Button
          href={`/protocols/${protocol.id}`}
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