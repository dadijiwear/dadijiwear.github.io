import PDFDocument from "pdfkit";
import { formatPaymentStatus } from "@/lib/format";

export function generateReceiptPdf(order: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const formatAmount = (value: unknown) => `Rs. ${Number(value).toFixed(2)}`;
    const formatDate = (value: Date | string | null) =>
      value ? new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "—";

    doc.fontSize(20).text("Mom & Son", { align: "left" });
    doc.fontSize(10).fillColor("#555").text("Children's Clothing & Essentials");
    doc.moveDown(1);

    doc.fillColor("#000").fontSize(16).text("Order Receipt");
    doc.moveDown(0.5);

    doc.fontSize(10);
    doc.text(`Order Number: ${order.orderNumber}`);
    doc.text(`Order Date: ${formatDate(order.createdAt)}`);
    doc.text(`Order Status: ${order.status}`);
    doc.text(`Payment Method: ${order.paymentMethod || "—"}`);
    doc.text(`Payment Status: ${formatPaymentStatus(order.paymentStatus)}`);
    doc.moveDown(1);

    doc.fontSize(12).text("Billed To", { underline: true });
    doc.fontSize(10);
    doc.text(order.customerName);
    doc.text(order.customerEmail);
    doc.text(order.customerPhone);
    doc.moveDown(0.5);
    doc.text("Shipping Address:");
    doc.text(order.shippingAddress);
    doc.moveDown(1);

    doc.fontSize(12).text("Items", { underline: true });
    doc.moveDown(0.5);

    const col = { product: 50, size: 250, color: 320, qty: 400, price: 440, total: 500 };
    const tableTop = doc.y;

    doc.fontSize(10).font("Helvetica-Bold");
    doc.text("Product", col.product, tableTop);
    doc.text("Size", col.size, tableTop);
    doc.text("Color", col.color, tableTop);
    doc.text("Qty", col.qty, tableTop);
    doc.text("Price", col.price, tableTop);
    doc.text("Total", col.total, tableTop);

    doc.font("Helvetica");
    let y = tableTop + 18;
    doc.moveTo(50, y - 4).lineTo(560, y - 4).strokeColor("#cccccc").stroke();

    for (const item of order.items) {
      doc.text(item.productName, col.product, y, { width: 190 });
      doc.text(item.ageGroup, col.size, y);
      doc.text(item.color, col.color, y);
      doc.text(String(item.quantity), col.qty, y);
      doc.text(formatAmount(item.unitPrice), col.price, y);
      doc.text(formatAmount(item.totalPrice), col.total, y);
      y += 20;
    }

    doc.moveTo(50, y).lineTo(560, y).strokeColor("#cccccc").stroke();
    y += 15;

    doc.text(`Subtotal: ${formatAmount(order.subtotal)}`, 400, y, { align: "right", width: 160 });
    y += 15;

    if (Number(order.discountAmount) > 0) {
      const couponLabel = order.couponCode ? ` (${order.couponCode})` : "";
      doc.text(`Discount${couponLabel}: -${formatAmount(order.discountAmount)}`, 400, y, { align: "right", width: 160 });
      y += 15;
    }

    doc.text(`Shipping: ${formatAmount(order.shippingAmount)}`, 400, y, { align: "right", width: 160 });
    y += 15;

    doc.font("Helvetica-Bold").text(`Total: ${formatAmount(order.totalAmount)}`, 400, y, { align: "right", width: 160 });
    doc.font("Helvetica");

    const footerY = y + 50;
    doc.fontSize(9).fillColor("#777").text("Thank you for shopping with Mom & Son.", 50, footerY, { align: "center", width: 510 });

    doc.end();
  });
}
