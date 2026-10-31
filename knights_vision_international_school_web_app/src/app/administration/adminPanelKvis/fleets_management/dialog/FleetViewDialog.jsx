import React, { useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Button,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
} from '@mui/material';
import { Add, Close as CloseIcon } from '@mui/icons-material';
import moment from 'moment';

const appBarHeight = 64; // Adjust based on your app bar height
const drawerWidth = 240; // Adjust based on your drawer width

// Calculate remaining time for expiry dates
const calculateRemainingTime = (expiryDate) => {
  if (!expiryDate || !moment(expiryDate).isValid()) return 'N/A';
  const now = moment();
  const expiry = moment(expiryDate);
  const diffDays = expiry.diff(now, 'days');

  if (diffDays < 0) return 'Expired';
  if (diffDays === 0) return 'Today';
  return `${diffDays} days`;
};

const FleetViewDialog = ({
  openInsertion,
  handleCloseModal,
  handleSaveAndCloseModal,
  editFields,
  setEditFields,
}) => {
  // Handle save with error feedback
  const handleSaveChanges = useCallback(async () => {
    try {
      await handleSaveAndCloseModal();
    } catch (error) {
      console.error('Save failed:', error);
      // Optionally show a toast notification here
    }
  }, [handleSaveAndCloseModal]);

  // Define vehicle attributes with hints
  const vehicleAttributes = [
    // Identification
    { label: 'Registration Number', key: 'registrationNumber', hint: 'Vehicle registration plate number' },
    { label: 'Chassis Number', key: 'chassisNumber', hint: 'Unique chassis identifier' },
    { label: 'Engine Number', key: 'engineNumber', hint: 'Unique engine identifier' },
    { label: 'VIN Number', key: 'vinNumber', hint: 'Vehicle Identification Number' },

    // Vehicle Details
    { label: 'Vehicle Type', key: 'vehicleType', hint: 'Type of vehicle (e.g., Truck, Van)' },
    { label: 'Make', key: 'make', hint: 'Manufacturer of the vehicle' },
    { label: 'Model', key: 'model', hint: 'Model name of the vehicle' },
    { label: 'Variant', key: 'variant', hint: 'Specific variant of the model' },
    { label: 'Fuel Type', key: 'fuelType', hint: 'Type of fuel used' },
    { label: 'Transmission Type', key: 'transmissionType', hint: 'Manual/Automatic' },
    { label: 'Color', key: 'color', hint: 'Vehicle color' },
    { label: 'Seating Capacity', key: 'seatingCapacity', hint: 'Number of seats' },
    { label: 'Loading Capacity (kg)', key: 'loadingCapacityKg', hint: 'Maximum load weight' },

    // Legal Info
    { label: 'Registration Date', key: 'registrationDate', hint: 'Date of vehicle registration', isDate: true },
    { label: 'Model Year', key: 'modelYear', hint: 'Year of manufacture' },
    { label: 'RC Expiry Date', key: 'rcExpiryDate', hint: 'Registration Certificate expiry', isDate: true },
    { label: 'Fitness Expiry Date', key: 'fitnessExpiryDate', hint: 'Vehicle fitness certificate expiry', isDate: true },
    { label: 'Insurance Company', key: 'insuranceCompany', hint: 'Insurance provider' },
    { label: 'Insurance Policy Number', key: 'insurancePolicyNumber', hint: 'Insurance policy identifier' },
    { label: 'Insurance Expiry Date', key: 'insuranceExpiryDate', hint: 'Insurance policy expiry', isDate: true },
    { label: 'PUC Expiry Date', key: 'pucExpiryDate', hint: 'Pollution Under Control certificate expiry', isDate: true },
    { label: 'Permit Type', key: 'permitType', hint: 'Type of vehicle permit' },
    { label: 'Permit Expiry Date', key: 'permitExpiryDate', hint: 'Permit expiry date', isDate: true },

    // Operational Info
    { label: 'Odometer', key: 'odometer', hint: 'Current mileage reading' },
    { label: 'Last Service Date', key: 'lastServiceDate', hint: 'Date of last service', isDate: true },
    { label: 'Next Service Due Date', key: 'nextServiceDueDate', hint: 'Next scheduled service', isDate: true },
    { label: 'Warranty Expiry Date', key: 'warrantyExpiryDate', hint: 'Warranty end date', isDate: true },
    { label: 'Lease Expiry Date', key: 'leaseExpiryDate', hint: 'Lease agreement end date', isDate: true },

    // Status
    { label: 'Status', key: 'status', hint: 'Current vehicle status' },
    { label: 'Ownership Type', key: 'ownershipType', hint: 'Owned/Leased' },
    { label: 'Decommission Date', key: 'decommissionDate', hint: 'Date vehicle was decommissioned', isDate: true },
    { label: 'Remarks', key: 'remarks', hint: 'Additional notes' },

    // Relational
    { label: 'Assigned Driver ID', key: 'assignedDriverId', hint: 'ID of assigned driver' },
    { label: 'Depot ID', key: 'depotId', hint: 'ID of assigned depot' },

    // Telematics
    { label: 'GPS Device ID', key: 'gpsDeviceId', hint: 'GPS tracking device identifier' },
    { label: 'Telematics Profile', key: 'telematicsProfile', hint: 'Telematics configuration', isObject: true },

    // Metadata
    { label: 'Created At', key: 'createdAt', hint: 'Record creation date', isDate: true },
    { label: 'Updated At', key: 'updatedAt', hint: 'Record last updated date', isDate: true },
  ];

  // Show loading state if editFields is not available
  if (!editFields) {
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
        <DialogContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

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
      <ListItemButton
        sx={{
          backgroundColor: '#009688',
          color: '#fff',
          '&:hover': { backgroundColor: '#009688' },
        }}
      >
        <ListItemIcon>
          <Add />
        </ListItemIcon>
        <ListItemText
          sx={{ color: '#fff' }}
          primary={editFields?.id ? 'Update Vehicle' : 'Register Vehicle'}
        />
        <Button
          onClick={handleCloseModal}
          variant="outlined"
          color="error"
          sx={{ position: 'absolute', right: 8, top: 8, color: '#f44336' }}
        >
          <CloseIcon />
        </Button>
      </ListItemButton>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          height: '100%',
          backgroundColor: '#000',
          color: '#fff',
        }}
      >
 <Box
  sx={{
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
    backgroundColor: '#121212',
    borderRadius: 2,
    boxShadow: '0 0 12px rgba(0,0,0,0.5)',
    '&::-webkit-scrollbar': { width: '8px' },
    '&::-webkit-scrollbar-thumb': { backgroundColor: '#444', borderRadius: 4 },
  }}
