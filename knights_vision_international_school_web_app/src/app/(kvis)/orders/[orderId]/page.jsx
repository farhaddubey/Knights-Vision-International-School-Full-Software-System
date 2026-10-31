"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
  CircularProgress,
  IconButton,
} from '@mui/material';
import { Cancel } from '@mui/icons-material';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useCartAndWishlist } from '../../../../lib/useCartAndWishlist';
import Image from 'next/image';
import Link from 'next/link';

const OrderDetailsPage = () => {
  const { user, loading, checkAuth } = useCartAndWishlist();
  const [order, setOrder] = useState(null);
  const [fetching, setFetching] = useState(false);
  const router = useRouter();
  const { orderId } = useParams();

  useEffect(() => {
    const fetchOrder = async () => {
      setFetching(true);
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`/api/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        setOrder(response.data);
      } catch (error) {
        console.error('Error fetching order:', error);
        toast.error('Failed to load order');
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          checkAuth();
          router.push('/login');
        }
      } finally {
        setFetching(false);
      }
    };

    fetchOrder();
  }, [user, orderId, router, checkAuth]);

const handleCancelItem = async (orderItemId) => {
  setFetching(true);
  console.log('OrderDetailsPage: Cancelling item:', orderItemId);
  try {
    const token = localStorage.getItem('token');
    const response = await axios.put(
      '/api/order/cancel-item',
      { orderItemId },
      { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
    );
    console.log('OrderDetailsPage: Item cancelled:', response.data);
    setOrder(response.data);
    toast.success('Order item cancelled');
  } catch (error) {
    console.error('OrderDetailsPage: Error cancelling item:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    toast.error(error.response?.data?.error || 'Failed to cancel order item');
  } finally {
    setFetching(false);
  }
};

  return (
    <Box sx={{ maxWidth: '800px', mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Order #{order?.orderNumber || 'Loading...'}
      </Typography>
      {fetching || loading ? (
        <CircularProgress />
      ) : order ? (
        <Box>
          <Typography variant="h6">Order Details</Typography>
          <Typography>Status: {order.status}</Typography>
          <Typography>Total: ₹{Number(order.totalAmount).toLocaleString()}</Typography>
          <Typography sx={{color:"#fff"}}>Ordered: {new Date(order.orderedAt).toLocaleDateString()}</Typography>
          <Typography variant="h6" sx={{ mt: 2 }}>
          <Typography variant="body2" sx={{color:"#fff"}}>Progress Status: {order?.isFullyCompleted??"Pending"}</Typography>
            Items
          </Typography>
          <List>
            {order.items.map((item) => (
              <ListItem
              
                key={item.id}
                secondaryAction={
                  order.status !== 'CANCELLED' && order.status !== 'COMPLETED' ? (
                    <Button size='small' variant='outlined' color='error'  onClick={() => handleCancelItem(item.id)}
                      disabled={fetching}>Cancel
                      <Cancel sx={{size:"12px"}}/>
                    </Button>
                  ) : null
                }
              >
                <Link href={`/orders/orderItem/${item.id}`}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Image
                    src={item.service?.image || '/sample-service.jpg'}
                    alt={item.service?.name || 'Service'}
                    width={60}
                    height={60}
                    style={{ borderRadius: '4px', marginRight: '16px' }}
                  />
                  <ListItemText
                    primary={item.service?.name || 'Unknown Service'}
                    secondary={
                      <>
                        <Typography sx={{color:"#fff"}} variant="body2">
                          Price: ₹{Number(item.finalPrice).toLocaleString()}
                        </Typography>
                        {item.discount ? (
                          <Typography sx={{color:"#fff"}} variant="body2">
                            Discount: ₹{Number(item.discount).toLocaleString()}
                          </Typography>
                        ) : null}
                      </>
                    }
                  />
                </Box>
                </Link>
              </ListItem>
            ))}
          </List>
          <Button
            variant="contained"
            color="primary"
            onClick={() => router.push('/orders')}
            sx={{ mt: 2 }}
          >
            Back to Orders
          </Button>
        </Box>
      ) : (
        <Typography>Order not found.</Typography>
      )}
    </Box>
  );
};

export default OrderDetailsPage;