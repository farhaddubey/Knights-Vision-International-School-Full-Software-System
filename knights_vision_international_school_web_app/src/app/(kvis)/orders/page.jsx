"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
  CircularProgress,
} from '@mui/material';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useCartAndWishlist } from '../../../lib/useCartAndWishlist';

const OrdersPage = () => {
  const { user, loading: authLoading, checkAuth } = useCartAndWishlist();
  const [orders, setOrders] = useState([]);
  const [fetching, setFetching] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const verifyAuth = async () => {
      console.log('OrdersPage: Initial state - user:', !!user, 'authLoading:', authLoading, 'token:', !!localStorage.getItem('token'));
      await checkAuth();
      setAuthChecked(true);
      console.log('OrdersPage: After checkAuth - user:', !!user, 'authLoading:', authLoading);
    };
    verifyAuth();
  }, [checkAuth]);

  useEffect(() => {
    const fetchOrders = async () => {
      setFetching(true);
      const startTime = Date.now();
      console.log('OrdersPage: Starting fetchOrders');
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/orders', {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        console.log('OrdersPage: Orders fetched:', {
          orderCount: response.data.length,
          duration: Date.now() - startTime,
        });
        setOrders(response.data);
      } catch (error) {
        console.error('OrdersPage: Error fetching orders:', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
          duration: Date.now() - startTime,
        });
        toast.error(error.response?.data?.error || 'Failed to load orders');
        if (error.response?.status === 401) {
          console.log('OrdersPage: Unauthorized, clearing token and redirecting');
          localStorage.removeItem('token');
          await checkAuth();
          router.push('/login');
        }
      } finally {
        setFetching(false);
        console.log('OrdersPage: Fetching complete - duration:', Date.now() - startTime);
      }
    };

    fetchOrders();
  }, [user, authChecked, authLoading, router, checkAuth]);

  const handleViewOrder = (orderId) => {
    console.log('OrdersPage: Viewing order:', orderId);
    router.push(`/orders/${orderId}`);
  };


  return (
    <Box sx={{ maxWidth: '800px', mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Your Orders
      </Typography>
      {fetching ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={60} sx={{ color: '#0af' }} />
        </Box>
      ) : orders.length ? (
        <List>
          {orders.map((order) => (
            <React.Fragment key={order.orderId}>
              <ListItem
                secondaryAction={
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleViewOrder(order.orderId)}
                  >
                    View Details
                  </Button>
                }
              >
                <ListItemText
                  primary={`Order #${order.orderNumber}`}
                  secondary={
                    <>
                      <Typography sx={{color:"#fff"}} variant="body2">Status: {order.status}</Typography>
                      <Typography sx={{color:"#fff"}} variant="body2">
                        Total: ₹{Number(order.totalAmount).toLocaleString()}
                      </Typography>
                      <Typography variant="body2" sx={{color:"#fff"}}>Items: {order.items.length}</Typography>
                      <Typography variant="body2" sx={{color:"#fff"}}>Progress Status: {order?.isFullyCompleted??"Pending"}</Typography>
                      <Typography sx={{color:"#fff"}}>Ordered: {new Date(order.orderedAt).toLocaleDateString()}</Typography>
                    </>
                  }
                />
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </List>
      ) : (
        <Typography>No orders found.</Typography>
      )}
    </Box>
  );
};

export default OrdersPage;