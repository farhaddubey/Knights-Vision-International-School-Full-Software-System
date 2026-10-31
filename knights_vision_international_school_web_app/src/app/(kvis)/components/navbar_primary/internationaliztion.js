"use client";

import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import LanguageIcon from '@mui/icons-material/Language';
import { IconButton, Typography, Menu, MenuItem, useTheme } from '@mui/material';
import i18n from 'i18next';

const languages = {
  en: { label: "English", name: "English" },
  es: { label: "Español", name: "Español" },
  zh: { label: "中文", name: "中文" },
  hi: { label: "हिन्दी", name: "हिन्दी" },
  ar: { label: "العربية", name: "العربية" },
  pt: { label: "Português", name: "Português" },
  bn: { label: "বাংলা", name: "বাংলা" },
  ru: { label: "Русский", name: "Русский" },
  ja: { label: "日本語", name: "日本語" },
  pa: { label: "ਪੰਜਾਬੀ", name: "ਪੰਜਾਬੀ" },
  de: { label: "Deutsch", name: "Deutsch" },
  ko: { label: "한국어", name: "한국어" },
  fr: { label: "Français", name: "Français" },
  vi: { label: "Tiếng", name: "Tiếng Việt" },
  ur: { label: "اردو", name: "اردو" },
  it: { label: "Italiano", name: "Italiano" },
  ta: { label: "தமிழ்", name: "தமிழ்" },
  tr: { label: "Türkçe", name: "Türkçe" },
  fa: { label: "فارسی", name: "فارسی" },
  mr: { label: "मराठी", name: "मराठी" },
};

const Internationalization = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [languageAnchorEl, setLanguageAnchorEl] = useState(null);

  const handleLanguageMenuOpen = (event) => {
    setLanguageAnchorEl(event.currentTarget);
  };
  
  const handleLanguageMenuClose = () => {
    setLanguageAnchorEl(null);
  };
  
  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
    handleLanguageMenuClose();
  };

  return (
    <>
      <IconButton
        size="large"
        edge="end"
        aria-label="Wiki Language"
        onClick={handleLanguageMenuOpen}
        color="inherit"
        sx={{
          paddingTop:0.75,
          display: 'flex',
          flexDirection: { xs: 'row', sm: 'row', md: 'row', lg: 'row', xl:'column' }, // Change direction based on screen size
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: { xs: 'left', md: 'center' }, // Align text
          cursor: 'pointer',
          '&:hover': {
            color: theme.palette.primary.main,
          },
        }}
      >
          <LanguageIcon/>
        <Typography variant="caption" sx={{paddingTop:{lg:.35}}} mx={{ xs: 1, md: 1, lg:1, xl:0 }}>
          {t('language')}
        </Typography>
      </IconButton>
      <Menu
        id="language-menu"
        anchorEl={languageAnchorEl}
        open={Boolean(languageAnchorEl)}
        onClose={handleLanguageMenuClose}
        MenuListProps={{
          sx: {
            maxHeight: 400,
            overflowY: 'auto',
            '&::-webkit-scrollbar': { display: 'none' },
            '-ms-overflow-style': 'none',
            'scrollbar-width': 'none',
          },
        }}
      >
        {Object.keys(languages).map((lang) => (
          <MenuItem
            key={lang}
            selected={i18n.language === lang}
            onClick={() => handleLanguageChange(lang)}
          >
            {languages[lang].label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default Internationalization;
