"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

export const useCartAndWishlist = () => {
  const [cart, setCart] = useState(null);
  const [wishlist, setWishlist] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Local storage keys
  const CART_STORAGE_KEY = 'local_cart';
  const WISHLIST_STORAGE_KEY = 'local_wishlist';

  // Helper to get local storage data
  const getLocalCart = () => {
    const localCart = localStorage.getItem(CART_STORAGE_KEY);
    return localCart ? JSON.parse(localCart) : { items: [] };
  };

  const getLocalWishlist = () => {
    const localWishlist = localStorage.getItem(WISHLIST_STORAGE_KEY);
    return localWishlist ? JSON.parse(localWishlist) : { items: [] };
  };

  // Helper to save to local storage
  const saveLocalCart = (items) => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({ items }));
  };

  const saveLocalWishlist = (items) => {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify({ items }));
  };

  const fetchCart = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const headers = { Authorization: `Bearer ${token}` };
        const response = await axios.get('/api/cart', { headers, withCredentials: true });
        setCart(response.data);
      } else {
        setCart(getLocalCart());
      }
    } catch (error) {
      console.error('Error fetching cart:', error.message);
      toast.error('Failed to load cart', { position: 'bottom-center' });
      setCart(getLocalCart());
    } finally {
      setLoading(false);
    }
  };

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const headers = { Authorization: `Bearer ${token}` };
        const response = await axios.get('/api/wishlist', { headers, withCredentials: true });
        setWishlist(response.data);
      } else {
        setWishlist(getLocalWishlist());
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error.message);
      toast.error('Failed to load wishlist', { position: 'bottom-center' });
      setWishlist(getLocalWishlist());
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (serviceId, service) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const headers = { Authorization: `Bearer ${token}` };
        const response = await axios.post(
          '/api/cart/add',
          { serviceId },
          { headers, withCredentials: true }
        );
        setCart(response.data);
        await fetchCart(); // Refetch cart
        toast.success(`${service.name} added to cart!`, { position: 'bottom-center' });
      } else {
        const localCart = getLocalCart();
        if (!localCart.items.some((item) => item.serviceId === serviceId)) {
          localCart.items.push({ serviceId, service });
          saveLocalCart(localCart.items);
          setCart(localCart);
          toast.success(`${service.name} added to cart!`, { position: 'bottom-center' });
        } else {
          toast.info(`${service.name} is already in cart`, { position: 'bottom-center' });
        }
      }
    } catch (error) {
      console.error('Error adding to cart:', error.message);
      toast.error(error.response?.data?.error || 'Failed to add to cart', { position: 'bottom-center' });
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (cartItemId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const headers = { Authorization: `Bearer ${token}` };
        await axios.delete('/api/cart/remove', {
          headers,
          withCredentials: true,
          data: { cartItemId },
        });
        await fetchCart(); // Refetch cart
        toast.success('Item removed from cart', { position: 'bottom-center' });
      } else {
        const localCart = getLocalCart();
        const updatedItems = localCart.items.filter((item) => item.serviceId !== cartItemId);
        saveLocalCart(updatedItems);
        setCart({ items: updatedItems });
        toast.success('Item removed from cart', { position: 'bottom-center' });
      }
    } catch (error) {
      console.error('Error removing from cart:', error.message);
      toast.error('Failed to remove item', { position: 'bottom-center' });
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const headers = { Authorization: `Bearer ${token}` };
        await axios.delete('/api/cart/clear', { headers, withCredentials: true });
        await fetchCart(); // Refetch cart
        toast.success('Cart cleared', { position: 'bottom-center' });
      } else {
        saveLocalCart([]);
        setCart({ items: [] });
        toast.success('Cart cleared', { position: 'bottom-center' });
      }
    } catch (error) {
      console.error('Error clearing cart:', error.message);
      toast.error('Failed to clear cart', { position: 'bottom-center' });
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (serviceId, service) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const headers = { Authorization: `Bearer ${token}` };
        const response = await axios.post(
          '/api/wishlist/add',
          { serviceId },
          { headers, withCredentials: true }
        );
        setWishlist(response.data);
        await fetchWishlist(); // Refetch wishlist
        toast.success(`${service.name} added to wishlist!`, { position: 'bottom-center' });
      } else {
        const localWishlist = getLocalWishlist();
        if (!localWishlist.items.some((item) => item.serviceId === serviceId)) {
          localWishlist.items.push({ serviceId, service });
          saveLocalWishlist(localWishlist.items);
          setWishlist(localWishlist);
          toast.success(`${service.name} added to wishlist!`, { position: 'bottom-center' });
        } else {
          toast.info(`${service.name} is already in wishlist`, { position: 'bottom-center' });
        }
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error.message);
      toast.error(error.response?.data?.error || 'Failed to add to wishlist', { position: 'bottom-center' });
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (wishlistItemId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const headers = { Authorization: `Bearer ${token}` };
        await axios.delete('/api/wishlist/remove', {
          headers,
          withCredentials: true,
          data: { wishlistItemId },
        });
        await fetchWishlist(); // Refetch wishlist
        toast.success('Item removed from wishlist', { position: 'bottom-center' });
      } else {
        const localWishlist = getLocalWishlist();
        const updatedItems = localWishlist.items.filter((item) => item.serviceId !== wishlistItemId);
        saveLocalWishlist(updatedItems);
        setWishlist({ items: updatedItems });
        toast.success('Item removed from wishlist', { position: 'bottom-center' });
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error.message);
      toast.error('Failed to remove item', { position: 'bottom-center' });
    } finally {
      setLoading(false);
    }
  };

  const moveToCart = async (wishlistItemId, service) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const headers = { Authorization: `Bearer ${token}` };
        const response = await axios.post(
          '/api/wishlist/move-to-cart',
          { wishlistItemId },
          { headers, withCredentials: true }
        );
        setCart(response.data.cart); // Update cart state
        setWishlist(response.data.wishlist); // Update wishlist state
        toast.success(`${service.name} moved to cart!`, { position: 'bottom-center' });
      } else {
        const localWishlist = getLocalWishlist();
        const localCart = getLocalCart();
        const item = localWishlist.items.find((item) => item.serviceId === wishlistItemId);
        if (item && !localCart.items.some((cartItem) => cartItem.serviceId === item.serviceId)) {
          localCart.items.push(item);
          saveLocalCart(localCart.items);
          const updatedWishlistItems = localWishlist.items.filter((item) => item.serviceId !== wishlistItemId);
          saveLocalWishlist(updatedWishlistItems);
          setCart(localCart);
          setWishlist({ items: updatedWishlistItems });
          toast.success(`${service.name} moved to cart!`, { position: 'bottom-center' });
        } else {
          toast.info(`${service.name} is already in cart`, { position: 'bottom-center' });
        }
      }
    } catch (error) {
      console.error('Error moving to cart:', error.message);
      toast.error(error.response?.data?.error || 'Failed to move to cart', { position: 'bottom-center' });
    } finally {
      setLoading(false);
    }
  };

  const clearWishlist = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const headers = { Authorization: `Bearer ${token}` };
        await axios.delete('/api/wishlist/clear', { headers, withCredentials: true });
        await fetchWishlist(); // Refetch wishlist
        toast.success('Wishlist cleared', { position: 'bottom-center' });
      } else {
        saveLocalWishlist([]);
        setWishlist({ items: [] });
        toast.success('Wishlist cleared', { position: 'bottom-center' });
      }
    } catch (error) {
      console.error('Error clearing wishlist:', error.message);
      toast.error('Failed to clear wishlist', { position: 'bottom-center' });
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    setLoading(true);
    try {
      const response = await axios.post('/api/customer/auth/login', credentials, { withCredentials: true });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      setUser(user);

      // Merge local storage cart/wishlist to server
      const localCart = getLocalCart();
      const localWishlist = getLocalWishlist();
      if (localCart.items.length || localWishlist.items.length) {
        const headers = { Authorization: `Bearer ${token}` };
        try {
          for (const item of localCart.items) {
            await axios.post('/api/cart/add', { serviceId: item.serviceId }, { headers, withCredentials: true });
            await fetchCart(); // Refetch after each add
          }
          for (const item of localWishlist.items) {
            await axios.post('/api/wishlist/add', { serviceId: item.serviceId }, { headers, withCredentials: true });
          }
          localStorage.removeItem(CART_STORAGE_KEY);
          localStorage.removeItem(WISHLIST_STORAGE_KEY);
        } catch (mergeError) {
          console.error('Error merging cart/wishlist:', mergeError.message);
          toast.error('Failed to merge cart/wishlist', { position: 'bottom-center' });
          // Preserve local storage if merge fails
          setCart(localCart);
          setWishlist(localWishlist);
          throw mergeError;
        }
      }

      toast.success('Logged in successfully', { position: 'bottom-center' });
      await fetchCart();
      await fetchWishlist();
    } catch (error) {
      console.error('Error logging in:', error.message);
      toast.error(error.response?.data?.error || 'Failed to log in', { position: 'bottom-center' });
    } finally {
      setLoading(false);
    }
  };

  const signup = async (credentials) => {
    setLoading(true);
    try {
      const response = await axios.post('/api/customer/auth/signup', credentials, { withCredentials: true });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      setUser(user);

      // Merge local storage cart/wishlist to server
      const localCart = getLocalCart();
      const localWishlist = getLocalWishlist();
      if (localCart.items.length || localWishlist.items.length) {
        const headers = { Authorization: `Bearer ${token}` };
        try {
          for (const item of localCart.items) {
            await axios.post('/api/cart/add', { serviceId: item.serviceId }, { headers, withCredentials: true });
            await fetchCart(); // Refetch after each add
          }
          for (const item of localWishlist.items) {
            await axios.post('/api/wishlist/add', { serviceId: item.serviceId }, { headers, withCredentials: true });
          }
          localStorage.removeItem(CART_STORAGE_KEY);
          localStorage.removeItem(WISHLIST_STORAGE_KEY);
        } catch (mergeError) {
          console.error('Error merging cart/wishlist:', mergeError.message);
          toast.error('Failed to merge cart/wishlist', { position: 'bottom-center' });
          // Preserve local storage if merge fails
          setCart(localCart);
          setWishlist(localWishlist);
          throw mergeError;
        }
      }

      toast.success('Account created successfully', { position: 'bottom-center' });
      await fetchCart();
      await fetchWishlist();
    } catch (error) {
      console.error('Error signing up:', error.message);
      toast.error(error.response?.data?.error || 'Failed to sign up', { position: 'bottom-center' });
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await axios.post('/api/customer/auth/logout', {}, { withCredentials: true });
    } catch (error) {
      console.error('Error logging out:', error.message);
    }
    localStorage.removeItem('token');
    setUser(null);
    setCart(null);
    setWishlist(null);
    toast.success('Logged out successfully', { position: 'bottom-center' });
    document.cookie = 'auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  };

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await axios.get('/api/customer/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        setUser(response.data);
        await fetchCart();
        await fetchWishlist();
      } catch (error) {
        console.error('Error checking auth:', error.message);
        localStorage.removeItem('token');
        setUser(null);
        setCart(getLocalCart());
        setWishlist(getLocalWishlist());
      }
    } else {
      setUser(null);
      setCart(getLocalCart());
      setWishlist(getLocalWishlist());
    }
  };

  const placeOrder = async () => {
    if (!user) {
      toast.error('Please log in to place an order', { position: 'bottom-center' });
      router.push('/login');
      return;
    }

    if (!cart?.items?.length) {
      toast.error('Cart is empty', { position: 'bottom-center' });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.post(
        '/api/order/place',
        { cartId: cart.cartId },
        { headers, withCredentials: true }
      );

      toast.success('Order placed successfully!', { position: 'bottom-center' });
      await clearCart(); // Clear the cart after order placement
      router.push('/orders'); // Redirect to orders page
    } catch (error) {
      console.error('Error placing order:', error.message);
      toast.error(error.response?.data?.error || 'Failed to place order', { position: 'bottom-center' });
    } finally {
      setLoading(false);
    }
  };

  // Listen for storage events to sync authentication state across tabs
  useEffect(() => {
    checkAuth();

    const handleStorageChange = (event) => {
      if (event.key === 'token') {
        if (!event.newValue) {
          // Token was removed (logout)
          setUser(null);
          setCart(getLocalCart());
          setWishlist(getLocalWishlist());
        } else {
          // Token was added (login)
          checkAuth();
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return {
    cart,
    wishlist,
    user,
    loading,
    addToCart,
    removeFromCart,
    clearCart,
    addToWishlist,
    removeFromWishlist,
    moveToCart,
    clearWishlist,
    login,
    signup,
    logout,
    fetchCart,
    fetchWishlist,
    placeOrder,
  };
};