import { Box } from '@mui/material'
import React from 'react'
import DepartmentTabs from '../components/home_pages/department_problems_tabs';

const layout = ({children}) => {
  return (
    <Box>
        <DepartmentTabs />
        <Box>{children}</Box>
        
    </Box>
  )
}

export default layout