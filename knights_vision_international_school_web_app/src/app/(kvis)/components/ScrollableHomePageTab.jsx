"use client";
import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';

export default function FooterScrollableTabsButtonAuto(){
    const[value, setValue] = React.useState(0); 
    const handleChange = (event, newValue) => {
        setValue(newValue); 
    };
    return(
        <Box sx={{bgcolor: '#212121'}}>
            <Tabs 
                value={value}
                onChange={handleChange}
                variant="scrollable"
                scrollButtons="auto"
                aria-label="scrollable auto tabs example">
                    <Tab href='/lowerkgI' label="Lower KG1" sx={{color: '#fafafa'}}/>
                    <Tab href="/lowerkgII" label="Lower KG2" sx={{color: '#fafafa'}}/>
                    <Tab href="/classI" label="Class I" sx={{color: '#fafafa'}}/>
                    <Tab href="/classII" label="Class II" sx={{color: '#fafafa'}}/>
                    <Tab href="/classIII" label="Class III" sx={{color: '#fafafa'}}/>
                    <Tab href="/classIV" label="Class IV" sx={{color: '#fafafa'}}/>
                    <Tab href="/classV" label="Class V" sx={{color: '#fafafa'}}/>
                    <Tab href="/classVI" label="Class VI" sx={{color: '#fafafa'}}/>
                    <Tab href="/classVII" label="Class VII" sx={{color: '#fafafa'}}/>
                    <Tab href="/classVIII" label="Class VIII" sx={{color: '#fafafa'}}/>
                    <Tab href="/classIX" label="Class IX" sx={{color: '#fafafa'}}/>
                    <Tab href="/classX" label="Class X" sx={{color: '#fafafa'}}/>
                    <Tab href="/classXI" label="Class XI" sx={{color: '#fafafa'}}/>
                    <Tab href="/classXII" label="Class XII" sx={{color: '#fafafa'}}/>
                    <Tab href="/institutionrules" label="Institution Rules" sx={{color: '#fafafa'}}/>
                    <Tab href="/institutionreligion" label="Instituion Religion" sx={{color: '#fafafa'}}/>
                </Tabs>
        </Box>
        
    );
}