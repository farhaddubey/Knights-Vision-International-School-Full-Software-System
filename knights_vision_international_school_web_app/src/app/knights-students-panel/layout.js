import "./globals.css";

const imageUrl = "/knights.png";

export const metadata = {
  metadataBase: new URL("https://www.sspointschool.in"),
  title: "Sure Success Point School | A Unit of the Knights Groups | Education, Discipline, Excellence",
  description:
    "Sure Success Point School (SSPS), a proud unit of the Knights Groups, stands as a beacon of modern education blended with values, discipline, and digital excellence. With branches across districts, SSPS delivers quality education, moral upbringing, and futuristic learning solutions. Join the institution where humanism, hard work, science, and digital systems shape the leaders of tomorrow. Visit us at www.sspointschool.in",
  image: imageUrl,

  openGraph: {
    title: "Sure Success Point School | A Unit of the Knights Groups | Education, Discipline, Excellence",
    description:
      "Sure Success Point School (SSPS), a proud unit of the Knights Groups, stands as a beacon of modern education blended with values, discipline, and digital excellence. With branches across districts, SSPS delivers quality education, moral upbringing, and futuristic learning solutions. Join the institution where humanism, hard work, science, and digital systems shape the leaders of tomorrow.",
    url: "https://www.sspointschool.in/",
    type: "website",
    images: [
      {
        url: imageUrl,
        width: 600,
        height: 600,
        alt: "Sure Success Point School | A Unit of the Knights Groups",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    site: "@sspointschool",
    title: "Sure Success Point School | A Unit of the Knights Groups",
    description:
      "Sure Success Point School (SSPS), a unit of the Knights Groups, pioneers disciplined digital education with a focus on values, science, and success across all its branches.",
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
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({ children }) {
  const faviconSizes = [16, 32, 64, 96, 128, 192];

  return (
    <html lang="en">
      <head>
        <link rel="icon" href={imageUrl} sizes="96x96" type="image/png" />
        {faviconSizes.map((size) => (
          <link
            key={size}
            rel="icon"
            type="image/png"
            sizes={`${size}x${size}`}
            href={imageUrl}
          />
        ))}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>{children}</body>
    </html>
  );
}
