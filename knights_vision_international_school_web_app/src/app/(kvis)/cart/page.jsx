"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Typography,
  Box,
  Button,
  Paper,
  IconButton,
  Divider,
} from '@mui/material';
import { Delete, ShoppingCart, Clear } from '@mui/icons-material';
import Image from 'next/image';
import { useCartAndWishlist } from '../../../lib/useCartAndWishlist';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CartPage = () => {
  const router = useRouter();
  const { cart, removeFromCart, clearCart, loading } = useCartAndWishlist();

  const handleCheckout = () => {
    router.push('/order-services-now');
  };

  const handleBrowseServices = () => {
    router.push('/book-services');
  };

  return (
    <>
      <ToastContainer theme="dark" />
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: '#000',
          color: '#fff',
          p: { xs: 2, sm: 3, md: 4 },
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Paper
          sx={{
            bgcolor: '#1c1c1c',
            color: '#fff',
            borderRadius: '8px',
            p: { xs: 2, sm: 3 },
            width: { xs: '100%', sm: '90%', md: '600px' },
            maxWidth: '600px',
          }}
        >
          <Typography 
            variant="h5" 
            sx={{ 
              textAlign: 'center', 
              mb: 2, 
              fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' } 
            }}
          >
            Your Cart ({cart?.items.length || 0} items)
          </Typography>
          <Divider sx={{ borderColor: '#333', mb: 2 }} />
          <Box
            sx={{
              maxHeight: { xs: '50vh', md: '60vh' },
              overflowY: 'auto',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              '&::-webkit-scrollbar': { display: 'none' },
            }}
          >
            {cart?.items.length ? (
              cart.items.map((item) => (
                <Box
                  key={item.id || item.serviceId}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: { xs: 1, sm: 2 },
                    borderRadius: '8px',
                    mb: 1,
                    '&:hover': { bgcolor: '#111', color: '#0af' },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                    <Image
                      src={item.service?.image || '/sample-service.jpg'}
                      alt={item.service?.name || 'Service'}
                      width={60}
                      height={60}
                      style={{ 
                        borderRadius: '4px', 
                        marginRight: { xs: 8, sm: 12 },
                        flexShrink: 0 
                      }}
                    />
                    <Box>
                      <Typography 
                        variant="body1" 
                        sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
                      >
                        {item.service?.name || 'Unknown Service'}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        color="primary"
                        sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                      >
                        ₹{item.service?.price?.toLocaleString() || 'N/A'}
                      </Typography>
                    </Box>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={() => {
                      removeFromCart(item.id || item.serviceId);
                      toast.success('Item removed from cart');
                    }}
                    disabled={loading}
                    sx={{ color: '#fff' }}
                  >
                    <Delete />
                  </IconButton>
                </Box>
              ))
            ) : (
              <Typography 
                variant="body1" 
                sx={{ 
                  textAlign: 'center', 
                  p: 2, 
                  color: '#ccc',
                  fontSize: { xs: '0.9rem', sm: '1rem' }
                }}
              >
                Your cart is empty
              </Typography>
            )}
          </Box>
          <Divider sx={{ borderColor: '#333', my: 2 }} />
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' }, 
              justifyContent: 'space-between', 
              gap: 2 
            }}
          >
            <Button
              variant="outlined"
              color="error"
              startIcon={<Clear />}
              onClick={() => {
                clearCart();
                toast.success('Cart cleared');
              }}
              disabled={loading || !cart?.items.length}
              sx={{ 
                width: { xs: '100%', sm: 'auto' },
                fontSize: { xs: '0.8rem', sm: '0.875rem' }
              }}
            >
              Clear Cart
            </Button>
            <Box 
              sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' }, 
                gap: 2,
                width: { xs: '100%', sm: 'auto' }
              }}
            >
              <Button
                variant="contained"
                color="primary"
                onClick={handleBrowseServices}
                disabled={loading}
                sx={{ 
                  width: { xs: '100%', sm: 'auto' },
                  fontSize: { xs: '0.8rem', sm: '0.875rem' }
                }}
              >
                Browse Services
              </Button>
              <Button
                variant="contained"
                color="success"
                startIcon={<ShoppingCart />}
                onClick={handleCheckout}
                disabled={loading || !cart?.items.length}
                sx={{ 
                  width: { xs: '100%', sm: 'auto' },
                  fontSize: { xs: '0.8rem', sm: '0.875rem' }
                }}
              >
                Proceed to Checkout
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </>
  );
};

export default CartPage;