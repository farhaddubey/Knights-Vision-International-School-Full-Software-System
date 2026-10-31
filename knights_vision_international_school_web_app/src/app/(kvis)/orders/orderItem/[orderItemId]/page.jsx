 "use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  IconButton,
  Divider,
} from '@mui/material';
import { Cancel } from '@mui/icons-material';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useCartAndWishlist } from '../../../../../lib/useCartAndWishlist';
import Image from 'next/image';

const OrderItemDetailsPage = () => {
  const { user, loading: authLoading, checkAuth } = useCartAndWishlist();
  const [orderItem, setOrderItem] = useState(null);
  const [fetching, setFetching] = useState(false);
  const router = useRouter();
  const { orderItemId } = useParams();

  useEffect(() => {
    // if (!user && !authLoading) {
    //   console.log('OrderItemDetailsPage: No user, redirecting to /login');
    //   router.push('/login');
    //   return;
    // }

    const fetchOrderItem = async () => {
      setFetching(true);
      console.log('OrderItemDetailsPage: Fetching order item:', orderItemId);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No token found');
        }
        const response = await axios.get(`/api/orderItem/${orderItemId}`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        console.log('OrderItemDetailsPage: Order item fetched:', response.data);
        setOrderItem(response.data);
      } catch (error) {
        console.error('OrderItemDetailsPage: Error fetching order item:', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
        });
        toast.error(error.response?.data?.error || 'Failed to load order item');
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          await checkAuth();
          router.push('/login');
        }
      } finally {
        setFetching(false);
      }
    };

    if (user && orderItemId) {
      fetchOrderItem();
    }
  }, [user, authLoading, orderItemId, router, checkAuth]);

const handleCancelItem = async () => {
  setFetching(true);
  console.log('OrderItemDetailsPage: Cancelling item:', orderItemId);
  try {
    const token = localStorage.getItem('token');
    const response = await axios.put(
      '/api/order/cancel-item',
      { orderItemId: parseInt(orderItemId) },
      { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
    );
    console.log('OrderItemDetailsPage: Item cancelled:', response.data);
    setOrderItem({ ...orderItem, status: 'CANCELLED' });
    toast.success('Order item cancelled');
  } catch (error) {
    console.error('OrderItemDetailsPage: Error cancelling item:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    toast.error(error.response?.data?.error || 'Failed to cancel order item');
  } finally {
    setFetching(false);
  }
};
  const getStatusSteps = () => {
    const steps = [
      'PENDING_ASSIGNMENT',
      'ASSIGNED',
      'AGENT_CONFIRMED',
      'IN_PROGRESS',
      'AWAITING_VERIFICATION',
      'VERIFIED_COMPLETED',
    ];
    return steps.map((step, index) => ({
      label: step.replace('_', ' '),
      active: steps.indexOf(orderItem?.status) >= index,
      completed: steps.indexOf(orderItem?.status) >= index,
    }));
  };

  if (fetching || authLoading) {
    console.log('OrderItemDetailsPage: Rendering loading spinner');
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress size={60} sx={{ color: '#0af' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: '1200px', mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Order Item #{orderItem?.id || 'Loading...'}
      </Typography>
      {orderItem ? (
        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
          {/* Left: Order Item Attributes */}
          <Box sx={{ flex: 1, pr: 2 }}>
              <Typography>Order Number: {orderItem.order?.orderNumber}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Image
                src={orderItem.service?.image || '/sample-service.jpg'}
                alt={orderItem.service?.name || 'Service'}
                width={150}
                height={150}
                style={{ borderRadius: '4px', marginRight: '16px' }}
              />
            </Box>
              <Typography variant="h6">{orderItem.service?.name || 'Unknown Service'}</Typography>
            <Typography>Price: ₹{Number(orderItem.price).toLocaleString()}</Typography>
            {orderItem.discount && (
              <Typography>Discount: ₹{Number(orderItem.discount).toLocaleString()}</Typography>
            )}
            <Typography>Final Price: ₹{Number(orderItem.finalPrice).toLocaleString()}</Typography>
            <Typography>Agent: {orderItem.agent?.name || 'Not assigned'}</Typography>
            <Typography>Status: {orderItem.status.replace('_', ' ')}</Typography>
            {orderItem.otpCode && <Typography>OTP: {orderItem.otpCode}</Typography>}
            <Typography>OTP Verified: {orderItem.otpVerified ? 'Yes' : 'No'}</Typography>
            {orderItem.startedAt && (
              <Typography>Started: {new Date(orderItem.startedAt).toLocaleString()}</Typography>
            )}
            {orderItem.completedAt && (
              <Typography>Completed: {new Date(orderItem.completedAt).toLocaleString()}</Typography>
            )}
            {orderItem.verifiedAt && (
              <Typography>Verified: {new Date(orderItem.verifiedAt).toLocaleString()}</Typography>
            )}
            {orderItem.notes && <Typography>Notes: {orderItem.notes}</Typography>}
            {orderItem.order?.status !== 'PENDING_ASSIGNMENT' &&(
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleCancelItem}
                  disabled={fetching}
                  sx={{ mt: 2 }}
                  startIcon={<Cancel />}
                >
                  Cancel Service Item
                </Button>
              )}
          </Box>

          {/* Middle: Vertical Bar */}
          <Divider orientation="vertical" flexItem sx={{ bgcolor: '#0af', width: '4px' }} />

          {/* Right: Vertical Progress Timeline */}
          <Box sx={{ flex: 1, pl: 2, display: 'flex', flexDirection: 'column-reverse', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Progress Status
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column-reverse', alignItems: 'center', gap: 2 }}>
              {getStatusSteps().map((step, index) => (
                <Box
                  key={step.label}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    position: 'relative',
                    mb: index < getStatusSteps().length - 1 ? 4 : 0,
                  }}
                >
                  <Typography
                    sx={{
                      color: step.active ? '#0af' : '#888',
                      fontWeight: step.active ? 'bold' : 'normal',
                      mb: 1,
                    }}
                  >
                    {step.label}
                  </Typography>
                  <Box
                    sx={{
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      bgcolor: step.active ? '#0af' : '#888',
                      border: '2px solid #fff',
                      boxShadow: '0 0 4px rgba(0,0,0,0.2)',
                    }}
                  />
                  {index < getStatusSteps().length - 1 && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 24,
                        height: 32,
                        width: 4,
                        bgcolor: step.active && getStatusSteps()[index + 1].active ? '#0af' : '#888',
                      }}
                    />
                  )}
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      ) : (
        <Typography>Order item not found.</Typography>
      )}
      <Button
        variant="contained"
        color="primary"
        onClick={() => router.push('/orders')}
        sx={{ mt: 2 }}
      >
        Back to Orders
      </Button>
    </Box>
  );
};

export default OrderItemDetailsPage;