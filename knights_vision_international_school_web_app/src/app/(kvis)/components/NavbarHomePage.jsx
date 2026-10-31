"use client";
import * as React from 'react';
import axios from 'axios';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';

export default function FooterScrollableTabsButtonAuto() {
  const [value, setValue] = React.useState(0);
  const [navItems, setNavItems] = React.useState([]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  React.useEffect(() => {
    const fetchNavItems = async () => {
      try {
        const response = await axios.get('/api/site-homepage-navbar');
        setNavItems(response.data);
      } catch (error) {
        console.error('Failed to fetch navbar items:', error);
      }
    };
    fetchNavItems();
  }, []);

  return (
    <Box sx={{ bgcolor: '#212121' }}>
      <Tabs
        value={value}
        onChange={handleChange}
        variant="scrollable"
        scrollButtons="auto"
        aria-label="scrollable auto tabs example"
      >
        {navItems.map((item, index) => (
          <Tab
            key={item.id}
            href={item.page_link || `/${item.slug}`}
            label={item.title}
            sx={{ color: '#fafafa', bgcolor:"#212121" }}
          />
        ))}
      </Tabs>
    </Box>
  );
}