import CropIcon from "@mui/icons-material/Crop";
import PhotoSizeSelectLargeIcon from "@mui/icons-material/PhotoSizeSelectLarge";
import RotateRightIcon from "@mui/icons-material/RotateRight";
import FlipIcon from "@mui/icons-material/Flip";
import TuneIcon from "@mui/icons-material/Tune";
import PhotoFilterIcon from "@mui/icons-material/PhotoFilter";
import CompressIcon from "@mui/icons-material/Compress";
import ImageIcon from "@mui/icons-material/Image";
import CollectionsIcon from "@mui/icons-material/Collections";
import InsertPhotoIcon from "@mui/icons-material/InsertPhoto";
import SlideshowIcon from "@mui/icons-material/Slideshow";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import ColorizeIcon from "@mui/icons-material/Colorize";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import OpacityIcon from "@mui/icons-material/Opacity";
import BlurOnIcon from "@mui/icons-material/BlurOn";
import LayersIcon from "@mui/icons-material/Layers";
import MergeIcon from "@mui/icons-material/CallMerge";
import FileCopyIcon from "@mui/icons-material/FileCopy";

export const imageOperations = [
  {
    link: "/crop-image",
    title: "Crop Image",
    icon: <CropIcon fontSize="large" />,
    description: "Crop an image to remove unwanted parts and enhance focus.",
    image: "https://img.freepik.com/premium-psd/3d-design-illustrations_504676-3851.jpg?ga=GA1.1.1596432489.1731156360&semt=ais_hybrid",
  },
  {
    link: "/resize-image",
    title: "Resize Image",
    icon: <PhotoSizeSelectLargeIcon fontSize="large" />,
    description: "Adjust the dimensions of an image without losing quality.",
    image: "https://img.freepik.com/free-vector/graphic-design-workspace-background_23-2147782103.jpg?ga=GA1.1.1596432489.1731156360&semt=ais_hybrid",
  },
  {
    link: "/rotate-image",
    title: "Rotate Image",
    icon: <RotateRightIcon fontSize="large" />,
    description: "Rotate images to the desired orientation quickly.",
    image: "https://img.freepik.com/free-psd/3d-rendering-ui-icon_23-2149182289.jpg?ga=GA1.1.1596432489.1731156360&semt=ais_hybrid",
  },
  {
    link: "/flip-image",
    title: "Flip Image",
    icon: <FlipIcon fontSize="large" />,
    description: "Flip images horizontally or vertically for mirror effects.",
    image: "https://img.freepik.com/premium-photo/abstract-luxury-gradient-blue-background-smooth-dark-blue-with-black-vignette-studio-banner_1026678-43.jpg?ga=GA1.1.1596432489.1731156360&semt=ais_hybrid",
  },
  {
    link: "/adjust-brightness",
    title: "Adjust Brightness",
    icon: <Brightness4Icon fontSize="large" />,
    description: "Increase or decrease image brightness to enhance clarity.",
    image: "https://img.freepik.com/premium-psd/3d-design-illustrations_504676-3851.jpg?ga=GA1.1.1596432489.1731156360&semt=ais_hybrid",
  },
  {
    link: "/adjust-contrast",
    title: "Adjust Contrast",
    icon: <TuneIcon fontSize="large" />,
    description: "Enhance contrast to improve image depth and visibility.",
    image: "https://img.freepik.com/free-vector/graphic-design-workspace-background_23-2147782103.jpg?ga=GA1.1.1596432489.1731156360&semt=ais_hybrid",
  },
  {
    link: "/apply-filters",
    title: "Apply Filters",
    icon: <PhotoFilterIcon fontSize="large" />,
    description: "Add artistic filters to enhance your images.",
    image: "https://img.freepik.com/free-photo/man-editing-photos-computer_53876-46864.jpg?ga=GA1.1.1596432489.1731156360&semt=ais_hybrid",
  },
  {
    link: "/compress-image",
    title: "Compress Image",
    icon: <CompressIcon fontSize="large" />,
    description: "Reduce image file size while maintaining quality.",
    image: "https://img.freepik.com/free-photo/creative-creator-doing-portrait-retouch-using-color-grade-late-night-professional-editing-office_482257-5161.jpg?ga=GA1.1.1596432489.1731156360&semt=ais_hybrid",
  },
  {
    link: "/convert-image-format",
    title: "Convert Image Format",
    icon: <ImageIcon fontSize="large" />,
    description: "Convert images between popular formats like JPG, PNG, and WebP.",
    image: "https://img.freepik.com/premium-psd/3d-design-illustrations_504676-3851.jpg?ga=GA1.1.1596432489.1731156360&semt=ais_hybrid",
  },
  {
    link: "/merge-images",
    title: "Merge Images",
    icon: <MergeIcon fontSize="large" />,
    description: "Combine multiple images into a single file.",
    image: "https://img.freepik.com/free-psd/3d-rendering-ui-icon_23-2149182289.jpg?ga=GA1.1.1596432489.1731156360&semt=ais_hybrid",
  },
  {
    link: "/convert-image-to-pdf",
    title: "Convert Image to PDF",
    icon: <FileCopyIcon fontSize="large" />,
    description: "Turn images into a high-quality PDF file for easy sharing.",
    image: "https://img.freepik.com/premium-photo/abstract-luxury-gradient-blue-background-smooth-dark-blue-with-black-vignette-studio-banner_1026678-43.jpg?ga=GA1.1.1596432489.1731156360&semt=ais_hybrid",
  },
  {
    link: "/remove-background",
    title: "Remove Background",
    icon: <AutoFixHighIcon fontSize="large" />,
    description: "Automatically remove image backgrounds for transparent PNGs.",
    image: "https://img.freepik.com/free-photo/young-remote-woman-architect-working-modern-cad-program-overtime-industrial-female-engineer-studying-prototype-idea-personal-computer-showing-cad-software-device-display_482257-14610.jpg?ga=GA1.1.1596432489.1731156360&semt=ais_hybrid",
  },
  {
    link: "/blur-image",
    title: "Blur Image",
    icon: <BlurOnIcon fontSize="large" />,
    description: "Apply blur effects to create artistic or privacy-focused images.",
    image: "https://img.freepik.com/free-photo/man-is-editing-photos-laptop-using-graphics-tablet-interactive-pen-display_8353-6239.jpg?ga=GA1.1.1596432489.1731156360&semt=ais_hybrid",
  },
  {
    link: "/add-watermark",
    title: "Add Watermark",
    icon: <OpacityIcon fontSize="large" />,
    description: "Insert text or logo watermarks to protect your images.",
    image: "https://img.freepik.com/premium-psd/3d-design-illustrations_504676-3851.jpg?ga=GA1.1.1596432489.1731156360&semt=ais_hybrid",
  },
  {
    link: "/invert-colors",
    title: "Invert Colors",
    icon: <ColorizeIcon fontSize="large" />,
    description: "Invert image colors to create negative effects.",
    image: "https://img.freepik.com/free-photo/freelance-designer-works-photo-editing-project-remote-office_482257-116472.jpg?ga=GA1.1.1596432489.1731156360&semt=ais_hybrid",
  },
  {
    link: "/sharpen-image",
    title: "Sharpen Image",
    icon: <RemoveRedEyeIcon fontSize="large" />,
    description: "Enhance image details by sharpening edges.",
    image: "https://img.freepik.com/premium-photo/portrait-graphic-designer-working-office-with-laptop-monitor-graphic-drawing-tablet-color-palette-retouching-images-special-program-retoucher-workplace-photo-studio-creative-agency_141858-1218.jpg?ga=GA1.1.1596432489.1731156360&semt=ais_hybrid",
  },
  {
    link: "/slideshow-maker",
    title: "Create Slideshow",
    icon: <SlideshowIcon fontSize="large" />,
    description: "Turn images into stunning slideshows with transitions.",
    image: "https://img.freepik.com/free-photo/young-remote-woman-architect-working-modern-cad-program-overtime-industrial-female-engineer-studying-prototype-idea-personal-computer-showing-cad-software-device-display_482257-14610.jpg?ga=GA1.1.1596432489.1731156360&semt=ais_hybrid",
  },
];
