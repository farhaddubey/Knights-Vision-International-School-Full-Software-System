"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Typography,
  Box,
  TextField,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Paper,
} from '@mui/material';
import { useCartAndWishlist } from '../../../lib/useCartAndWishlist';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const LoginPage = () => {
  const router = useRouter();
  const { login, loading } = useCartAndWishlist();
  const [loginMethod, setLoginMethod] = useState('email');
  const [loginCredentials, setLoginCredentials] = useState({ email: '', phone: '', password: '' });

  const handleLogin = async () => {
    try {
      await login(loginMethod === 'email' ? 
        { email: loginCredentials.email, password: loginCredentials.password } : 
        { phone: loginCredentials.phone, password: loginCredentials.password }
      );
      toast.success('Logged in successfully!');
      router.push('/profile');
    } catch (error) {
      console.error('Login failed:', error);
      toast.error('Login failed. Please check your credentials.');
    }
  };

  const handleCancel = () => {
    router.push('/');
  };

  return (
    <>
      <ToastContainer theme="dark" />
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: '#000',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          p: 2,
        }}
      >
        <Paper
          sx={{
            bgcolor: '#1c1c1c',
            color: '#fff',
            borderRadius: '8px',
            p: 4,
            width: '100%',
            maxWidth: '400px',
          }}
        >
          <Typography variant="h5" sx={{ mb: 3, textAlign: 'center' }}>
            Log In
          </Typography>
          <FormControl component="fieldset" sx={{ mb: 2 }}>
            <FormLabel component="legend" sx={{ color: '#fff' }}>Log in with</FormLabel>
            <RadioGroup
              row
              value={loginMethod}
              onChange={(e) => setLoginMethod(e.target.value)}
            >
              <FormControlLabel value="email" control={<Radio sx={{ color: '#fff' }} />} label="Email" />
              <FormControlLabel value="phone" control={<Radio sx={{ color: '#fff' }} />} label="Phone" />
            </RadioGroup>
          </FormControl>
          {loginMethod === 'email' ? (
            <TextField
              fullWidth
              label="Email"
              value={loginCredentials.email}
              onChange={(e) => setLoginCredentials({ ...loginCredentials, email: e.target.value })}
              sx={{ mb: 2, input: { color: '#fff' }, label: { color: '#bbb' } }}
              InputProps={{ style: { backgroundColor: '#2c2c2c', borderRadius: '4px' } }}
            />
          ) : (
            <TextField
              fullWidth
              label="Phone"
              value={loginCredentials.phone}
              onChange={(e) => setLoginCredentials({ ...loginCredentials, phone: e.target.value })}
              sx={{ mb: 2, input: { color: '#fff' }, label: { color: '#bbb' } }}
              InputProps={{ style: { backgroundColor: '#2c2c2c', borderRadius: '4px' } }}
            />
          )}
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={loginCredentials.password}
            onChange={(e) => setLoginCredentials({ ...loginCredentials, password: e.target.value })}
            sx={{ mb: 2, input: { color: '#fff' }, label: { color: '#bbb' } }}
            InputProps={{ style: { backgroundColor: '#2c2c2c', borderRadius: '4px' } }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleLogin}
              disabled={loading || (!loginCredentials.email && !loginCredentials.phone) || !loginCredentials.password}
            >
              Log In
            </Button>
          </Box>
          <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
            Don’t have an account?{' '}
            <Button color="primary" onClick={() => router.push('/signup')}>
              Sign Up
            </Button>
          </Typography>
        </Paper>
      </Box>
    </>
  );
};

export default LoginPage;