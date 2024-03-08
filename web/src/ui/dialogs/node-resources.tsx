import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import DeleteIcon from "@mui/icons-material/Delete";

import useProtocolStore from "@/hooks/store";

type Props = {
  isOpen: boolean;
  selectedNodeId: string;
  handleClose?: () => void;
}

const itemData = [
  {
    img: 'https://images.unsplash.com/photo-1551963831-b3b1ca40c98e',
    title: 'Breakfast',
  },
  {
    img: 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d',
    title: 'Burger',
  },
  {
    img: 'https://images.unsplash.com/photo-1522770179533-24471fcdba45',
    title: 'Camera',
  },
  {
    img: 'https://images.unsplash.com/photo-1444418776041-9c7e33cc5a9c',
    title: 'Coffee',
  },
  {
    img: 'https://images.unsplash.com/photo-1533827432537-70133748f5c8',
    title: 'Hats',
  },
  {
    img: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62',
    title: 'Honey',
  },
  {
    img: 'https://images.unsplash.com/photo-1516802273409-68526ee1bdd6',
    title: 'Basketball',
  },
  {
    img: 'https://images.unsplash.com/photo-1518756131217-31eb79b20e8f',
    title: 'Fern',
  },
  {
    img: 'https://images.unsplash.com/photo-1597645587822-e99fa5d45d25',
    title: 'Mushrooms',
  },
  {
    img: 'https://images.unsplash.com/photo-1567306301408-9b74779a11af',
    title: 'Tomato basil',
  },
  {
    img: 'https://images.unsplash.com/photo-1471357674240-e1a485acb3e1',
    title: 'Sea star',
  },
  {
    img: 'https://upload.wikimedia.org/wikipedia/commons/a/af/Tux.png',
    title: 'Bike',
  },
];

export default function NodeResourcesDialog(
  { isOpen, selectedNodeId, handleClose }: Props
) {
  const name = useProtocolStore((state) => state.nodesData.get(selectedNodeId)!.name);

  return (
    <Dialog
      open={isOpen}
      fullWidth
      maxWidth="md"
      onClose={handleClose}
    >
      <DialogTitle>
        {"Node resources"}
      </DialogTitle>
      <DialogContent>
        <ImageList
          sx={{
            width: "100%",
            height: "100%",
            padding: "0 10px"
          }}
          cols={3}
          gap={10}
        >
          {itemData.map((item) => (
            <ImageListItem
              key={item.img}
              sx={{
                border: "solid 1px",
                borderRadius: "20px",
                padding: "10px",
              }}
            >
              <Typography
                variant="h6"
                component="div"
                sx={{
                  marginBottom: "5px",
                  maxHeight: "90px",
                  display: "flex",
                  justifyContent: "center",
                  overflowY: "auto",
                }}>
                {item.title}
              </Typography>
              <Divider sx={{
                marginBottom: "10px"
              }} />
              <img
                src={`${item.img}?w=164&h=164&fit=crop&auto=format`}
                style={{
                  borderRadius: "10px"
                }}
                alt={item.title}
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
                  variant="outlined"
                  startIcon={<DeleteIcon />}
                >
                  Delete
                </Button>
              </Box>
            </ImageListItem>
          ))}
        </ImageList>
      </DialogContent>
    </Dialog>);
}