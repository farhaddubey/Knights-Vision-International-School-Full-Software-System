import MergeIcon from "@mui/icons-material/CallMerge";
import SplitIcon from "@mui/icons-material/CallSplit";
import CompressIcon from "@mui/icons-material/Compress";
import ConvertIcon from "@mui/icons-material/SyncAlt";
import EditIcon from "@mui/icons-material/Edit";
import SignIcon from "@mui/icons-material/Draw";
import WatermarkIcon from "@mui/icons-material/Opacity";
import UnlockIcon from "@mui/icons-material/LockOpen";
import AnnotateIcon from "@mui/icons-material/Comment";
import OcrIcon from "@mui/icons-material/TextFields";
import PageviewIcon from "@mui/icons-material/Pageview";
import RotateLeftIcon from "@mui/icons-material/RotateLeft";
import LayersIcon from "@mui/icons-material/Layers";
import DeleteIcon from "@mui/icons-material/Delete";
import RedoIcon from "@mui/icons-material/Redo";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import WebIcon from "@mui/icons-material/Language";
import CameraIcon from "@mui/icons-material/CameraAlt";
import CompareIcon from "@mui/icons-material/Compare";
import PrintIcon from "@mui/icons-material/Print";
import InvoiceIcon from "@mui/icons-material/Receipt";
import MetadataIcon from "@mui/icons-material/Info";
import CropIcon from "@mui/icons-material/Crop";
import LockIcon from "@mui/icons-material/Lock";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import PhotoIcon from "@mui/icons-material/Photo";

