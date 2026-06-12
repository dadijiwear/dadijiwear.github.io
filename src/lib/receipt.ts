import PDFDocument from "pdfkit";
import { formatPaymentStatus } from "@/lib/format";

const ACCENT = "#0f5f46";
const ACCENT_LIGHT = "#e6f1ec";
const MUTED = "#6b7280";
const BORDER = "#d1d5db";
const TEXT = "#111827";

function money(value: unknown) {
  return `Rs. ${Number(value).toFixed(2)}`;
}

function dateTime(value: Date | string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

export function generateReceiptPdf(order: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const left = doc.page.margins.left;
    const right = doc.page.width - doc.page.margins.right;
    const width = right - left;

    doc.fillColor(ACCENT).font("Helvetica-Bold").fontSize(22).text("Mom & Son", left, 50);
    doc.fillColor(MUTED).font("Helvetica").fontSize(9).text("Premium Kids Wear", left, 76);

    doc.fillColor(TEXT).font("Helvetica-Bold").fontSize(18).text("RECEIPT", left, 50, { width, align: "right" });
    doc.fillColor(MUTED).font("Helvetica").fontSize(9);
    doc.text(`Order #: ${order.orderNumber}`, left, 75, { width, align: "right" });
    doc.text(`Date: ${dateTime(order.createdAt)}`, left, 88, { width, align: "right" });

    let y = 115;
    doc.moveTo(left, y).lineTo(right, y).lineWidth(2).strokeColor(ACCENT).stroke();
    y += 20;

    const colWidth = (width - 20) / 2;

    doc.fillColor(TEXT).font("Helvetica-Bold").fontSize(10);
    doc.text("Billed To", left, y);
    doc.text("Order Details", left + colWidth + 20, y);
    y += 15;

    doc.font("Helvetica").fontSize(9).fillColor("#374151");
    const billed = [order.customerName, order.customerEmail, order.customerPhone];
    const details = [
      `Status: ${order.status}`,
      `Payment Method: ${order.paymentMethod || "—"}`,
      `Payment Status: ${formatPaymentStatus(order.paymentStatus)}`,
    ];

    const infoTop = y;
    billed.forEach((line, i) => doc.text(line, left, infoTop + i * 14, { width: colWidth }));
    details.forEach((line, i) => doc.text(line, left + colWidth + 20, infoTop + i * 14, { width: colWidth }));

    y = infoTop + Math.max(billed.length, details.length) * 14 + 12;

    doc.font("Helvetica-Bold").fontSize(10).fillColor(TEXT).text("Shipping Address", left, y);
    y += 15;
    doc.font("Helvetica").fontSize(9).fillColor("#374151").text(order.shippingAddress, left, y, { width });
    y = doc.y + 20;

    const cols = [
      { key: "product", label: "Product", x: left, width: 175, align: "left" as const },
      { key: "size", label: "Size", x: left + 175, width: 55, align: "left" as const },
      { key: "color", label: "Color", x: left + 230, width: 65, align: "left" as const },
      { key: "qty", label: "Qty", x: left + 295, width: 35, align: "right" as const },
      { key: "price", label: "Unit Price", x: left + 330, width: 70, align: "right" as const },
      { key: "total", label: "Total", x: left + 400, width: right - (left + 400), align: "right" as const },
    ];

    doc.rect(left, y, width, 22).fill(ACCENT_LIGHT);
    doc.fillColor(ACCENT).font("Helvetica-Bold").fontSize(9);
    cols.forEach((col) => {
      doc.text(col.label, col.x + 4, y + 6, { width: col.width - 8, align: col.align });
    });
    y += 22;

    doc.font("Helvetica").fontSize(9).fillColor("#374151");

    for (const item of order.items) {
      doc.text(item.productName, cols[0].x + 4, y + 5, { width: cols[0].width - 8 });
      doc.text(item.ageGroup, cols[1].x + 4, y + 5, { width: cols[1].width - 8 });
      doc.text(item.color, cols[2].x + 4, y + 5, { width: cols[2].width - 8 });
      doc.text(String(item.quantity), cols[3].x + 4, y + 5, { width: cols[3].width - 8, align: "right" });
      doc.text(money(item.unitPrice), cols[4].x + 4, y + 5, { width: cols[4].width - 8, align: "right" });
      doc.text(money(item.totalPrice), cols[5].x + 4, y + 5, { width: cols[5].width - 8, align: "right" });

      y += 20;
      doc.moveTo(left, y).lineTo(right, y).lineWidth(0.5).strokeColor(BORDER).stroke();
      y += 1;
    }

    y += 15;

    const subtotal = Number(order.subtotal);
    const discount = Number(order.discountAmount);
    const shipping = Number(order.shippingAmount);
    const total = Number(order.totalAmount);
    const refundAmount = Number(order.refundAmount || 0);

    const totalsWidth = 220;
    const totalsX = right - totalsWidth;
    const labelWidth = 130;
    const valueWidth = totalsWidth - labelWidth;

    const totalsRows: { label: string; value: string; bold?: boolean; color?: string; divider?: boolean }[] = [
      { label: "Subtotal", value: money(subtotal) },
    ];

    if (discount > 0) {
      totalsRows.push({
        label: order.couponCode ? `Discount (${order.couponCode})` : "Discount",
        value: `-${money(discount)}`,
        color: ACCENT,
      });
    }

    totalsRows.push({ label: "Shipping", value: shipping > 0 ? money(shipping) : "Free" });
    totalsRows.push({ label: "Total", value: money(total), bold: true, divider: true });

    if (refundAmount > 0) {
      totalsRows.push({ label: "Refund Issued", value: `-${money(refundAmount)}`, color: "#b91c1c" });
      totalsRows.push({ label: "Net Amount", value: money(total - refundAmount), bold: true, divider: true });
    }

    for (const row of totalsRows) {
      doc.font(row.bold ? "Helvetica-Bold" : "Helvetica").fontSize(10).fillColor(row.color || TEXT);
      doc.text(row.label, totalsX, y, { width: labelWidth });
      doc.text(row.value, totalsX + labelWidth, y, { width: valueWidth, align: "right" });
      y += 18;
      if (row.divider) {
        doc.moveTo(totalsX, y - 4).lineTo(right, y - 4).lineWidth(0.5).strokeColor(BORDER).stroke();
      }
    }

    if (refundAmount > 0) {
      y += 15;
      doc.font("Helvetica-Bold").fontSize(10).fillColor(TEXT).text("Refund Details", left, y);
      y += 15;
      doc.font("Helvetica").fontSize(9).fillColor("#374151");
      doc.text(`Refunded On: ${dateTime(order.refundedAt)}`, left, y);
      y += 14;
      doc.text(`Reference: ${order.razorpayRefundId || "Processed manually"}`, left, y);
      y += 14;
    }

    const footerY = doc.page.height - doc.page.margins.bottom - 30;
    doc.font("Helvetica").fontSize(8).fillColor(MUTED);
    doc.text("Thank you for shopping with Mom & Son. - momnson.co", left, footerY, { width, align: "center" });
    doc.text(`Generated on ${dateTime(new Date())}`, left, footerY + 12, { width, align: "center" });

    doc.end();
  });
}
