import QRCode from "qrcode";
import { jsPDF } from "jspdf";

const QR_OPTIONS = {
    errorCorrectionLevel: "M",
    margin: 2,
    width: 600,
};

async function generateQrDataUrl(itemCode) {
    if (!itemCode) {
        throw new Error("Item code is required.");
    }

    return QRCode.toDataURL(itemCode, QR_OPTIONS);
}

export async function generateInventoryQrPdf(items) {
    if (!items?.length) {
        throw new Error("No inventory items selected.");
    }

    const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
    });

    const pageWidth = 210;
    const pageHeight = 297;

    const marginX = 8;
    const marginY = 8;

    const columns = 4;
    const rows = 4;

    const gapX = 3;
    const gapY = 3;

    const cardWidth =
        (pageWidth - marginX * 2 - gapX * (columns - 1)) /
        columns;

    const cardHeight =
        (pageHeight - marginY * 2 - gapY * (rows - 1)) /
        rows;

    const qrSize = 30;

    for (let index = 0; index < items.length; index++) {
        if (index > 0 && index % (columns * rows) === 0) {
            doc.addPage();
        }

        const pageIndex = index % (columns * rows);

        const column = pageIndex % columns;
        const row = Math.floor(pageIndex / columns);

        const x =
            marginX +
            column * (cardWidth + gapX);

        const y =
            marginY +
            row * (cardHeight + gapY);

        const item = items[index];

        const qrDataUrl = await generateQrDataUrl(
            item.item_code
        );

        // Card border
        doc.rect(
            x,
            y,
            cardWidth,
            cardHeight
        );

        // QR code
        const qrX =
            x + (cardWidth - qrSize) / 2;

        const qrY = y + 5;

        doc.addImage(
            qrDataUrl,
            "PNG",
            qrX,
            qrY,
            qrSize,
            qrSize
        );

        // Item code
        doc.setFontSize(11);
        doc.setFont(undefined, "bold");

        doc.text(
            item.item_code,
            x + cardWidth / 2,
            y + 52,
            {
                align: "center",
            }
        );

        // Product name
        if (item.product_name) {
            doc.setFontSize(8);
            doc.setFont(undefined, "normal");

            doc.text(
                item.product_name,
                x + cardWidth / 2,
                y + 58,
                {
                    align: "center",
                    maxWidth: cardWidth - 10,
                }
            );
        }
    }

    const filename =
        items.length === 1
            ? `${items[0].item_code}-qr.pdf`
            : `inventory-qr-codes-${items.length}-items.pdf`;

    doc.save(filename);
}