>
  <DialogContent>
    <TableContainer
      component={Paper}
      sx={{
        backgroundColor: '#1a1a1a',
        maxHeight: '80vh',
        borderRadius: 2,
        boxShadow: '0 0 10px rgba(0,0,0,0.4)',
      }}
    >
      <Table stickyHeader aria-label="vehicle details table">
        <TableHead>
          <TableRow>
            <TableCell
              sx={{
                color: '#fff',
                fontWeight: 'bold',
                backgroundColor: '#2c2c2c',
                borderBottom: '1px solid #444',
              }}
            >
              Attribute
            </TableCell>
            <TableCell
              sx={{
                color: '#fff',
                fontWeight: 'bold',
                backgroundColor: '#2c2c2c',
                borderBottom: '.3px solid #444',
              }}
            >
              Value
            </TableCell>
            <TableCell
              sx={{
                color: '#fff',
                fontWeight: 'bold',
                backgroundColor: '#2c2c2c',
                borderBottom: '1px solid #444',
              }}
            >
              Remaining Time
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {vehicleAttributes.map((attr) => (
            <TableRow
              key={attr.key}
              sx={{backgroundColor: '#000',
                '&:hover': { backgroundColor: '#111' },
                borderBottom: '1px solid #333',
              }}
            >
              <TableCell sx={{ color: '#ddd' }}>
                <Typography variant="body2" title={attr.hint}>
                  {attr.label}
                </Typography>
              </TableCell>
              <TableCell sx={{ color: '#ccc', fontFamily: 'monospace' }}>
                {attr.isObject
                  ? JSON.stringify(editFields?.[attr.key] ?? {}, null, 2)
                  : attr.isDate && editFields?.[attr.key]
                  ? moment(editFields[attr.key]).format('YYYY-MM-DD')
                  : editFields?.[attr.key] ?? 'N/A'}
              </TableCell>
              <TableCell
                sx={{
                  color:
                    attr.isDate && calculateRemainingTime(editFields?.[attr.key]) === 'Expired'
                      ? '#f44336'
                      : '#aaa',
                }}
              >
                {attr.isDate ? calculateRemainingTime(editFields?.[attr.key]) : 'N/A'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>

    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
      <Button
        variant="contained"
        color="primary"
        onClick={handleCloseModal}
        disabled={!editFields}
        sx={{ boxShadow: '0 0 10px #1976d2' }}

      >
        Save Changes
      </Button>
      <Button
        variant="outlined"
        color="error"
        onClick={handleCloseModal}
        sx={{ color: '#f44336', borderColor: '#f44336' }}
      >
        Cancel
      </Button>
    </Box>
  </DialogContent>
</Box>

      </Box>
    </Dialog>
  );
};

export default FleetViewDialog;