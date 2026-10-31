import { Box, Typography, Grid, Paper, Button } from '@mui/material'
import {
  Gavel,
  Handshake,
  Build,
  Code,
  BusinessCenter,
  EmojiObjects,
} from '@mui/icons-material'
import Link from 'next/link'

const joinOptions = [
  {
    title: 'Become a Partner Lawyer',
    description: 'Join our trusted legal network & serve clients in your area or online.',
    icon: <Gavel sx={{ fontSize: 40, color: '#00e676' }} />,
    href: '/partner/lawyer',
  },
  {
    title: 'Start a Legal Service Center',
    description: 'Launch a district legal hub with our support and tools.',
    icon: <Handshake sx={{ fontSize: 40, color: '#00e676' }} />,
    href: '/partner/center',
  },
  {
    title: 'Contribute Legal Templates',
    description: 'Upload or sell your legal drafts, affidavits, and documents.',
    icon: <Build sx={{ fontSize: 40, color: '#00e676' }} />,
    href: '/partner/tools',
  },
  {
    title: 'Tech Partner / Integrator',
    description: 'Build tools, APIs, or AI integrations for the legal sector.',
    icon: <Code sx={{ fontSize: 40, color: '#00e676' }} />,
    href: '/partner/tech',
  },
  {
    title: 'Business Franchisee',
    description: 'Grow with our brand as a regional legal franchise or associate.',
    icon: <BusinessCenter sx={{ fontSize: 40, color: '#00e676' }} />,
    href: '/partner/business',
  },
  {
    title: 'Legal Educator / Creator',
    description: 'Create content, courses, or legal explainers and reach millions.',
    icon: <EmojiObjects sx={{ fontSize: 40, color: '#00e676' }} />,
    href: '/partner/educator',
  },
]

export default function JoinUsFooter() {
  return (
    <Box sx={{ bgcolor: '#111', color: '#fff', py: 8, px: { xs: 2, md: 6 } }}>
      <Typography
        variant="h4"
        sx={{ fontWeight: 700, mb: 6, textAlign: 'center', color: '#ffffff' }}
      >
        🤝 Join Us / Partner With Us
      </Typography>

      <Grid container spacing={3} justifyContent="center">
        {joinOptions.map((option) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={option.title}>
            <Link href={option.href} passHref>
              <Paper
                elevation={4}
                sx={{
                  px: 3,
                  py: 4,
                  borderRadius: 3,
                  height: '100%',
                  background: 'linear-gradient(145deg, #1e1e1e, #121212)',
                  transition: 'all 0.3s ease',
                  border: '1px solid #333',
                  '&:hover': {
                    transform: 'translateY(-6px)',
                    boxShadow: '0 10px 24px rgba(0, 255, 128, 0.3)',
                    borderColor: '#00e676',
                  },
                }}
              >
                <Box sx={{ textAlign: 'center', mb: 2 }}>{option.icon}</Box>
                <Typography
                  variant="h6"
                  sx={{ color: '#fff', fontWeight: 600, textAlign: 'center', mb: 1 }}
                >
                  {option.title}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: '#ccc', textAlign: 'center', mb: 2 }}
                >
                  {option.description}
                </Typography>
                <Button
                  variant="outlined"
                  fullWidth
                  sx={{
                    borderColor: '#00e676',
                    color: '#00e676',
                    '&:hover': {
                      bgcolor: '#00e676',
                      color: '#000',
                      borderColor: '#00e676',
                    },
                  }}
                >
                  Explore
                </Button>
              </Paper>
            </Link>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}
