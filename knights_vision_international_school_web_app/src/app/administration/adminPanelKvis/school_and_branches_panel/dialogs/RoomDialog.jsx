import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
} from '@mui/material';
import { Add, Close, AddCircle } from '@mui/icons-material';
import axios from 'axios';
import Cookies from 'js-cookie';
import { toast, ToastContainer } from 'react-toastify';
import SchoolSelect from "@/components/sure-success-point-school/selectors/SchoolSelect";
import SchoolBranchSelect from "@/components/sure-success-point-school/selectors/SchoolBranchSelect";

const drawerWidth = 280;
const appBarHeight = 64;

const textFieldStyles = {
  '& .MuiInputBase-input': { color: '#fff' },
  '& .MuiInputLabel-root': { color: '#aaa' },
  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#555' },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#777' },
  '& .Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#00c853' },
  backgroundColor: '#333',
  borderRadius: '4px',
};

const RoomDialog = ({
  openInsertion,
  handleCloseModal,
  handleSaveAndCloseModal,
  editFields,
  setEditFields,
  fetchRooms,
}) => {
  const [rooms, setRooms] = useState(
    editFields.length > 0
      ? editFields
      : [{ schoolId: '', branchId: '', roomNumber: '', capacity: '', floor: '', type: '', supervisor: '' }]
  );

  const handleFieldChange = (index, field, value) => {
    const updatedRooms = [...rooms];
    updatedRooms[index] = { ...updatedRooms[index], [field]: value };
    setRooms(updatedRooms);
  };

  const handleAddRoom = () => {
    setRooms([...rooms, { schoolId: rooms[0].schoolId, branchId: rooms[0].branchId, roomNumber: '', capacity: '', floor: '', type: '', supervisor: '' }]);
  };

  const handleRemoveRoom = (index) => {
    if (rooms.length === 1) {
      toast.error('At least one room entry is required.');
      return;
    }
    const updatedRooms = rooms.filter((_, i) => i !== index);
    setRooms(updatedRooms);
  };

  const handleSaveChanges = async () => {
    const token = Cookies.get('administration_token');
    if (!token) {
      toast.error('User not authenticated.');
      return;
    }

    // Validate required fields
    for (const room of rooms) {
      if (!room.schoolId || !room.branchId || !room.roomNumber || !room.capacity) {
        toast.error('Please fill in all required fields for all rooms.');
        return;
      }
      if (room.roomNumber.length > 50) {
        toast.error('Room Number must be 50 characters or less.');
        return;
      }
      if (isNaN(room.capacity) || room.capacity <= 0) {
        toast.error('Capacity must be a positive number.');
        return;
      }
      if (room.floor && room.floor.length > 20) {
        toast.error('Floor must be 20 characters or less.');
        return;
      }
      if (room.type && room.type.length > 30) {
        toast.error('Type must be 30 characters or less.');
        return;
      }
      if (room.supervisor && room.supervisor.length > 100) {
        toast.error('Supervisor must be 100 characters or less.');
        return;
      }
    }

    try {
      const payloads = rooms.map((room) => ({
        schoolId: parseInt(room.schoolId),
        branchId: parseInt(room.branchId),
        roomNumber: room.roomNumber,
        capacity: parseInt(room.capacity),
        floor: room.floor || null,
        type: room.type || null,
        supervisor: room.supervisor || null,
        ...(room.id && { id: room.id }),
      }));

      const updates = payloads.filter((p) => p.id);
      const creates = payloads.filter((p) => !p.id);

      for (const update of updates) {
        const { id, ...data } = update;
        await axios.put(`/api/rooms/${id}`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      if (creates.length > 0) {
        await axios.post(`/api/rooms`, creates, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      toast.success('🎉 Rooms saved successfully!');
      handleSaveAndCloseModal();
      fetchRooms();
      setRooms([{ schoolId: '', branchId: '', roomNumber: '', capacity: '', floor: '', type: '', supervisor: '' }]);
      setEditFields([]);
    } catch (err) {
      console.error('Save Error:', err.response?.data || err.message);
      toast.error(err.response?.data?.error || '❌ Error saving rooms.');
    }
  };

  return (
    <Dialog
      sx={{
        position: 'fixed',
        top: `${appBarHeight}px`,
        left: `calc(${drawerWidth}px)`,
        transform: 'translate(0, 0)',
      }}
      open={openInsertion}
      onClose={handleCloseModal}
      fullScreen
    >
      <ToastContainer
        position="bottom-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      <ListItemButton
        sx={{
          backgroundColor: '#212121',
          color: '#fff',
          '&:hover': { backgroundColor: '#212121' },
        }}
      >
        <ListItemIcon>
          <Add />
        </ListItemIcon>
        <ListItemText sx={{ color: '#fff' }} primary="Manage Rooms" />
        <Button
          onClick={handleCloseModal}
          variant="outlined"
          color="error"
          sx={{ position: 'absolute', right: 8, top: 8, color: '#f44336' }}
        >
          <Close />
        </Button>
      </ListItemButton>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#000', color: '#fff' }}>
        <DialogContent>
          <Box sx={{ maxWidth: '800px', mx: 'auto', p: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <SchoolSelect
                selectedSchool={rooms[0].schoolId}
                setSelectedSchool={(value) => {
                  const updatedRooms = rooms.map((room) => ({ ...room, schoolId: value }));
                  setRooms(updatedRooms);
                }}
                disabled={rooms.some((room) => room.id)}
              />
              <SchoolBranchSelect
                selectedBranch={rooms[0].branchId}
                setSelectedBranch={(value) => {
                  const updatedRooms = rooms.map((room) => ({ ...room, branchId: value }));
                  setRooms(updatedRooms);
                }}
                disabled={rooms.some((room) => room.id)}
              />
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddCircle />}
                onClick={handleAddRoom}
                sx={{ ml: 'auto' }}
              >
                Add Room
              </Button>
            </Box>
            {rooms.map((room, index) => (
              <Box key={index} sx={{ border: '1px solid #555', p: 2, mb: 2, borderRadius: '4px', position: 'relative' }}>
                <IconButton
                  onClick={() => handleRemoveRoom(index)}
                  sx={{ position: 'absolute', right: 8, top: 8, color: '#f44336' }}
                >
                  <Close />
                </IconButton>
                <TextField
                  sx={textFieldStyles}
                  label="Room Number"
                  fullWidth
                  margin="normal"
                  value={room.roomNumber ?? ''}
                  onChange={(e) => handleFieldChange(index, 'roomNumber', e.target.value)}
                  required
                />
                <TextField
                  sx={textFieldStyles}
                  label="Capacity"
                  type="number"
                  fullWidth
                  margin="normal"
                  value={room.capacity ?? ''}
                  onChange={(e) => handleFieldChange(index, 'capacity', e.target.value)}
                  required
                />
                <TextField
                  sx={textFieldStyles}
                  label="Floor"
                  fullWidth
                  margin="normal"
                  value={room.floor ?? ''}
                  onChange={(e) => handleFieldChange(index, 'floor', e.target.value)}
                />
                <TextField
                  sx={textFieldStyles}
                  label="Type"
                  fullWidth
                  margin="normal"
                  value={room.type ?? ''}
                  onChange={(e) => handleFieldChange(index, 'type', e.target.value)}
                />
                <TextField
                  sx={textFieldStyles}
                  label="Supervisor"
                  fullWidth
                  margin="normal"
                  value={room.supervisor ?? ''}
                  onChange={(e) => handleFieldChange(index, 'supervisor', e.target.value)}
                />
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} variant="contained" color="error">
            Cancel
          </Button>
          <Button onClick={handleSaveChanges} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default RoomDialog;
