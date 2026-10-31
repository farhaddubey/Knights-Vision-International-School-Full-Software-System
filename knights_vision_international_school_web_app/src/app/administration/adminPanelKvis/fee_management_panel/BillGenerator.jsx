import { Button } from "@mui/material";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const BillGenerator = ({ order }) => {
  const generateBill = () => {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    // Constants for layout
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const maxWidth = pageWidth - 2 * margin;
    const lineHeight = 10;
    let yPosition = 20;

    // Header: TDIL Consultancy Services
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("TDIL Consultancy Services", margin, yPosition);
    yPosition += lineHeight;

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Legal Unit", margin, yPosition);
    yPosition += lineHeight;

    doc.setFontSize(10);
    doc.text("Website: www.tdilcs.com", margin, yPosition);
    yPosition += lineHeight * 2;

    // Customer and Order Details
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("GST Bill", margin, yPosition);
    yPosition += lineHeight;

    doc.setFont("helvetica", "normal");
    doc.text(`Order Number: ${order.orderNumber}`, margin, yPosition);
    yPosition += lineHeight;
    doc.text(`Customer Name: ${order.customer_name}`, margin, yPosition);
    yPosition += lineHeight;
    doc.text(`Phone: ${order.customer_phone}`, margin, yPosition);
    yPosition += lineHeight;
    doc.text(`Date: ${new Date(order.orderedAt).toLocaleDateString()}`, margin, yPosition);
    yPosition += lineHeight * 2;

    // GST Rate (Assuming 18% for legal services; adjust as needed)
    const gstRate = 0.18;

    // Table for Order Items
    const tableData = order.orderItems.map((item, index) => {
      const price = parseFloat(item.price);
      const quantity = 1; // Assuming one service instance per item
      const gstAmount = price * gstRate;
      const total = price + gstAmount;
      return [
        index + 1,
        item.service?.name || "Unnamed Service",
        `₹${price.toFixed(2)}`,
        quantity,
        `${(gstRate * 100).toFixed(0)}%`,
        `₹${gstAmount.toFixed(2)}`,
        `₹${total.toFixed(2)}`,
      ];
    });

    autoTable(doc, {
      startY: yPosition,
      head: [["#", "Service Name", "Price", "Qty", "GST", "GST Amount", "Total"]],
      body: tableData,
      theme: "grid",
      headStyles: { fillColor: [26, 35, 126], textColor: [255, 255, 255], fontSize: 10 },
      bodyStyles: { fontSize: 10 },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 60 },
        2: { cellWidth: 30 },
        3: { cellWidth: 20 },
        4: { cellWidth: 20 },
        5: { cellWidth: 30 },
        6: { cellWidth: 30 },
      },
      margin: { left: margin, right: margin },
      didDrawPage: (data) => {
        yPosition = data.cursor.y + lineHeight;
      },
    });

    // Total Amount
    const totalAmount = order.orderItems.reduce((sum, item) => {
      const price = parseFloat(item.price);
      const gstAmount = price * gstRate;
      return sum + price + gstAmount;
    }, 0);

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`Total Amount: ₹${totalAmount.toFixed(2)}`, margin, yPosition);

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin - 20, doc.internal.pageSize.getHeight() - 10);
    }

    // Save PDF
    doc.save(`order_bill_${order.orderNumber}.pdf`);
  };

  return (
    <Button
      variant="contained"
      color="success"
      onClick={generateBill}
      sx={{ mt: 2 }}
    >
      Generate Bill
    </Button>
  );
};

export default BillGenerator;