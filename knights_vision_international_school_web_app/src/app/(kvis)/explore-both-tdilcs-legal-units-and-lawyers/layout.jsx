import { Box } from '@mui/material'
import React from 'react'
import CountriesTabs from '../components/home_pages/countries_problems_tabs';

const layout = ({children}) => {
  return (
    <Box>
        <CountriesTabs/>
        <Box>{children}</Box>
    </Box>
  )
}

export default layout