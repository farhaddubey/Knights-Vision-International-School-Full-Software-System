import React from 'react'
import { Box, IconButton, Typography } from '@mui/material';
import Link from 'next/link';
import Image from 'next/image';
import WikiGalaxyIcon from '@/app/(wikigalaxy)/wikigalaxyicon';
const MobileLogo = () => {
  return (
    <Box display={'flex'} sx={{paddingRight:10}}>
    <Link href="/" passHref>
          <IconButton
            edge="start"
            sx={{
              marginY: 0,
              size: 50,
              display: { xs: 'block', sm: 'block' },
              borderRadius: '50%',
              paddingLeft: 2, 
            }}
          >
          <Image width={50} height={50} src={`/wikigalaxy.png`} alt="Logo" />
        </IconButton>
      </Link>
      <Link
              href={`/`}
              passHref
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'flex', textDecoration: 'none', color: 'inherit' }}
            >
              <Typography
                variant="h4"
                noWrap
                component="div"
                sx={{ display: { xs: 'block', sm: 'block', paddingTop: 20 } }}
              >
                WikiGalaxy
              </Typography>
            </Link>
            </Box>
  )
}

export default MobileLogo