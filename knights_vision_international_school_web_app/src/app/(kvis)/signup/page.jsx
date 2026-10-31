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

const SignupPage = () => {
  const router = useRouter();
  const { signup, loading } = useCartAndWishlist();
  const [signupMethod, setSignupMethod] = useState('email');
  const [signupCredentials, setSignupCredentials] = useState({ email: '', phone: '', password: '', name: '' });

  const handleSignup = async () => {
    try {
      await signup(signupMethod === 'email' ? 
        { email: signupCredentials.email, password: signupCredentials.password, name: signupCredentials.name } : 
        { phone: signupCredentials.phone, password: signupCredentials.password, name: signupCredentials.name }
      );
      toast.success('Signed up successfully!');
      router.push('/profile');
    } catch (error) {
      console.error('Signup failed:', error);
      toast.error('Signup failed. Please try again.');
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
            Sign Up
          </Typography>
          <FormControl component="fieldset" sx={{ mb: 2 }}>
            <FormLabel component="legend" sx={{ color: '#fff' }}>Sign up with</FormLabel>
            <RadioGroup
              row
              value={signupMethod}
              onChange={(e) => setSignupMethod(e.target.value)}
            >
              <FormControlLabel value="email" control={<Radio sx={{ color: '#fff' }} />} label="Email" />
              <FormControlLabel value="phone" control={<Radio sx={{ color: '#fff' }} />} label="Phone" />
            </RadioGroup>
          </FormControl>
          <TextField
            fullWidth
            label="Name"
            value={signupCredentials.name}
            onChange={(e) => setSignupCredentials({ ...signupCredentials, name: e.target.value })}
            sx={{ mb: 2, input: { color: '#fff' }, label: { color: '#bbb' } }}
            InputProps={{ style: { backgroundColor: '#2c2c2c', borderRadius: '4px' } }}
          />
          {signupMethod === 'email' ? (
            <TextField
              fullWidth
              label="Email"
              value={signupCredentials.email}
              onChange={(e) => setSignupCredentials({ ...signupCredentials, email: e.target.value })}
              sx={{ mb: 2, input: { color: '#fff' }, label: { color: '#bbb' } }}
              InputProps={{ style: { backgroundColor: '#2c2c2c', borderRadius: '4px' } }}
            />
          ) : (
            <TextField
              fullWidth
              label="Phone"
              value={signupCredentials.phone}
              onChange={(e) => setSignupCredentials({ ...signupCredentials, phone: e.target.value })}
              sx={{ mb: 2, input: { color: '#fff' }, label: { color: '#bbb' } }}
              InputProps={{ style: { backgroundColor: '#2c2c2c', borderRadius: '4px' } }}
            />
          )}
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={signupCredentials.password}
            onChange={(e) => setSignupCredentials({ ...signupCredentials, password: e.target.value })}
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
              onClick={handleSignup}
              disabled={loading || !signupCredentials.name || (!signupCredentials.email && !signupCredentials.phone) || !signupCredentials.password}
            >
              Sign Up
            </Button>
          </Box>
          <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
            Already have an account?{' '}
            <Button color="primary" onClick={() => router.push('/login')}>
              Log In
            </Button>
          </Typography>
        </Paper>
      </Box>
    </>
  );
};

export default SignupPage;