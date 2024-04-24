import ImageListItem from "@mui/material/ImageListItem";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import DeleteIcon from "@mui/icons-material/Delete";
import { ReactNode } from "react";

type Props = {
  id: string;
  img: string;
  alt?: string;
  onDelete: (fileId: string) => void;
  onImgClick?: (fileId: string) => void;
  header: ReactNode
}

export default function FileCard(
  { id, img, alt, header, onDelete, onImgClick }: Props
) {
  return (
    <ImageListItem
      key={img}
      sx={{
        border: "solid 1px",
        borderRadius: "20px",
        padding: "10px",
      }}
    >
      <Box sx={{
        display: "flex",
        alignItems: "center",
        marginLeft: "30px",
      }}>
        {header}
      </Box>
      <Divider sx={{
        marginBottom: "10px"
      }} />
      <img
        src={img}
        onClick={() => onImgClick?.(id)}
        style={{
          borderRadius: "10px",
          cursor: onImgClick === undefined ? "auto": "pointer"
        }}
        alt={alt}
        loading="lazy"
      />
      <Divider sx={{
        marginTop: "10px"
      }} />
      <Box sx={{
        marginTop: "5px",
        display: "flex",
        justifyContent: "center",
      }}>
        <Button
          size="small"
          onClick={() => onDelete(id)}
          variant="outlined"
          startIcon={<DeleteIcon />}
        >
          Delete
        </Button>
      </Box>
    </ImageListItem>
  );
}