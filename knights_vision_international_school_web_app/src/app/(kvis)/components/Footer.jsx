"use client";
import * as React from 'react';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/X';
import CodeIcon from '@mui/icons-material/Code';
import InstagramIcon from '@mui/icons-material/Instagram';
import YouTubeIcon from '@mui/icons-material/YouTube';
import SureSuccessIcon from './SureSuccessBrandIcon';
import { Tabs, Tab, Box, Typography, Grid, Link, ButtonBase, useTheme, AppBar, Divider} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import PeopleIcon from '@mui/icons-material/People';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import ScienceIcon from '@mui/icons-material/Science';
import EventIcon from '@mui/icons-material/Event';
import Image from 'next/image';

function Copyright() {
  return (
    <Typography variant="body2" color="grey.300" mt={1}>
      {'Copyright © '}
      <Link href="https://www.suresuccesspoint.com/" color="grey.100" underline="hover">
        Sure Success Point School, A Unit of KiREAD Group
      </Link>
      {new Date().getFullYear()}
    </Typography>
  );
}

const GradientIconWrapper = ({
  icon,
  gradientId,
  colors,
  size = 24,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      style={{ verticalAlign: 'middle' }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          {colors.map((color, idx) => (
            <stop
              key={idx}
              offset={`${(idx / (colors.length - 1)) * 100}%`}
              stopColor={color}
            />
          ))}
        </linearGradient>
      </defs>
      <g fill={`url(#${gradientId})`}>
        {React.cloneElement(icon, {
          htmlColor: `url(#${gradientId})`,
        })}
      </g>
    </svg>
  )
}

const tabsData = [
  {
    label: 'Academic Programs',
    href: '/programs/academic',
    icon: <GradientIconWrapper icon={<SchoolIcon />} gradientId="academic" colors={['#1976d2', '#21cbf3']} />,
  },
  {
    label: 'Library Services',
    href: '/services/library',
    icon: <GradientIconWrapper icon={<LibraryBooksIcon />} gradientId="library" colors={['#f44336', '#ff9800']} />,
  },
  {
    label: 'Student Support',
    href: '/services/student-support',
    icon: <GradientIconWrapper icon={<PeopleIcon />} gradientId="support" colors={['#4caf50', '#00bfa5']} />,
  },
  {
    label: 'Innovation & Digital Learning',
    href: '/academics/innovation',
    icon: <GradientIconWrapper icon={<ScienceIcon />} gradientId="research" colors={['#3f51b5', '#00bcd4']} />,
  },
  {
    label: 'Activities & Student Life',
    href: '/activities/extracurricular',
    icon: <GradientIconWrapper icon={<EventIcon />} gradientId="activities" colors={['#ff9800', '#ffc107']} />,
  },
  {
    label: 'KiREAD Group',
    href: '/about/kiread-group',
    icon: <GradientIconWrapper icon={<EventIcon />} gradientId="activities" colors={['#ff9800', '#ffc107']} />,
  },
];

export default function Footer() {
  const theme = useTheme();

  return (
    <Box>
      <Tabs variant="scrollable" scrollButtons="auto" aria-label="Service Tabs">
        {tabsData.map(({ label, href, icon }) => (
          <Tab
            key={label}
            component={ButtonBase}
            label={
              <Link
                href={href}
                style={{
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    color: 'grey.100',
                    fontWeight: 'bold',
                    ml: 1,
                    color: theme.palette.primary.light
                  }}
                >
                  {icon}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: 'grey.100',
                    fontWeight: 'bold',
                    ml: 1,
                    '&:hover': { color: theme.palette.primary.light },
                  }}
                >
                  {label}
                </Typography>
              </Link>
            }
          />
        ))}
      </Tabs>

      <Box sx={{ bgcolor: '#000', color: 'grey.100', paddingX: { sm: 0, md: .5 }, paddingBottom: 1 }}>
        <Box sx={{ paddingY: 2, paddingX: { xs: 1, md: 5 }, overflow: 'hidden' }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              width: '100%',
              justifyContent: 'space-between',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
                minWidth: { xs: '100%', sm: '30%' },
              }}
            >
              <Box sx={{ width: { xs: '100%', sm: '100%' } }}>
                <Box>
                  <Image
                    width={50}
                    height={50}
                    src={"/knights.png"}
                    alt="Brand Logo of Sure Success Point School"
                  />
                  <SureSuccessIcon/>
                </Box>
                <Typography variant="body2" fontWeight={600} color="grey.100" gutterBottom>
                  School Office
                </Typography>
                <Typography variant="body2" color="grey.300" mb={2}>
                  Admissions, digital access, and student-support information through official school channels.
                </Typography>
                <Stack direction="row" spacing={1} useFlexGap>
                  <Button href="/contact" variant="contained" color="primary" sx={{ flexShrink: 0, bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }}>
                    Contact School Office
                  </Button>
                </Stack>
              </Box>
            </Box>

            {/* Academic Programs */}
            <Box
              sx={{
                display: { xs: 'none', sm: 'flex' },
                flexDirection: 'column',
                gap: 1,
              }}
            >
              <Typography variant="body2" fontWeight={600} color="grey.100">
                Learning Programmes
              </Typography>
              <Link href="/programs/early-years" color="grey.300" underline="none" sx={{ '&:hover': { color: 'grey.100' } }}>
                <Typography variant="body2">Early-Years Learning</Typography>
              </Link>
              <Link href="/programs/primary" color="grey.300" underline="none" sx={{ '&:hover': { color: 'grey.100' } }}>
                <Typography variant="body2">Primary School</Typography>
              </Link>
              <Link href="/programs/secondary" color="grey.300" underline="none" sx={{ '&:hover': { color: 'grey.100' } }}>
                <Typography variant="body2">Middle & Secondary</Typography>
              </Link>
              <Link href="/programs/senior-secondary" color="grey.300" underline="none" sx={{ '&:hover': { color: 'grey.100' } }}>
                <Typography variant="body2">Senior Secondary</Typography>
              </Link>
            </Box>

            {/* Student Services */}
            <Box
              sx={{
                display: { xs: 'none', sm: 'flex' },
                flexDirection: 'column',
                gap: 1,
              }}
            >
              <Typography variant="body2" fontWeight={600} color="grey.100">
                Student Services
              </Typography>
              <Link href="/services/counseling" color="grey.300" underline="none" sx={{ '&:hover': { color: 'grey.100' } }}>
                <Typography variant="body2">Counseling Services</Typography>
              </Link>
              <Link href="/services/library" color="grey.300" underline="none" sx={{ '&:hover': { color: 'grey.100' } }}>
                <Typography variant="body2">Library Access</Typography>
              </Link>
              <Link href="/services/career" color="grey.300" underline="none" sx={{ '&:hover': { color: 'grey.100' } }}>
                <Typography variant="body2">Career Guidance</Typography>
              </Link>
              <Link href="/digital/student-app" color="grey.300" underline="none" sx={{ '&:hover': { color: 'grey.100' } }}>
                <Typography variant="body2">Student App Access</Typography>
              </Link>
            </Box>

            {/* School Innovation */}
            <Box
              sx={{
                display: { xs: 'none', sm: 'flex' },
                flexDirection: 'column',
                gap: 1,
              }}
            >
              <Typography variant="body2" fontWeight={600} color="grey.100">
                School Innovation
              </Typography>
              <Link href="/academics/innovation" color="grey.300" underline="none" sx={{ '&:hover': { color: 'grey.100' } }}>
                <Typography variant="body2">Student Growth</Typography>
              </Link>
              <Link href="/academics/digital-learning" color="grey.300" underline="none" sx={{ '&:hover': { color: 'grey.100' } }}>
                <Typography variant="body2">Digital Learning</Typography>
              </Link>
              <Link href="/digital/faculty-app" color="grey.300" underline="none" sx={{ '&:hover': { color: 'grey.100' } }}>
                <Typography variant="body2">Faculty App Access</Typography>
              </Link>
              <Link href="/about/kiread-group" color="grey.300" underline="none" sx={{ '&:hover': { color: 'grey.100' } }}>
                <Typography variant="body2">KiREAD Group</Typography>
              </Link>
            </Box>

            {/* Community & Events */}
            <Box
              sx={{
                display: { xs: 'none', sm: 'flex' },
                flexDirection: 'column',
                gap: 1,
              }}
            >
              <Typography variant="body2" fontWeight={600} color="grey.100">
                Community & Admissions
              </Typography>
              <Link href="/activities/extracurricular" color="grey.300" underline="none" sx={{ '&:hover': { color: 'grey.100' } }}>
                <Typography variant="body2">Activities & Events</Typography>
              </Link>
              <Link href="/activities/sports" color="grey.300" underline="none" sx={{ '&:hover': { color: 'grey.100' } }}>
                <Typography variant="body2">Sports & Wellbeing</Typography>
              </Link>
              <Link href="/admissions/process" color="grey.300" underline="none" sx={{ '&:hover': { color: 'grey.100' } }}>
                <Typography variant="body2">Admission Process</Typography>
              </Link>
              <Link href="/admissions/fees" color="grey.300" underline="none" sx={{ '&:hover': { color: 'grey.100' } }}>
                <Typography variant="body2">Fee Guidance</Typography>
              </Link>
            </Box>

            {/* Legal Links */}
            <Box
              sx={{
                display: { xs: 'none', sm: 'flex' },
                flexDirection: 'column',
                gap: 1,
              }}
            >
              <Typography variant="body2" fontWeight={600} color="grey.100">
                Legal
              </Typography>
              <Link href="/terms" color="grey.300" underline="none" sx={{ '&:hover': { color: 'grey.100' } }}>
                <Typography variant="body2">Terms of Service</Typography>
              </Link>
              <Link href="/privacy" color="grey.300" underline="none" sx={{ '&:hover': { color: 'grey.100' } }}>
                <Typography variant="body2">Privacy Policy</Typography>
              </Link>
              <Link href="/compliance" color="grey.300" underline="none" sx={{ '&:hover': { color: 'grey.100' } }}>
                <Typography variant="body2">Compliance</Typography>
              </Link>
            </Box>
          </Box>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              pt: { xs: 4, sm: 8 },
              width: '100%',
              borderTop: '1px solid',
              borderColor: 'grey.700',
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'center', sm: 'flex-start' } }}>
              <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                <Link href="/privacy" color="grey.300" underline="none" sx={{ '&:hover': { color: 'grey.100' } }}>
                  Privacy Policy
                </Link>
                <Typography display="inline" sx={{ mx: 0.5, opacity: 0.5, color: 'grey.300' }}>
                  •
                </Typography>
                <Link href="/terms" color="grey.300" underline="none" sx={{ '&:hover': { color: 'grey.100' } }}>
                  Terms of Service
                </Link>
              </Box>
              <Copyright />
            </Box>
            <Stack
              direction="row"
              justifyContent="left"
              spacing={1}
              useFlexGap
              sx={{
                color: 'grey.300',
              }}
            >
              <IconButton
                target="_blank"
                color="inherit"
                href="https://www.instagram.com/suresuccesspoint/"
                aria-label="Instagram"
                sx={{ alignSelf: 'center', color: 'grey.300', '&:hover': { color: 'grey.100' } }}
              >
                <InstagramIcon />
              </IconButton>
              <IconButton
                target="_blank"
                color="inherit"
                href="https://www.youtube.com/channel/suresuccesspoint/"
                aria-label="YouTube"
                sx={{ alignSelf: 'center', color: 'grey.300', '&:hover': { color: 'grey.100' } }}
              >
                <YouTubeIcon />
              </IconButton>
              <IconButton
                target="_blank"
                color="inherit"
                href="https://www.facebook.com/suresuccesspoint/"
                aria-label="Facebook"
                sx={{ alignSelf: 'center', color: 'grey.300', '&:hover': { color: 'grey.100' } }}
              >
                <FacebookIcon />
              </IconButton>
              <IconButton
                target="_blank"
                color="inherit"
                href="https://x.com/suresuccesspoint/"
                aria-label="X"
                sx={{ alignSelf: 'center', color: 'grey.300', '&:hover': { color: 'grey.100' } }}
              >
                <TwitterIcon />
              </IconButton>
              <IconButton
                target="_blank"
                color="inherit"
                href="https://www.linkedin.com/company/suresuccesspoint/"
                aria-label="LinkedIn"
                sx={{ alignSelf: 'center', color: 'grey.300', '&:hover': { color: 'grey.100' } }}
              >
                <LinkedInIcon />
              </IconButton>
            </Stack>
          </Box>
        </Box>

        <Divider sx={{ mt: 1, bgcolor: 'grey.700' }} />
        <Typography variant="caption" display="block" sx={{ mt: 1, textAlign: 'center', color: 'grey.400' }}>
          © {new Date().getFullYear()} Sure Success Point School, A Unit of Knights International Groups for Research, Education & Academic Development. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
}
