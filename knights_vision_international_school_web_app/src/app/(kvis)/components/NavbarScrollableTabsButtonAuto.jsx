"use client";
import { Box, Tabs, Tab } from '@mui/material';
import * as React from 'react'; 

export default function NavbarScrollableTabsButtonAuto() {
    const [value, setValue] = React.useState(0);
    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    return (
        <>
  

            {/* Second Navbar: Scrollable Tabs */}
            <Box sx={{ 
                marginTop: '64px', // Adjust this value based on the height of your fixed navbar
                maxWidth: { xs: 320, sm: 480 },
                bgcolor: '#212121',
                position: 'relative', // Ensure it doesn't get hidden behind the fixed navbar
                zIndex: 90, // Keep it below the first navbar in terms of stacking
            }}>
                <Tabs
                    value={value}
                    onChange={handleChange}
                    variant='scrollable'
                    scrollButtons="auto"
                    aria-label='scrollable auto tabs example'
                >
                    <Tab label="Item One" />
                    <Tab label="Item Two" />
                    <Tab label="Item Three" />
                </Tabs>
            </Box>
        </>
    );
}
