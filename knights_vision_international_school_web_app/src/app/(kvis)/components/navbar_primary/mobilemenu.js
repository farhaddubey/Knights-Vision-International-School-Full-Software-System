
import React, {useState} from 'react'
import { Box } from '@mui/material';
import ThemeSelector from '../themes/ThemeSelector';
import PublicProfile from './public_profile';
import Internationalization from './internationaliztion';
import WikiAIMob from './mobile_menu_items/wikiai_mob';
import WikiCodeAI from './mobile_menu_items/wikicode_mob';
import WikiHow from './mobile_menu_items/wikihow_mob';
import WikiJobsMob from './mobile_menu_items/wikijobs_mob';
import WikiNewsMob from './mobile_menu_items/wikinews_mob';
import WikiStacksMob from './mobile_menu_items/wikistacks_mob';
import WikiToolsMob from './mobile_menu_items/wikitools_mob';
import WikiUniversityMob from './mobile_menu_items/wikiuniversity_mob';
const MobileMenu = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'column' }, // Change direction based on screen size
        alignItems: 'start', // Optional: center-align items
        justifyContent: 'center', // Optional: center-align items
      }}
    >        
              {/* <WikiUniversityMob/>
              <WikiCodeAI/>
              <WikiJobsMob/>
              <WikiNewsMob/>
              <WikiStacksMob/>
              <WikiToolsMob/>
              <WikiHow/>
              <WikiAIMob/> */}
              <PublicProfile />
              {/* <Internationalization/> */}
              <ThemeSelector />
        </Box>
  )
}

export default MobileMenu