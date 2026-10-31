"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  IconButton,
  Typography,
  Menu,
  MenuItem,
  useTheme,
  Divider,
  Box,
  Badge,
  Button,
} from '@mui/material';
import { Delete, ShoppingCart, Clear, Favorite } from '@mui/icons-material';
import Image from 'next/image';
import { useCartAndWishlist } from '../../../../lib/useCartAndWishlist';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const WishlistPage = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const isMenuOpen = Boolean(anchorEl);
  const theme = useTheme();
  const { wishlist, removeFromWishlist, moveToCart, clearWishlist, loading } = useCartAndWishlist();
  const router = useRouter();

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMoveToCart = (item) => {
    moveToCart(item.id, item.service);
    handleMenuClose();
  };

  const handleBrowseServices = () => {
    handleMenuClose();
    router.push('/book-services');
  };

  const menuId = 'wishlist-menu';
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
      id={menuId}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
      open={isMenuOpen}
      onClose={handleMenuClose}
      PaperProps={{
        style: {
          height: '90vh',
          overflow: 'hidden',
          borderRadius: '10px',
          backgroundColor: '#000',
          color: '#fff',
        },
      }}
    >
      <Box sx={{ width: '30vw', maxWidth: '100%', bgcolor: '#000' }}>
        <Typography variant="h6" sx={{ p: 2, textAlign: 'center' }}>
          Your Wishlist ({wishlist?.items.length || 0} items)
        </Typography>
        <Divider sx={{ borderColor: '#333' }} />
        <Box
          sx={{
            maxHeight: 'calc(90vh - 150px)',
            overflowY: 'auto',
            bgcolor: '#000',
            color: '#fff',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            '&::-webkit-scrollbar': {
              display: 'none',
            },
            '& .MuiTypography-root': {
              color: '#ccc',
              fontSize: '0.9rem',
            },
            '& .MuiMenuItem-root': {
              borderRadius: '8px',
              alignItems: 'center',
              '&:hover': {
                backgroundColor: '#111',
                color: '#0af',
              },
            },
          }}
        >
          {wishlist?.items.length ? (
            wishlist.items.map((item) => (
              <MenuItem key={item.id} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Image
                    src={item.service?.image || '/sample-service.jpg'}
                    alt={item.service?.name || 'Service'}
                    width={40}
                    height={40}
                    style={{ borderRadius: '4px', marginRight: '8px' }}
                  />
                  <Box>
                    <Typography variant="body2">{item.service?.name || 'Unknown Service'}</Typography>
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
                    
                  </Button>
                  <IconButton
                    size="small"
                    onClick={() => removeFromWishlist(item.id)}
                    disabled={loading}
                    sx={{ color: '#fff' }}
                  >
                    <Delete />
                  </IconButton>
                </Box>
              </MenuItem>
            ))
          ) : (
            <MenuItem disabled>
              <Typography variant="body2" sx={{ textAlign: 'center', width: '100%' }}>
                Your wishlist is empty
              </Typography>
            </MenuItem>
          )}
        </Box>
        <Divider sx={{ borderColor: '#333' }} />
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            color="error"
            startIcon={<Clear />}
            onClick={clearWishlist}
            disabled={loading || !wishlist?.items.length}
            size='small'
          >
            Clear Wishlist
          </Button>
                 <Button
            variant="outlined"
            color="success"
            startIcon={<Favorite/>}
            onClick={()=>router.push("/wishlist")}
          >
            View Wishlist
          </Button>
        </Box>
      </Box>
    </Menu>
  );

  return (
    <>
      <ToastContainer theme="dark" />
      <IconButton
        size="large"
        edge="end"
        aria-label="wishlist"
        aria-controls={menuId}
        aria-haspopup="true"
        onClick={handleMenuOpen}
        color="inherit"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          cursor: 'pointer',
          '&:hover': {
            color: theme.palette.primary.main,
          },
        }}
      >
        <Badge badgeContent={wishlist?.items.length || 0} color="primary">
          <Favorite sx={{ color: '#ff6f61' }} />
        </Badge>
        <Typography variant="caption" sx={{ display: { xs: 'none', sm: 'none', md: 'none', lg: 'none', xl: 'flex' } }}>
          Wishlist
        </Typography>
      </IconButton>
      {renderMenu}
    </>
  );
};

export default WishlistPage;