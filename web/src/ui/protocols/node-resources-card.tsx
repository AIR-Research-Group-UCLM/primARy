import ImageListItem from "@mui/material/ImageListItem";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from '@mui/icons-material/Edit';
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import SaveIcon from '@mui/icons-material/SaveAlt';

type Props = {
  img: string;
}

export default function NodeResourcesCard( 
  { img, provisionalName, onSaveName, onNameChange, onModifyName, onCancelName }: Props
) {
  const resourceName = isModifying ? (
    <TextField
      margin="dense"
      fullWidth
      inputProps={{
        style: {
          textAlign: "center"
        }
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          onSaveName();
        } else if  (e.key === "Escape") {
          onCancelName();
        }
      }}
      onChange={(e) => onNameChange(e.target.value)}
      maxRows={2}
      multiline
      variant="standard"
    />
  ) : (
    <Typography
      variant="h6"
      component="div"
      sx={{
        marginBottom: "5px",
        maxHeight: "90px",
        display: "flex",
        justifyContent: "center",
        overflowY: "auto",
        flex: "1"
      }}>
      {item.title}
    </Typography>
  );

  return (
    <ImageListItem
      key={item.img}
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
        {resourceName}
        <IconButton onClick={() => isModifying ? onSaveName() : onModifyName(item.img)}>
          {isModifying ? <SaveIcon /> : <EditIcon />}
        </IconButton>
      </Box>
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
  );
}