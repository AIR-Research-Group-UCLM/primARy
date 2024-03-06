import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

export default function LoadingSpinner() {
  return (
    <Box sx={{
      width: "100%",
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <CircularProgress size={250} />
    </Box>
  );
}