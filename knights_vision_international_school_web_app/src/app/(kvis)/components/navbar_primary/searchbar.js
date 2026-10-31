'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Box, List, ListItem, Paper, InputBase, ClickAwayListener } from '@mui/material';
import { styled, alpha } from '@mui/system';
import SearchIcon from '@mui/icons-material/Search';
import Link from 'next/link';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(1),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(1),
    width: '350px',
  },
  [theme.breakpoints.down('sm')]: {
    width: '190px',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      width: '30ch',
      '&:focus': {
        width: '55ch',
      },
    },
    '&::placeholder': {
      color: theme.palette.secondary.main,
    },
  },
}));

const SuggestionBox = styled(Paper)(({ theme }) => ({
  position: 'absolute',
  top: '100%',
  left: 8,
  right: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.8)',
  color: '#fff',
  zIndex: 1,
  maxWidth: 360,
  maxHeight: '260px',
  overflowY: 'auto',
  scrollbarWidth: 'none', /* Firefox */
  '&::-webkit-scrollbar': {
    display: 'none', /* Chrome, Safari, and Opera */
  },
}));

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    if (query.length > 2) {
      console.log(`Fetching data with query: ${query}`);
      fetch(`http://localhost:1337/api/contents`, {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN}`
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          console.log('Fetched data:', data);
          const filteredData = data.data.filter(item => 
            item.attributes.topic_name.toLowerCase().includes(query.toLowerCase())
          );
          setSuggestions(filteredData);
        })
        .catch((error) => {
          console.error('Error fetching suggestions:', error);
          setSuggestions([]);
        });
    } else {
      setSuggestions([]);
    }
  }, [query]);

  const handleOutsideClick = () => {
    setSuggestions([]);
  };

  return (
    <ClickAwayListener onClickAway={handleOutsideClick}>
      <Box sx={{ position: 'relative'}}>
        <Search>
          <SearchIconWrapper>
            <SearchIcon />
          </SearchIconWrapper>
          <StyledInputBase
            ref={inputRef}
            placeholder="Search Legal Services... Documents... "
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </Search>
        {suggestions.length > 0 && (
          <SuggestionBox>
            <List>
              {suggestions.map((suggestion) => (
                suggestion.attributes.contentKey ? (
                  <ListItem 
                  key={suggestion.id} 
                  sx={{ 
                    '&:hover': { 
                      backgroundColor: 'primary.main' 
                    } 
                  }}
                >
                  <Link 
                    href={`/search/${suggestion.attributes.contentKey}`} 
                    passHref 
                    style={{ 
                      textDecoration: 'none', 
                      color: 'inherit' 
                    }}
                  >
                    {suggestion.attributes.topic_name}
                  </Link>
                </ListItem>
                ) : null
              ))}
            </List>
          </SuggestionBox>
        )}
      </Box>
    </ClickAwayListener>
  );
};

export default SearchBar;
