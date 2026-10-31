"use client";
// components/ThemeIcon.js
import React from 'react';
import { MenuItem, Select, FormControl } from '@mui/material';
import { useThemeContext } from '../../context/ThemeContext';
import { themes, getThemeOptions } from '../themes/themes';

const ThemeIcon = ({currentTheme, changeTheme, ...props}) => {
  // const { currentTheme, changeTheme } = useThemeContext();
  return (
   <>
    <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
      <Select
        value={currentTheme}
        onChange={(e) => changeTheme(e.target.value)}
        displayEmpty
        inputProps={{ 'aria-label': 'Theme Select' }}
        sx={{ color: 'inherit' }}>
        {getThemeOptions().map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
   </>
  );
};

export default ThemeIcon;
