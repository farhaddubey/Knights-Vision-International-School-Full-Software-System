import { Box} from '@mui/material'
import React from 'react'
import LegalTerms from './components/home_pages/LegalTerms'; 
import TutorialVideoScroller from './components/home_pages/TutorialVideoScroll'; 
import ImageSlider from "./components/ImageSlider";
import FeaturesGrid2 from "./components/FeaturesGrid";
import InstituteIntroWithFeatures from "./components/InstituteIntoWithFeatures";
import FeatureStar from "./components/FeatureStar";
import ExamCategories from "./components/ExamCategories";
import InfoGrid2 from "./components/techEduSystem";
import StatsShowcase from "./components/StatsShowCase";
import StudentGrid1 from "./components/StudentGrid1";
import CityGrid from "./components/SchoolLocation";
import InstitutionCultures from "./components/InstitutionalCulters";

const HomePage = () => {
  return (
    <>
    <Box display="flex" flexDirection={"column"} minHeight="100vh">
          <ImageSlider/>
    <Box
  sx={{
    position: "relative",
    backgroundImage: {
      xs: "linear-gradient(rgb(0, 0, 0), rgba(0, 0, 0, 0.9)), url('https://firebasestorage.googleapis.com/v0/b/sspointnextflutterappadmin.firebasestorage.app/o/final_bg.png?alt=media&token=939c58c9-2e1a-45c7-8235-d12f0653d948')", // 70% darker on small screens
      lg: "linear-gradient(rgb(0, 0, 0), rgba(0, 0, 0, 0.7)), url('https://firebasestorage.googleapis.com/v0/b/sspointnextflutterappadmin.firebasestorage.app/o/final_bg.png?alt=media&token=939c58c9-2e1a-45c7-8235-d12f0653d948')", // Normal on large screens
    },
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  }}
>
    <FeaturesGrid2/>
    <InstituteIntroWithFeatures/>
    <ExamCategories/>
    </Box>
    <FeatureStar/>
    <InfoGrid2/>
    <CityGrid/>
    <StatsShowcase/>
    <StudentGrid1/>
    <TutorialVideoScroller/>
    <InstitutionCultures/>
    <LegalTerms/>
  </Box>
  </>
    
  )
}

export default HomePage