"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  FormControlLabel,
  Checkbox,
  MenuItem,
} from '@mui/material';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useCartAndWishlist } from '../../../lib/useCartAndWishlist';

const CustomerProfilePage = () => {
  const { user, loading: authLoading, checkAuth } = useCartAndWishlist();
  const [profile, setProfile] = useState(null);
  const [fetching, setFetching] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [districts, setDistricts] = useState([]);
  const [states, setStates] = useState([]);
  const [countries, setCountries] = useState([]);
  const router = useRouter();

  useEffect(() => {
    // if (!user && !authLoading) {
    //   console.log('CustomerProfilePage: No user, redirecting to /login');
    //   router.push('/login');
    //   return;
    // }

    const fetchProfile = async () => {
      setFetching(true);
      console.log('CustomerProfilePage: Fetching profile for customer:', user?.id);
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/customer/profile', {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        console.log('CustomerProfilePage: Profile fetched:', response.data);
        setProfile(response.data);

        // Fetch districts, states, countries
        const [districtsRes, statesRes, countriesRes] = await Promise.all([
          axios.get('/api/districts', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/api/states', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/api/countries', { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setDistricts(districtsRes.data);
        setStates(statesRes.data);
        setCountries(countriesRes.data);
      } catch (error) {
        console.error('CustomerProfilePage: Error fetching profile:', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
        });
        toast.error(error.response?.data?.error || 'Failed to load profile');
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
      fetchProfile();
    }
  }, [user, authLoading, router, checkAuth]);

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    console.log('CustomerProfilePage: Updating profile:', profile);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        '/api/customer/profile',
        {
          name: profile.name,
          email: profile.email,
          phone: profile.phone ? BigInt(profile.phone) : null,
          whatsappNumber: profile.whatsappNumber,
          address: profile.address,
          village: profile.village,
          block: profile.block,
          pincode: profile.pincode,
          districtId: profile.districtId ? parseInt(profile.districtId) : null,
          stateId: profile.stateId ? parseInt(profile.stateId) : null,
          countryId: profile.countryId ? parseInt(profile.countryId) : null,
          phone1: profile.phone1 ? BigInt(profile.phone1) : null,
          phone2: profile.phone2 ? BigInt(profile.phone2) : null,
          dataConsent: profile.dataConsent,
        },
        { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
      );
      console.log('CustomerProfilePage: Profile updated:', response.data);
      setProfile(response.data);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('CustomerProfilePage: Error updating profile:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      toast.error(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  if (fetching || authLoading) {
    console.log('CustomerProfilePage: Rendering loading spinner');
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress size={60} sx={{ color: '#0af' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: '1200px', mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ color: '#fff' }}>
        Manage Profile
      </Typography>
      {profile ? (
        <form onSubmit={handleSubmit}>
         <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
  {[
    { label: 'Name', name: 'name' },
    { label: 'Email', name: 'email', type: 'email' },
    { label: 'Phone', name: 'phone', type: 'tel' },
    { label: 'WhatsApp Number', name: 'whatsappNumber', type: 'tel' },
    { label: 'Address', name: 'address' },
    { label: 'Village', name: 'village' },
    { label: 'Block', name: 'block' },
    { label: 'Pincode', name: 'pincode' },
    { label: 'Alternate Phone 1', name: 'phone1', type: 'tel' },
    { label: 'Alternate Phone 2', name: 'phone2', type: 'tel' },
  ].map(({ label, name, type }) => (
    <TextField
      key={name}
      label={label}
      name={name}
      type={type || 'text'}
      value={profile[name] || ''}
      onChange={handleChange}
      required={['name', 'email'].includes(name)}
      fullWidth
      InputLabelProps={{ style: { color: '#ccc' } }}
      InputProps={{
        style: {
          backgroundColor: '#1e1e1e',
          color: '#eee',
        },
      }}
    />
  ))}

  <TextField
    select
    label="District"
    name="districtId"
    value={profile.districtId || ''}
    onChange={handleChange}
    fullWidth
    InputLabelProps={{ style: { color: '#ccc' } }}
    InputProps={{ style: { backgroundColor: '#1e1e1e', color: '#eee' } }}
  >
    <MenuItem value="">None</MenuItem>
    {districts.map((district) => (
      <MenuItem key={district.id} value={district.id}>
        {district.name}
      </MenuItem>
    ))}
  </TextField>

  <TextField
    select
    label="State"
    name="stateId"
    value={profile.stateId || ''}
    onChange={handleChange}
    fullWidth
    InputLabelProps={{ style: { color: '#ccc' } }}
    InputProps={{ style: { backgroundColor: '#1e1e1e', color: '#eee' } }}
  >
    <MenuItem value="">None</MenuItem>
    {states.map((state) => (
      <MenuItem key={state.id} value={state.id}>
        {state.name}
      </MenuItem>
    ))}
  </TextField>

  <TextField
    select
    label="Country"
    name="countryId"
    value={profile.countryId || ''}
    onChange={handleChange}
    fullWidth
    InputLabelProps={{ style: { color: '#ccc' } }}
    InputProps={{ style: { backgroundColor: '#1e1e1e', color: '#eee' } }}
  >
    <MenuItem value="">None</MenuItem>
    {countries.map((country) => (
      <MenuItem key={country.id} value={country.id}>
        {country.name}
      </MenuItem>
    ))}
  </TextField>

  <FormControlLabel
    control={
      <Checkbox
        name="dataConsent"
        checked={profile.dataConsent || false}
        onChange={handleChange}
        sx={{ color: '#ccc' }}
      />
    }
    label="Data Consent"
    sx={{ color: '#ccc' }}
  />

  <Button
    type="submit"
    variant="contained"
    color="primary"
    disabled={updating}
    sx={{ mt: 2 }}
  >
    {updating ? 'Updating...' : 'Update Profile'}
  </Button>

  <Button
    variant="outlined"
    color="primary"
    onClick={() => router.push('/')}
    sx={{ mt: 1 }}
  >
    Back to Home
  </Button>
</Box>

        </form>
      ) : (
        <Typography sx={{ color: '#fff' }}>Profile not found.</Typography>
      )}
    </Box>
  );
};

export default CustomerProfilePage;