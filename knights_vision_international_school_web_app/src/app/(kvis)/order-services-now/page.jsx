"use client";

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Divider,
  Grid,
  Card,
  CardContent,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  CircularProgress,
} from '@mui/material';
import Image from 'next/image';
import { useCartAndWishlist } from '../../../lib/useCartAndWishlist';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Bounce } from 'react-toastify';

const OrderServicesPage = () => {
  const { cart, loading: cartLoading, clearCart } = useCartAndWishlist();
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  // Debug cart state
  useEffect(() => {
    console.log('Cart state:', {
      cartId: cart?.cartId,
      items: cart?.items?.length,
      itemDetails: cart?.items?.map((item) => ({
        serviceId: item.serviceId,
        serviceName: item.service?.name,
        price: item.service?.price,
      })),
    });
  }, [cart]);

  const calculateTotal = () => {
    if (!cart?.items || !Array.isArray(cart.items)) {
      return 0;
    }
    return cart.items.reduce((total, item) => {
      const price = item.service?.price || 0;
      return total + (typeof price === 'number' ? price : 0);
    }, 0);
  };

  const handlePayment = async () => {
    toast.warn("Payment System is yet not integrated..."); 
    toast.info("Please contact the district tdilcs law-customer care...");
    toast.success("Call: 9832238113"); 
    setIsProcessing(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in to proceed with payment');
        router.push('/login');
        return;
      }

      if (!cart?.cartId || isNaN(parseInt(cart.cartId))) {
        toast.error('Invalid cart ID');
        console.error('Invalid cartId:', cart?.cartId);
        return;
      }

      if (!cart?.items?.length) {
        toast.error('Cart is empty');
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };
      console.log('Sending order request with cartId:', cart.cartId);
      const response = await axios.post(
        '/api/order/place',
        { cartId: parseInt(cart.cartId) },
        { headers, withCredentials: true }
      );

      if (response.status !== 201) {
        throw new Error('Order creation failed');
      }

      toast.success('Order placed successfully!');
      await clearCart();
      router.push('/orders');
    } catch (error) {
      console.error('Error placing order:', {
        message: error.message,
        response: error.response?.data,
        cartId: cart?.cartId,
      });
      const errorMessage = error.response?.data?.error || 'Failed to place order';
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!cart?.items?.length) {
    return (
      <Box sx={{ 
        bgcolor: '#121212', 
        minHeight: '100vh', 
        color: '#fff', 
        p: { xs: 2, sm: 3, md: 4 }, 
        textAlign: 'center' 
      }}>
        <Typography variant="h6">Your cart is empty</Typography>
        <Button variant="contained" color="primary" onClick={() => router.push('/book-services')}>
          Browse Services
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      bgcolor: '#121212', 
      minHeight: '100vh', 
      color: '#fff', 
      p: { xs: 1, sm: 2, md: 3 }, 
      display: 'flex', 
      flexDirection: 'column',
      position: 'relative' 
    }}>
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
        transition={Bounce}
      />
      {isProcessing && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            bgcolor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <CircularProgress size={60} thickness={4} sx={{ color: '#0af' }} />
        </Box>
      )}
      <Grid container spacing={2} sx={{ flexDirection: { xs: 'column', md: 'row' } }}>
        <Grid item xs={12} md={5}>
          <Box
            sx={{
              bgcolor: '#1c1c1c',
              p: { xs: 2, sm: 3 },
              borderRadius: 2,
              color: 'white',
              width: { xs: '100%', md: '34vw' },
              mb: { xs: 2, md: 0 },
              height: { xs: 'auto', md: '80vh' },
              overflow: 'auto',
            }}
          >
            <Typography variant="h5" gutterBottom color="white">
              Payment Details
            </Typography>
            <Divider sx={{ borderColor: '#333', my: 2 }} />
            <Typography variant="h6" sx={{ mb: 2 }} color="primary">
              Total Amount: ₹{calculateTotal().toLocaleString()}
            </Typography>
            <FormControl component="fieldset">
              <FormLabel component="legend" sx={{ color: '#fff', mb: 2 }}>
                Select Payment Method
              </FormLabel>
              <RadioGroup value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                {[
                  ['razorpay', 'Razorpay'],
                  ['credit-debit-card', 'Credit/Debit'],
                  ['gpay', 'GPay'],
                  ['phonepe', 'PhonePe'],
                  ['upi', 'UPI'],
                  ['indian-railway', 'Indian Railway Gateway'],
                ].map(([value, label]) => (
                  <FormControlLabel
                    key={value}
                    value={value}
                    control={<Radio sx={{ color: '#fff' }} />}
                    label={label}
                    sx={{ mb: 1 }}
                  />
                ))}
              </RadioGroup>
            </FormControl>
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handlePayment}
                disabled={cartLoading || isProcessing}
                sx={{ px: 4, width: '100%' }}
              >
                Proceed to Payment
              </Button>
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12} md={7}>
          <Box
            sx={{
              bgcolor: '#1c1c1c',
              borderRadius: 2,
              p: { xs: 2, sm: 3 },
              color: 'white',
              width: { xs: '100%', md: '60vw' },
              height: { xs: 'auto', md: '80vh' },
              overflow: 'hidden',
            }}
          >
            <Typography variant="h5" gutterBottom color="white">
              Order Items
            </Typography>
            <Divider sx={{ borderColor: '#333', my: 2 }} />
            <Box
              sx={{
                maxHeight: { xs: 'auto', md: 'calc(100vh - 120px)' },
                overflowY: 'auto',
                pr: 1,
                '&::-webkit-scrollbar': {
                  width: 6,
                },
                '&::-webkit-scrollbar-track': {
                  background: '#333',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: '#555',
                  borderRadius: 3,
                },
              }}
            >
              <Box sx={{ maxHeight: { xs: 'auto', md: '65vh' }, overflowY: 'auto', pr: 1 }}>
                <Grid container direction="column" spacing={2} paddingBottom={5}>
                  {cart.items.map((item) => (
                    <Grid item key={item.id}>
                      <Card sx={{ bgcolor: '#2c2c2c', color: '#fff', borderRadius: 2 }}>
                        <CardContent
                          sx={{
                            display: 'flex',
                            alignItems: { xs: 'center', md: 'center' },
                            justifyContent: { xs: 'flex-start', md: 'space-between' },
                            flexDirection: { xs: 'row', md: 'row' },
                            p: { xs: 1, sm: 2 },
                          }}
                        >
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            flexDirection: { xs: 'row', md: 'row' },
                            width: '100%',
                          }}>
                            <Image
                              src={item.service?.image || '/sample-service.jpg'}
                              alt={item.service?.name || 'Service'}
                              width={80}
                              height={80}
                              style={{ 
                                borderRadius: 8, 
                                marginRight: { xs: 8, md: 16 },
                                flexShrink: 0,
                              }}
                            />
                            <Box sx={{ 
                              display: 'flex', 
                              flexDirection: { xs: 'column', md: 'column' },
                              flexGrow: 1,
                            }}>
                              <Typography 
                                variant="h6" 
                                sx={{ 
                                  fontSize: { xs: '1rem', sm: '1.25rem' },
                                  textAlign: { xs: 'left', md: 'left' },
                                }}
                              >
                                {item.service?.name || 'Unknown Service'}
                              </Typography>
                              <Typography 
                                variant="body2" 
                                color="primary"
                                sx={{ 
                                  textAlign: { xs: 'left', md: 'left' },
                                  mt: { xs: 0.5, md: 0 },
                                }}
                              >
                                ₹{item.service?.price?.toLocaleString() || 'N/A'}
                              </Typography>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default OrderServicesPage;