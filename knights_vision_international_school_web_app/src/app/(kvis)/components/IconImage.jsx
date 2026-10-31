import Image from 'next/image';
import Link from 'next/link';

const IconImage = () => {
  return (
    <div>
      <Link href={'/'}>
      <Image
        
        src="/favicon.ico" // Path to the image in the public folder
        alt="My Favicon"
        width={60}// Adjust the width as needed
        height={60} // Adjust the height as needed
      />
      </Link>
    </div>
  );
};

export default IconImage;