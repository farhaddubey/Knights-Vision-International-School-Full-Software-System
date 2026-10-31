import CropIcon from "@mui/icons-material/Crop";
import ImportContactsIcon from "@mui/icons-material/ImportContacts";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import BookIcon from "@mui/icons-material/Book";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import LayersIcon from "@mui/icons-material/Layers";
import EditIcon from "@mui/icons-material/Edit";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import CompressIcon from "@mui/icons-material/Compress";
import LockIcon from "@mui/icons-material/Lock";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import RedoIcon from "@mui/icons-material/Redo";
import FormatColorFillIcon from "@mui/icons-material/FormatColorFill";

export const ebookOperations = [
  {
    link: "/convert-epub-to-pdf",
    title: "Convert EPUB to PDF",
    icon: <PictureAsPdfIcon fontSize="large" />,
    description: "Convert EPUB eBooks to PDF format for easy viewing and printing.",
    image: "https://img.freepik.com/free-photo/e-book-digital-magazine-collection-publishment-download-graphic_53876-132179.jpg?ga=GA1.1.1596432489.1731156360&semt=ais_hybrid",
  },
  {
    link: "/convert-pdf-to-epub",
    title: "Convert PDF to EPUB",
    icon: <ImportContactsIcon fontSize="large" />,
    description: "Convert PDF documents into EPUB for better eBook reading experience.",
    image: "https://img.freepik.com/premium-vector/download-book-e-book-marketing-content-marketing-ebook-download-laptop-illustration_100456-611.jpg?ga=GA1.1.1596432489.1731156360&semt=ais_hybrid",
  },
  {
    link: "/convert-mobi-to-epub",
    title: "Convert MOBI to EPUB",
    icon: <MenuBookIcon fontSize="large" />,
    description: "Convert Kindle MOBI files to EPUB format for wider compatibility.",
    image: "https://img.freepik.com/free-vector/e-learning-education-process-training-application-mobile-app-development-courses-mobile-apps-online-courses-become-mobile-developer-concept_335657-202.jpg?ga=GA1.1.1596432489.1731156360&semt=ais_hybrid",
  },
  {
    link: "/convert-epub-to-mobi",
    title: "Convert EPUB to MOBI",
    icon: <LibraryBooksIcon fontSize="large" />,
    description: "Convert EPUB eBooks to Kindle-friendly MOBI format.",
    image: "https://img.freepik.com/free-vector/online-library-isometric-composition-with-conceptual-images-opened-book-computer-windows-small-people-characters_1284-32385.jpg?ga=GA1.1.1596432489.1731156360&semt=ais_hybrid",
  },
  {
    link: "/convert-txt-to-ebook",
    title: "Convert TXT to eBook",
    icon: <BookIcon fontSize="large" />,
    description: "Turn plain text files into eBooks in EPUB, MOBI, or PDF format.",
    image: "https://img.freepik.com/premium-vector/ebook-design_24911-41583.jpg?ga=GA1.1.1596432489.1731156360",
  },
  {
    link: "/convert-docx-to-ebook",
    title: "Convert DOCX to eBook",
    icon: <FileCopyIcon fontSize="large" />,
    description: "Convert Microsoft Word documents to EPUB or MOBI eBook formats.",
    image: "https://img.freepik.com/free-vector/online-library-isometric-composition-with-conceptual-images-opened-book-computer-windows-small-people-characters_1284-32385.jpg?ga=GA1.1.1596432489.1731156360&semt=ais_hybrid",
  },
  {
    link: "/edit-ebook-metadata",
    title: "Edit eBook Metadata",
    icon: <EditIcon fontSize="large" />,
    description: "Modify eBook metadata such as title, author, and publisher details.",
    image: "https://img.freepik.com/free-vector/online-library-isometric-composition-with-conceptual-images-opened-book-computer-windows-small-people-characters_1284-32385.jpg?ga=GA1.1.1596432489.1731156360&semt=ais_hybrid",
  },
  {
    link: "/extract-text-from-ebook",
    title: "Extract Text from eBook",
    icon: <AutoFixHighIcon fontSize="large" />,
    description: "Extract readable text from EPUB, MOBI, and PDF eBooks.",
    image: "https://img.freepik.com/free-vector/online-library-isometric-composition-with-conceptual-images-opened-book-computer-windows-small-people-characters_1284-32385.jpg?ga=GA1.1.1596432489.1731156360&semt=ais_hybrid",
  },
  {
    link: "/merge-ebooks",
    title: "Merge eBooks",
    icon: <LayersIcon fontSize="large" />,
    description: "Combine multiple eBook files into a single document.",
    image: "https://img.freepik.com/free-vector/online-library-isometric-composition-with-conceptual-images-opened-book-computer-windows-small-people-characters_1284-32385.jpg?ga=GA1.1.1596432489.1731156360&semt=ais_hybrid",
  },
  {
    link: "/compare-ebooks",
    title: "Compare eBooks",
    icon: <CompareArrowsIcon fontSize="large" />,
    description: "Find differences between two eBooks and compare content side by side.",
    image: "https://img.freepik.com/free-vector/online-library-isometric-composition-with-conceptual-images-opened-book-computer-windows-small-people-characters_1284-32385.jpg?ga=GA1.1.1596432489.1731156360&semt=ais_hybrid",
  },
  {
    link: "/compress-ebook",
    title: "Compress eBook",
    icon: <CompressIcon fontSize="large" />,
    description: "Reduce eBook file size without losing quality.",
    image: "https://img.freepik.com/free-vector/online-library-isometric-composition-with-conceptual-images-opened-book-computer-windows-small-people-characters_1284-32385.jpg?ga=GA1.1.1596432489.1731156360&semt=ais_hybrid",
  },
  {
    link: "/protect-ebook",
    title: "Protect eBook",
    icon: <LockIcon fontSize="large" />,
    description: "Encrypt and password-protect eBooks to prevent unauthorized access.",
    image: "https://img.freepik.com/free-vector/online-library-isometric-composition-with-conceptual-images-opened-book-computer-windows-small-people-characters_1284-32385.jpg?ga=GA1.1.1596432489.1731156360&semt=ais_hybrid",
  },
  {
    link: "/remove-drm",
    title: "Remove DRM from eBooks",
    icon: <RemoveRedEyeIcon fontSize="large" />,
    description: "Remove DRM restrictions from purchased eBooks for personal use.",
    image: "https://img.freepik.com/free-vector/online-library-isometric-composition-with-conceptual-images-opened-book-computer-windows-small-people-characters_1284-32385.jpg?ga=GA1.1.1596432489.1731156360&semt=ais_hybrid",
  },
  {
    link: "/convert-ebook-to-audiobook",
    title: "Convert eBook to Audiobook",
    icon: <RedoIcon fontSize="large" />,
    description: "Turn eBooks into audiobooks using AI voice synthesis.",
    image: "https://img.freepik.com/free-vector/online-library-isometric-composition-with-conceptual-images-opened-book-computer-windows-small-people-characters_1284-32385.jpg?ga=GA1.1.1596432489.1731156360&semt=ais_hybrid",
  },
  {
    link: "/add-watermark-to-ebook",
    title: "Add Watermark to eBook",
    icon: <FormatColorFillIcon fontSize="large" />,
    description: "Insert custom watermarks in eBooks to protect your content.",
    image: "https://img.freepik.com/free-vector/online-library-isometric-composition-with-conceptual-images-opened-book-computer-windows-small-people-characters_1284-32385.jpg?ga=GA1.1.1596432489.1731156360&semt=ais_hybrid",
  },
];
