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
import { Delete, ShoppingCart, Clear, Favorite } from '@mui/icons-material';
import Image from 'next/image';
import { useCartAndWishlist } from '../../../lib/useCartAndWishlist';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const WishlistPage = () => {
  const router = useRouter();
  const { wishlist, removeFromWishlist, moveToCart, clearWishlist, loading } = useCartAndWishlist();

  const handleMoveToCart = (item) => {
    moveToCart(item.id, item.service);
    toast.success('Moved to cart');
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
          p: 4,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <Paper
          sx={{
            bgcolor: '#1c1c1c',
            color: '#fff',
            borderRadius: '8px',
            p: 3,
            width: '100%',
            maxWidth: '600px',
          }}
        >
          <Typography variant="h5" sx={{ textAlign: 'center', mb: 2 }}>
            Your Wishlist ({wishlist?.items.length || 0} items)
          </Typography>
          <Divider sx={{ borderColor: '#333', mb: 2 }} />
          <Box
            sx={{
              maxHeight: '60vh',
              overflowY: 'auto',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              '&::-webkit-scrollbar': { display: 'none' },
            }}
          >
            {wishlist?.items.length ? (
              wishlist.items.map((item) => (
                <Box
                  key={item.id}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 2,
                    borderRadius: '8px',
                    mb: 1,
                    '&:hover': { bgcolor: '#111', color: '#0af' },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Image
                      src={item.service?.image || '/sample-service.jpg'}
                      alt={item.service?.name || 'Service'}
                      width={60}
                      height={60}
                      style={{ borderRadius: '4px', marginRight: '12px' }}
                    />
                    <Box>
                      <Typography variant="body1">{item.service?.name || 'Unknown Service'}</Typography>
                      <Typography variant="caption" color="primary">
                        ₹{item.service?.price?.toLocaleString() || 'N/A'}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      startIcon={<ShoppingCart />}
                      onClick={() => handleMoveToCart(item)}
                      disabled={loading}
                    >
                      Add to Cart
                    </Button>
                    <IconButton
                      size="small"
                      onClick={() => {
                        removeFromWishlist(item.id);
                        toast.success('Removed from wishlist');
                      }}
                      disabled={loading}
                      sx={{ color: '#fff' }}
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                </Box>
              ))
            ) : (
              <Typography variant="body1" sx={{ textAlign: 'center', p: 2, color: '#ccc' }}>
                Your wishlist is empty
              </Typography>
            )}
          </Box>
          <Divider sx={{ borderColor: '#333', my: 2 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
            <Button
              variant="outlined"
              color="error"
              startIcon={<Clear />}
              onClick={() => {
                clearWishlist();
                toast.success('Wishlist cleared');
              }}
              disabled={loading || !wishlist?.items.length}
            >
              Clear Wishlist
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Favorite />}
              onClick={handleBrowseServices}
              disabled={loading}
            >
              Browse Services
            </Button>
          </Box>
        </Paper>
      </Box>
    </>
  );
};

export default WishlistPage;