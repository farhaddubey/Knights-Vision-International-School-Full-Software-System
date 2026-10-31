import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  ListItem,
  ListItemIcon,
  ListItemText,
  LinearProgress,
  Typography,
} from "@mui/material";
import { Add, RotateRight, Close } from "@mui/icons-material";
import axios from "axios";
import { toast } from "react-toastify";
import textFieldStyles from "../../../../mui_styles/TextFieldStyles";

const drawerWidth = 280;
const appBarHeight = 64;

const BrowseCurrenciesDialog = ({
  openInsertion,
  handleCloseModal,
  handleSaveAndCloseModal,
  editFields,
  setEditFields,
  fetchCurrencies,
}) => {
  const [apiLoading, setApiLoading] = useState(false);
  const [error, setError] = useState(null);

  const isEditing = !!editFields.id;

  const handleSaveChanges = async () => {
    setApiLoading(true);
    try {
      const payload = {
        name: editFields.name,
        code: editFields.code,
        symbol: editFields.symbol,
      };

      const apiUrl = isEditing ? `/api/currencies/${editFields.id}` : "/api/currencies";

      const response = isEditing
        ? await axios.put(apiUrl, payload)
        : await axios.post(apiUrl, payload);

      if (response.status === 200 || response.status === 201) {
        toast.success(isEditing ? "Currency Updated!" : "New Currency Added!");
        handleSaveAndCloseModal();
      }
    } catch (err) {
      console.error("Save Error:", err.response?.data || err.message);
      setError(isEditing ? "Error updating currency." : "Error adding new currency.");
      toast.error(err.response?.data?.error || "Error saving currency.");
    } finally {
      setApiLoading(false);
    }
  };

  return (
   <Dialog
      sx={{
        position: "fixed",
        top: `${appBarHeight}px`,
        left: `calc(${drawerWidth}px)`,
        transform: "translate(0, 0)",
      }}
      open={openInsertion}
      onClose={handleCloseModal}
      fullScreen
    >
      {apiLoading && <LinearProgress sx={{ width: "100%", position: "absolute", top: 0 }} />}
      <ListItem sx={{ backgroundColor: "#009688", color: "#fff" }}>
        <ListItemIcon>
          <Add />
        </ListItemIcon>
        <ListItemText primary={isEditing ? "Edit Currency" : "Add New Currency"} />
        <Button
          onClick={fetchCurrencies}
          variant="outlined"
          sx={{ position: "absolute", right: 80, top: 8, color: "#00c853", borderColor: "#00c853" }}
          startIcon={<RotateRight />}
        >
          Refresh
        </Button>
      <Button
          onClick={handleCloseModal}
          variant="outlined"
          sx={{ position: "absolute", right: 8, top: 8, color: "#f44336", borderColor: "#f44336" }}
          startIcon={<Close />}
        >
          Close Modal
        </Button>
      </ListItem>

      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          height: "100%",
          backgroundColor: "#000",
          color: "#fff",
        }}
      >
        <Box
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "auto",
            "&::-webkit-scrollbar": { display: "none" },
          }}
        >
          <DialogContent>
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                height: "100%",
                backgroundColor: "#000",
                color: "#fff",
                p: 2,
              }}
            >
              <Box sx={{ flex: 1, overflow: "auto", pr: 1, maxHeight: "80vh" }}>
                <TextField
                  label="Name"
                  name="name"
                  fullWidth
                  margin="normal"
                  value={editFields.name ?? ""}
                  onChange={(e) => setEditFields({ ...editFields, name: e.target.value })}
                  sx={textFieldStyles}
                />
                <TextField
                  label="Code"
                  name="code"
                  fullWidth
                  margin="normal"
                  value={editFields.code ?? ""}
                  onChange={(e) => setEditFields({ ...editFields, code: e.target.value })}
                  sx={textFieldStyles}
                />
                <TextField
                  label="Symbol"
                  name="symbol"
                  fullWidth
                  margin="normal"
                  value={editFields.symbol ?? ""}
                  onChange={(e) => setEditFields({ ...editFields, symbol: e.target.value })}
                  sx={textFieldStyles}
                />
              </Box>
            </Box>
            {error && error (
              <Typography color="error" sx={{ mt: 2, textAlign: "center" }}>
                {error}
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModal} variant="contained" color="error">
              Cancel
            </Button>
            <Button onClick={handleSaveAndCloseModal} variant="contained" color="primary">
              Save Changes
            </Button>
          </DialogActions>
        </Box>
        </Box>
    </Dialog>
  );
};

export default BrowseCurrenciesDialog;