export const pdfOperations = [
  { link:"merge-pdf", title: "Merge PDFs", icon: <MergeIcon fontSize="large" />, description: "Combine multiple PDFs into one file.", image: "https://img.freepik.com/premium-psd/pdf-format-file-3d-icon_643365-529.jpg?ga=GA1.1.2024053517.1740751536&semt=ais_hybrid" },
  { link:"split-pdfs", title: "Split PDFs", icon: <SplitIcon fontSize="large" />, description: "Separate a PDF into multiple smaller files.", image: "https://img.freepik.com/premium-vector/download-pdf-button-downloading-document-concept-file-with-pdf-label-down-arrow-sign_100456-1324.jpg?ga=GA1.1.1596432489.1731156360&semt=ais_hybrid" },
  { link:"compress-pdf", title: "Compress PDFs", icon: <CompressIcon fontSize="large" />, description: "Reduce PDF file size while maintaining quality.", image: "https://img.freepik.com/premium-psd/psd-3d-illustration-pdf-format_892893-348.jpg?ga=GA1.1.1596432489.1731156360&semt=ais_hybrid" },
  { link:"edit-pdf", title: "Edit PDFs", icon: <EditIcon fontSize="large" />, description: "Modify text, images, and layout in a PDF.", image: "https://img.freepik.com/free-vector/editing-body-text-concept-illustration_114360-5791.jpg?ga=GA1.1.1596432489.1731156360&semt=ais_hybrid" },
  { link:"sign-pdf", title: "Sign PDFs", icon: <SignIcon fontSize="large" />, description: "Digitally sign your PDFs securely.", image: "https://img.freepik.com/free-vector/illustration-document-icon_53876-28510.jpg?ga=GA1.1.1596432489.1731156360&semt=ais_hybrid" },
  { link:"convert-pdfs", title: "Convert PDFs", icon: <ConvertIcon fontSize="large" />, description: "Convert PDFs to various formats.", image: "https://img.freepik.com/premium-vector/color-download-file-format-icons-collection_629597-70.jpg?ga=GA1.1.1596432489.1731156360&semt=ais_hybrid" },
  { link:"convert-to-pdf", title: "Convert to PDF", icon: <ConvertIcon fontSize="large" />, description: "Convert files to PDF format.", image: "https://img.freepik.com/premium-vector/color-download-file-format-icons-collection_629597-70.jpg?ga=GA1.1.1596432489.1731156360&semt=ais_hybrid" },
  { link:"convert-from-pdf", title: "Convert from PDF", icon: <ConvertIcon fontSize="large" />, description: "Convert PDFs to other formats.", image: "https://img.freepik.com/premium-vector/download-pdf-file-icon-spreadsheet-document-type-vector-pdf-icon_123447-3782.jpg?ga=GA1.1.1596432489.1731156360&semt=ais_hybrid" },
  { link:"images-pdf", title: "Images to PDF", icon: <PhotoIcon fontSize="large" />, description: "Convert images into a single PDF.", image: "https://img.freepik.com/premium-vector/download-pdf-file-icon-spreadsheet-document-type-vector-pdf-icon_123447-3782.jpg?ga=GA1.1.1596432489.1731156360&semt=ais_hybrid" },
  { link:"pdf-images", title: "PDF to Images", icon: <PhotoIcon fontSize="large" />, description: "Extract images from a PDF.", image: "https://img.freepik.com/premium-vector/key-icon-color-vector-illustration_755164-2306.jpg?ga=GA1.1.1596432489.1731156360&semt=ais_hybrid" },
  { link:"extract-images-from-pdf", title: "Extract PDF Images", icon: <PhotoIcon fontSize="large" />, description: "Get images from PDFs.", image: "https://img.freepik.com/premium-vector/jpg-pdf-concept-illustration_108061-1661.jpg?ga=GA1.1.1596432489.1731156360&semt=ais_hybrid" },
  { link:"protect-pdf", title: "Protect PDF", icon: <LockIcon fontSize="large" />, description: "Secure PDFs with password protection.", image: "https://img.freepik.com/premium-vector/home-insurance-policy-services-home-safety-security-vector-stock-illustration_100456-7966.jpg?ga=GA1.1.1596432489.1731156360&semt=ais_hybrid" },
  { link:"unlock-pdf", title: "Unlock PDFs", icon: <UnlockIcon fontSize="large" />, description: "Remove password from secured PDFs.", image: "https://img.freepik.com/free-vector/unlock-folder-secure-data-file-document-with-lock-key-icon_126523-2317.jpg?ga=GA1.1.1596432489.1731156360&semt=ais_hybrid" },
  { link:"rotate-pdf-pages", title: "Rotate PDF Pages", icon: <RotateLeftIcon fontSize="large" />, description: "Rotate pages within a PDF.", image: "https://img.freepik.com/free-vector/flat-design-360-degrees-label-collection_23-2149925326.jpg?ga=GA1.1.1596432489.1731156360&semt=ais_hybrid" },
  { link:"remove-pdf-pages", title: "Remove PDF Pages", icon: <RemoveCircleIcon fontSize="large" />, description: "Delete unwanted pages from PDFs.", image: "https://img.freepik.com/free-vector/social-media-illustration_24877-52396.jpg?ga=GA1.1.1596432489.1731156360&semt=ais_hybrid" },
  { link:"extract-pdf-pages", title: "Extract PDF Pages", icon: <PageviewIcon fontSize="large" />, description: "Extract specific pages from a PDF.", image: "https://img.freepik.com/premium-vector/arrow-download-file-icon_24908-26952.jpg?ga=GA1.1.1596432489.1731156360&semt=ais_hybrid" },
  { link:"rearrange-pdf-pages", title: "Rearrange PDF Pages", icon: <LayersIcon fontSize="large" />, description: "Reorder pages within a PDF.", image: "https://img.freepik.com/premium-vector/arrow-download-file-icon_24908-26952.jpg?ga=GA1.1.1596432489.1731156360&semt=ais_hybrid" },
  { link:"webpage-to-pdf", title: "Webpage to PDF", icon: <WebIcon fontSize="large" />, description: "Convert a webpage to a PDF.", image: "/images/web-to-pdf.png" },
  { link:"create-pdf-with-camera", title: "Create PDF with Camera", icon: <CameraIcon fontSize="large" />, description: "Capture images and convert to PDF.", image: "https://img.freepik.com/premium-vector/arrow-download-file-icon_24908-26952.jpg?ga=GA1.1.1596432489.1731156360&semt=ais_hybrid" },
  { link:"extract-text-from-pdf", title: "PDF OCR", icon: <OcrIcon fontSize="large" />, description: "Extract text from scanned PDFs.", image: "https://img.freepik.com/premium-vector/arrow-download-file-icon_24908-26952.jpg?ga=GA1.1.1596432489.1731156360&semt=ais_hybrid" },
  { link:"add-watermark-to-pdf", title: "Add Watermark", icon: <WatermarkIcon fontSize="large" />, description: "Insert watermarks into PDFs.", image: "https://img.freepik.com/premium-vector/arrow-download-file-icon_24908-26952.jpg?ga=GA1.1.1596432489.1731156360&semt=ais_hybrid" },
  { link:"annotate-pdf", title: "Annotate PDF", icon: <AnnotateIcon fontSize="large" />, description: "Add annotations and comments to PDFs.", image: "https://img.freepik.com/premium-vector/arrow-download-file-icon_24908-26952.jpg?ga=GA1.1.1596432489.1731156360&semt=ais_hybrid" },
  { link:"redact-pdf", title: "Redact PDF", icon: <DeleteIcon fontSize="large" />, description: "Blackout or remove sensitive information.", image: "https://img.freepik.com/premium-vector/arrow-download-file-icon_24908-26952.jpg?ga=GA1.1.1596432489.1731156360&semt=ais_hybrid" },
  { link:"compate-pdfs", title: "Compare PDFs", icon: <CompareIcon fontSize="large" />, description: "Compare two PDF files for differences.", image: "https://img.freepik.com/premium-vector/arrow-download-file-icon_24908-26952.jpg?ga=GA1.1.1596432489.1731156360&semt=ais_hybrid" },
  { link:"web-optimize-pdf", title: "Web Optimize PDF", icon: <WebIcon fontSize="large" />, description: "Optimize PDFs for faster web viewing.", image: "https://img.freepik.com/premium-vector/arrow-download-file-icon_24908-26952.jpg?ga=GA1.1.1596432489.1731156360&semt=ais_hybrid" },
  { link:"create-pdf", title: "Create PDF", icon: <EditIcon fontSize="large" />, description: "Generate PDFs from various sources.", image: "https://img.freepik.com/premium-vector/arrow-download-file-icon_24908-26952.jpg?ga=GA1.1.1596432489.1731156360&semt=ais_hybrid" },
  { link:"pdf-printer", title: "PDF Printer", icon: <PrintIcon fontSize="large" />, description: "Print documents as PDFs.", image: "https://img.freepik.com/premium-vector/arrow-download-file-icon_24908-26952.jpg?ga=GA1.1.1596432489.1731156360&semt=ais_hybrid" },
  { link:"pdf-reader", title: "PDF Reader", icon: <PrintIcon fontSize="large" />, description: "Read and view PDF files.", image: "https://img.freepik.com/premium-vector/arrow-download-file-icon_24908-26952.jpg?ga=GA1.1.1596432489.1731156360&semt=ais_hybrid" },
  { link:"create-pdf-invoice", title: "Create Invoice", icon: <InvoiceIcon fontSize="large" />, description: "Generate invoices in PDF format.", image: "https://img.freepik.com/premium-vector/arrow-download-file-icon_24908-26952.jpg?ga=GA1.1.1596432489.1731156360&semt=ais_hybrid" },
  { link:"remove-pdf-metadata", title: "Remove PDF Metadata", icon: <MetadataIcon fontSize="large" />, description: "Remove embedded metadata from PDFs.", image: "https://img.freepik.com/premium-vector/arrow-download-file-icon_24908-26952.jpg?ga=GA1.1.1596432489.1731156360&semt=ais_hybrid" },
  { link:"edit-pdf-metadata", title: "Edit PDF Metadata", icon: <MetadataIcon fontSize="large" />, description: "Modify PDF metadata fields.", image: "https://img.freepik.com/premium-vector/arrow-download-file-icon_24908-26952.jpg?ga=GA1.1.1596432489.1731156360&semt=ais_hybrid" },
  { link:"flatten-pdf", title: "Flatten PDF", icon: <AutoFixHighIcon fontSize="large" />, description: "Flatten all elements into a single layer.", image: "https://img.freepik.com/premium-vector/arrow-download-file-icon_24908-26952.jpg?ga=GA1.1.1596432489.1731156360&semt=ais_hybrid" },
  { link:"crop-pdf", title: "Crop PDF", icon: <CropIcon fontSize="large" />, description: "Trim PDF pages to a desired size.", image: "https://img.freepik.com/premium-vector/arrow-download-file-icon_24908-26952.jpg?ga=GA1.1.1596432489.1731156360&semt=ais_hybrid" },
  { link:"change-pdf-page-size", title: "Change PDF Page Size", icon: <CropIcon fontSize="large" />, description: "Modify the page size of a PDF.", image: "https://img.freepik.com/premium-vector/arrow-download-file-icon_24908-26952.jpg?ga=GA1.1.1596432489.1731156360&semt=ais_hybrid" },
];

