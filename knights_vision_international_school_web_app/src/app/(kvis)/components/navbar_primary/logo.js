import React from 'react';
import Link from 'next/link';
import { IconButton, Typography } from '@mui/material';
import Image from 'next/image';

const Logo = () => {
  return (
    <Link href="/" passHref>
      <IconButton edge="start" sx={{ p: 0, m: 0, display: { xs: 'none', sm: 'block' }, borderRadius: '50%' }}>
        <Image src="/wikigalaxy.png" alt="Logo" height={50} width={50}/>
      </IconButton>
    </Link>
  );
};

export default Logo;
