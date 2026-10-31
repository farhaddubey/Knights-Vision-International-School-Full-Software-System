"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  TextField,
  MenuItem,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import { Delete, Star, StarBorder } from '@mui/icons-material';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useCartAndWishlist } from '../../../lib/useCartAndWishlist';

const CustomerPaymentProfilesPage = () => {
  const { user, loading: authLoading, checkAuth } = useCartAndWishlist();
  const [paymentProfiles, setPaymentProfiles] = useState([]);
  const [fetching, setFetching] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);
  const [formData, setFormData] = useState({
    paymentType: '',
    accountHolder: '',
    upiId: '',
    cardNumber: '',
    walletProvider: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
  });
  const router = useRouter();

  useEffect(() => {
    // if (!user && !authLoading) {
    //   console.log('CustomerPaymentProfilesPage: No user, redirecting to /login');
    //   router.push('/login');
    //   return;
    // }

    const fetchPaymentProfiles = async () => {
      setFetching(true);
      console.log('CustomerPaymentProfilesPage: Fetching payment profiles for customer:', user?.id);
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/customer/payment-profiles', {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        console.log('CustomerPaymentProfilesPage: Payment profiles fetched:', response.data);
        setPaymentProfiles(response.data);
      } catch (error) {
        console.error('CustomerPaymentProfilesPage: Error fetching payment profiles:', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
        });
        toast.error(error.response?.data?.error || 'Failed to load payment profiles');
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          await checkAuth();
          router.push('/login');
        }
      } finally {
        setFetching(false);
      }
    };

    if (user) {
      fetchPaymentProfiles();
    }
  }, [user, authLoading, router, checkAuth]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddOrUpdate = async (e) => {
    e.preventDefault();
    setFetching(true);
    console.log('CustomerPaymentProfilesPage: Submitting payment profile:', formData);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
      if (editingProfile) {
        const response = await axios.put(
          `/api/customer/payment-profiles`,
          { id: editingProfile.id, ...formData },
          { headers, withCredentials: true }
        );
        setPaymentProfiles((prev) =>
          prev.map((profile) => (profile.id === editingProfile.id ? response.data : profile))
        );
        toast.success('Payment profile updated');
      } else {
        const response = await axios.post(
          `/api/customer/payment-profiles`,
          formData,
          { headers, withCredentials: true }
        );
        setPaymentProfiles((prev) => [...prev, response.data]);
        toast.success('Payment profile added');
      }
      setFormOpen(false);
      setEditingProfile(null);
      setFormData({
        paymentType: '',
        accountHolder: '',
        upiId: '',
        cardNumber: '',
        walletProvider: '',
        bankName: '',
        accountNumber: '',
        ifscCode: '',
      });
    } catch (error) {
      console.error('CustomerPaymentProfilesPage: Error saving payment profile:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      toast.error(error.response?.data?.error || 'Failed to save payment profile');
    } finally {
      setFetching(false);
    }
  };

  const handleEdit = (profile) => {
    console.log('CustomerPaymentProfilesPage: Editing payment profile:', profile.id);
    setEditingProfile(profile);
    setFormData({
      paymentType: profile.paymentType,
      accountHolder: profile.accountHolder || '',
      upiId: profile.upiId || '',
      cardNumber: profile.cardNumber || '',
      walletProvider: profile.walletProvider || '',
      bankName: profile.bankName || '',
      accountNumber: profile.accountNumber || '',
      ifscCode: profile.ifscCode || '',
    });
    setFormOpen(true);
  };

  const handleDelete = async (id) => {
    setFetching(true);
    console.log('CustomerPaymentProfilesPage: Deleting payment profile:', id);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/customer/payment-profiles`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
        data: { id },
      });
      setPaymentProfiles((prev) => prev.filter((profile) => profile.id !== id));
      toast.success('Payment profile deleted');
    } catch (error) {
      console.error('CustomerPaymentProfilesPage: Error deleting payment profile:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      toast.error(error.response?.data?.error || 'Failed to delete payment profile');
    } finally {
      setFetching(false);
    }
  };

  const handleSetDefault = async (id) => {
    setFetching(true);
    console.log('CustomerPaymentProfilesPage: Setting default payment profile:', id);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        `/api/customer/payment-profiles`,
        { id },
        { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
      );
      setPaymentProfiles((prev) =>
        prev.map((profile) => ({
          ...profile,
          isDefault: profile.id === id,
        }))
      );
      toast.success('Default payment profile set');
    } catch (error) {
      console.error('CustomerPaymentProfilesPage: Error setting default payment profile:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      toast.error(error.response?.data?.error || 'Failed to set default payment profile');
    } finally {
      setFetching(false);
    }
  };

  if (fetching || authLoading) {
    console.log('CustomerPaymentProfilesPage: Rendering loading spinner');
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress size={60} sx={{ color: '#0af' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: '1200px', mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ color: '#fff' }}>
        Manage Payment Profiles
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={() => setFormOpen(true)}
        sx={{ mb: 2 }}
        disabled={formOpen}
      >
        Add Payment Profile
      </Button>
      {formOpen && (
        <form onSubmit={handleAddOrUpdate}>
        <Box
  sx={{
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    mb: 3,
    bgcolor: '#1e1e1e',
    p: 2,
    borderRadius: 2,
    color: '#eee',
  }}
>
  <TextField
    select
    label="Payment Type"
    name="paymentType"
    value={formData.paymentType}
    onChange={handleFormChange}
    required
    InputLabelProps={{ style: { color: '#ccc' } }}
    InputProps={{ style: { backgroundColor: '#2a2a2a', color: '#eee' } }}
  >
    {['UPI', 'CARD', 'BANK_ACCOUNT', 'WALLET', 'CASH', 'OTHER'].map((type) => (
      <MenuItem key={type} value={type}>
        {type}
      </MenuItem>
    ))}
  </TextField>

  <TextField
    label="Account Holder"
    name="accountHolder"
    value={formData.accountHolder}
    onChange={handleFormChange}
    InputLabelProps={{ style: { color: '#ccc' } }}
    InputProps={{ style: { backgroundColor: '#2a2a2a', color: '#eee' } }}
  />

  {formData.paymentType === 'UPI' && (
    <TextField
      label="UPI ID"
      name="upiId"
      value={formData.upiId}
      onChange={handleFormChange}
      required
      InputLabelProps={{ style: { color: '#ccc' } }}
      InputProps={{ style: { backgroundColor: '#2a2a2a', color: '#eee' } }}
    />
  )}

  {formData.paymentType === 'CARD' && (
    <TextField
      label="Card Number"
      name="cardNumber"
      value={formData.cardNumber}
      onChange={handleFormChange}
      required
      InputLabelProps={{ style: { color: '#ccc' } }}
      InputProps={{ style: { backgroundColor: '#2a2a2a', color: '#eee' } }}
    />
  )}

  {formData.paymentType === 'WALLET' && (
    <TextField
      label="Wallet Provider"
      name="walletProvider"
      value={formData.walletProvider}
      onChange={handleFormChange}
      required
      InputLabelProps={{ style: { color: '#ccc' } }}
      InputProps={{ style: { backgroundColor: '#2a2a2a', color: '#eee' } }}
    />
  )}

  {formData.paymentType === 'BANK_ACCOUNT' && (
    <>
      <TextField
        label="Bank Name"
        name="bankName"
        value={formData.bankName}
        onChange={handleFormChange}
        required
        InputLabelProps={{ style: { color: '#ccc' } }}
        InputProps={{ style: { backgroundColor: '#2a2a2a', color: '#eee' } }}
      />
      <TextField
        label="Account Number"
        name="accountNumber"
        value={formData.accountNumber}
        onChange={handleFormChange}
        required
        InputLabelProps={{ style: { color: '#ccc' } }}
        InputProps={{ style: { backgroundColor: '#2a2a2a', color: '#eee' } }}
      />
      <TextField
        label="IFSC Code"
        name="ifscCode"
        value={formData.ifscCode}
        onChange={handleFormChange}
        InputLabelProps={{ style: { color: '#ccc' } }}
        InputProps={{ style: { backgroundColor: '#2a2a2a', color: '#eee' } }}
      />
    </>
  )}

  <Box sx={{ display: 'flex', gap: 1 }}>
    <Button type="submit" variant="contained" color="primary" disabled={fetching}>
      {editingProfile ? 'Update' : 'Add'} Profile
    </Button>
    <Button
      variant="outlined"
      color="secondary"
      onClick={() => {
        setFormOpen(false);
        setEditingProfile(null);
        setFormData({
          paymentType: '',
          accountHolder: '',
          upiId: '',
          cardNumber: '',
          walletProvider: '',
          bankName: '',
          accountNumber: '',
          ifscCode: '',
        });
      }}
    >
      Cancel
    </Button>
  </Box>
</Box>

        </form>
      )}
      <List>
        {paymentProfiles.map((profile, index) => (
          <React.Fragment key={profile.id}>
            <ListItem
              secondaryAction={
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton
                    onClick={() => handleEdit(profile)}
                    disabled={fetching}
                    sx={{ color: '#fff' }}
                  >
                    <Typography>Edit</Typography>
                  </IconButton>
                  <IconButton
                    onClick={() => handleDelete(profile.id)}
                    disabled={fetching}
                    sx={{ color: '#f44336' }}
                  >
                    <Delete />
                  </IconButton>
                  <IconButton
                    onClick={() => handleSetDefault(profile.id)}
                    disabled={fetching || profile.isDefault}
                    sx={{ color: profile.isDefault ? '#ffd700' : '#fff' }}
                  >
                    {profile.isDefault ? <Star /> : <StarBorder />}
                  </IconButton>
                </Box>
              }
            >
              <ListItemText
                sx={{ color: '#fff' }}
                primary={`${profile.paymentType} ${profile.isDefault ? '(Default)' : ''}`}
                secondary={
                  <>
                    {profile.accountHolder && <Typography sx={{color: "#fff"}} variant="body2">Holder: {profile.accountHolder}</Typography>}
                    {profile.upiId && <Typography sx={{color: "#fff"}} variant="body2">UPI: {profile.upiId}</Typography>}
                    {profile.cardNumber && <Typography sx={{color: "#fff"}} variant="body2">Card: ****{profile.cardNumber.slice(-4)}</Typography>}
                    {profile.walletProvider && <Typography sx={{color: "#fff"}} variant="body2">Wallet: {profile.walletProvider}</Typography>}
                    {profile.bankName && <Typography sx={{color: "#fff"}} variant="body2">Bank: {profile.bankName}</Typography>}
                    {profile.accountNumber && <Typography sx={{color: "#fff"}} variant="body2">Account: ****{profile.accountNumber.slice(-4)}</Typography>}
                    {profile.ifscCode && <Typography sx={{color: "#fff"}} variant="body2">IFSC: {profile.ifscCode}</Typography>}
                    <Typography sx={{color: "#fff"}} variant="body2">Verified: {profile.verified ? 'Yes' : 'No'}</Typography>
                  </>
                }
              />
            </ListItem>
            {index < paymentProfiles.length - 1 && <Divider sx={{ bgcolor: '#0af' }} />}
          </React.Fragment>
        ))}
      </List>
      {paymentProfiles.length === 0 && (
        <Typography sx={{ color: '#fff' }}>No payment profiles found.</Typography>
      )}
      <Button
        variant="outlined"
        color="primary"
        onClick={() => router.push('/')}
        sx={{ mt: 2 }}
      >
        Back to Home
      </Button>
    </Box>
  );
};

export default CustomerPaymentProfilesPage;