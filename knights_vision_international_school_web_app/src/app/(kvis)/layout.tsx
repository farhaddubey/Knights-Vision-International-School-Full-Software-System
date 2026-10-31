import { Box } from '@mui/material';
import PrimarySearchAppBar from './components/AppBar';
import Footer from './components/Footer';
import './globals.css';
import NextTopLoader from 'nextjs-toploader';

const imageUrl = "/knights.png";
const siteUrl = "https://kvis.knightsnexus.com";
const title = "Sure Success Point School | Empowering Education - A Unit of KiREAD Group";
const description =
  "Sure Success Point School, a unit of Knights International Groups for Research, Education & Academic Development (KiREAD Group), is dedicated to fostering academic excellence and holistic development. Offering innovative K-12 education, STEM courses, arts, and extracurricular activities, we shape bright minds and future leaders. Visit www.suresuccesspoint.com to explore our programs and vision for transformative education.";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  image: imageUrl,
  openGraph: {
    title,
    description,
    url: siteUrl,
    type: 'website',
    images: [
      {
        url: imageUrl,
        width: 600,
        height: 600,
        alt: title,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@suresuccesspoint',
    title,
    description,
    images: imageUrl,
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const faviconSizes = [16, 32, 48, 57, 60, 72, 76, 96, 114, 120];
  return (
    <html lang="en">
      <head>
        <meta property="og:type" content="website" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={imageUrl} />
        <meta property="og:image:secure_url" content={imageUrl} />
        <meta property="og:url" content={siteUrl} />
        <meta property="og:site_name" content="Sure Success Point School" />
        <link rel="icon" href={imageUrl} />

        {/* Dynamic Favicon Links */}
        {faviconSizes.map((size) => (
          <link
            key={`android-${size}`}
            rel="icon"
            type="image/png"
            sizes={`${size}x${size}`}
            href={imageUrl}
          />
        ))}

        {/* Apple Touch Icons */}
        {faviconSizes.map((size) =>
          size >= 57 ? (
            <link
              key={`apple-${size}`}
              rel="apple-touch-icon"
              sizes={`${size}x${size}`}
              href={imageUrl}
            />
          ) : null
        )}

        <NextTopLoader />
        <style>{`
          .main-content {
            min-height: 100vh;
            padding-top: 64px;
          }
          @media (max-width: 600px) {
            .main-content {
              padding-top: 108px;
            }
          }
        `}</style>
      </head>
      <body>
        <Box maxWidth="100vw" sx={{ overflowX: 'clip' }}>
          <div style={{ margin: 0 }}>
            {/* Fixed App Bar */}
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                zIndex: 1000,
                background: 'rgba(0, 0, 0, 0.3)',
              }}
            >
              <PrimarySearchAppBar />
            </div>

            {/* Main Content */}
            <div className="main-content">
              {children}
            </div>

            {/* Footer */}
            <Footer />
          </div>
        </Box>
      </body>
    </html>
  );
}
