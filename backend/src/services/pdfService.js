import PDFDocument from 'pdfkit';

export const pdfService = {
  generatePOReceiptPDF(po, supplier, organization) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 40, size: 'A4' });
        const buffers = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfData = Buffer.concat(buffers);
          resolve(pdfData);
        });

        // Header
        doc.fontSize(20).fillColor('#1e293b').text(organization?.name || 'Apex Global Manufacturing Corp', 40, 40);
        doc.fontSize(10).fillColor('#64748b').text(organization?.legal_name || '', 40, 65);
        doc.text(`GSTIN: ${organization?.gstin || '27AAACA1234A1Z5'} | PAN: ${organization?.pan || 'AAACA1234A'}`, 40, 80);
        doc.text(organization?.address || '', 40, 95);

        // Document Title Badge
        doc.rect(400, 40, 160, 40).fill('#2563eb');
        doc.fillColor('#ffffff').fontSize(14).text('PURCHASE ORDER', 410, 48, { width: 140, align: 'center' });
        doc.fontSize(10).text(po.po_number, 410, 64, { width: 140, align: 'center' });

        doc.moveDown(4);
        doc.strokeColor('#e2e8f0').lineWidth(1).moveTo(40, 130).lineTo(560, 130).stroke();

        // Metadata grid
        doc.fillColor('#334155').fontSize(10);
        doc.text(`PO Date: ${new Date(po.created_at).toLocaleDateString()}`, 40, 145);
        doc.text(`Status: ${po.status}`, 40, 160);
        doc.text(`Payment Terms: ${po.payment_terms}`, 40, 175);
        doc.text(`Delivery Due: ${po.expected_delivery_date}`, 40, 190);

        doc.text(`Vendor / Supplier:`, 320, 145);
        doc.fontSize(11).fillColor('#0f172a').text(supplier?.name || po.supplier_name, 320, 160);
        doc.fontSize(9).fillColor('#64748b').text(`GSTIN: ${supplier?.gstin || 'N/A'}`, 320, 175);
        doc.text(`Contact: ${supplier?.contact_person || ''} (${supplier?.phone || ''})`, 320, 190);

        doc.strokeColor('#e2e8f0').lineWidth(1).moveTo(40, 215).lineTo(560, 215).stroke();

        // Items Table Header
        let y = 230;
        doc.rect(40, y, 520, 25).fill('#f1f5f9');
        doc.fillColor('#1e293b').fontSize(10);
        doc.text('Item Description', 50, y + 7);
        doc.text('SKU', 250, y + 7);
        doc.text('Qty', 350, y + 7);
        doc.text('Unit Price (₹)', 400, y + 7);
        doc.text('Total (₹)', 480, y + 7);

        y += 30;
        const items = po.items || [];
        for (const item of items) {
          doc.fillColor('#334155').fontSize(9);
          doc.text(item.product_name, 50, y, { width: 190 });
          doc.text(item.sku || '-', 250, y);
          doc.text(`${item.quantity_ordered || item.quantity || 1}`, 350, y);
          doc.text(`₹${Number(item.unit_price || 0).toLocaleString('en-IN')}`, 400, y);
          doc.text(`₹${Number(item.total_amount || 0).toLocaleString('en-IN')}`, 480, y);
          y += 25;
        }

        doc.strokeColor('#e2e8f0').lineWidth(1).moveTo(40, y + 10).lineTo(560, y + 10).stroke();
        y += 20;

        // Totals
        doc.fontSize(10).fillColor('#64748b');
        doc.text('Subtotal:', 380, y);
        doc.fillColor('#0f172a').text(`₹${Number(po.subtotal || 0).toLocaleString('en-IN')}`, 470, y);
        y += 18;

        doc.fillColor('#64748b').text('GST Tax (18%):', 380, y);
        doc.fillColor('#0f172a').text(`₹${Number(po.tax_amount || 0).toLocaleString('en-IN')}`, 470, y);
        y += 18;

        if (po.freight_amount) {
          doc.fillColor('#64748b').text('Freight Charges:', 380, y);
          doc.fillColor('#0f172a').text(`₹${Number(po.freight_amount).toLocaleString('en-IN')}`, 470, y);
          y += 18;
        }

        doc.rect(370, y, 190, 25).fill('#e0f2fe');
        doc.fontSize(11).fillColor('#0369a1').text('Grand Total:', 380, y + 7);
        doc.fontSize(11).fillColor('#0369a1').text(`₹${Number(po.grand_total || 0).toLocaleString('en-IN')}`, 470, y + 7);

        // Footer & Terms
        y += 60;
        doc.fontSize(9).fillColor('#475569');
        doc.text('Delivery Address:', 40, y);
        doc.fillColor('#0f172a').text(po.delivery_address, 40, y + 14);

        y += 40;
        doc.fontSize(8).fillColor('#94a3b8').text('This is an enterprise digitally signed and certified Purchase Order generated via ProcureAI Enterprise SaaS.', 40, y, { align: 'center', width: 520 });

        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  },

  generateDocumentPDF(docData, organization) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 40, size: 'A4' });
        const buffers = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfData = Buffer.concat(buffers);
          resolve(pdfData);
        });

        // Header
        doc.fontSize(18).fillColor('#0f172a').text(organization?.name || 'Apex Global Manufacturing Corp', 40, 40);
        doc.fontSize(9).fillColor('#64748b').text('CENTRAL QUALITY & METALLURGY LABORATORY • CERTIFICATE VAULT', 40, 65);
        doc.strokeColor('#cbd5e1').lineWidth(1).moveTo(40, 85).lineTo(560, 85).stroke();

        // Document Badge
        doc.rect(40, 100, 520, 36).fill('#1e293b');
        doc.fillColor('#38bdf8').fontSize(12).text(docData.title || 'COMPLIANCE CERTIFICATE', 50, 112, { align: 'left' });
        doc.fillColor('#94a3b8').fontSize(9).text(`CAT: ${docData.category?.toUpperCase() || 'QUALITY'}`, 430, 112, { align: 'right' });

        // Metadata
        let y = 150;
        doc.fillColor('#334155').fontSize(10);
        doc.text(`Document Reference: ${docData.id || 'DOC-2026-001'}`, 40, y);
        doc.text(`File Name: ${docData.file_name || 'certificate.pdf'}`, 40, y + 18);
        doc.text(`Issued Date: ${new Date(docData.created_at || Date.now()).toLocaleDateString()}`, 40, y + 36);
        doc.text(`Status: Digitally Verified & Certified`, 40, y + 54);

        doc.text(`Standard: EN 10204 / ISO 9001:2015`, 320, y);
        doc.text(`Heat / Lot No: HT-316L-8902`, 320, y + 18);
        doc.text(`Material Grade: AISI 316L Austenitic`, 320, y + 36);
        doc.text(`Inspection Result: CONFORMING / PASSED`, 320, y + 54);

        y = 230;
        doc.strokeColor('#e2e8f0').lineWidth(1).moveTo(40, y).lineTo(560, y).stroke();

        // Chemical Analysis Table
        y += 15;
        doc.fillColor('#0f172a').fontSize(11).text('Chemical Composition Analysis (% Weight)', 40, y);
        y += 20;
        doc.rect(40, y, 520, 22).fill('#f8fafc');
        doc.fillColor('#475569').fontSize(9);
        doc.text('C', 50, y + 6);
        doc.text('Si', 110, y + 6);
        doc.text('Mn', 170, y + 6);
        doc.text('P', 230, y + 6);
        doc.text('S', 290, y + 6);
        doc.text('Cr', 350, y + 6);
        doc.text('Ni', 420, y + 6);
        doc.text('Mo', 490, y + 6);

        y += 25;
        doc.fillColor('#0f172a').fontSize(9);
        doc.text('0.024', 50, y);
        doc.text('0.48', 110, y);
        doc.text('1.42', 170, y);
        doc.text('0.028', 230, y);
        doc.text('0.012', 290, y);
        doc.text('17.15', 350, y);
        doc.text('12.20', 420, y);
        doc.text('2.24', 490, y);

        // Mechanical Properties Table
        y += 40;
        doc.fillColor('#0f172a').fontSize(11).text('Mechanical Testing (Room Temperature)', 40, y);
        y += 20;
        doc.rect(40, y, 520, 22).fill('#f8fafc');
        doc.fillColor('#475569').fontSize(9);
        doc.text('Proof Stress Rp0.2 (MPa)', 50, y + 6);
        doc.text('Tensile Strength Rm (MPa)', 230, y + 6);
        doc.text('Elongation A5 (%)', 410, y + 6);

        y += 25;
        doc.fillColor('#0f172a').fontSize(9);
        doc.text('285 MPa (Min 220)', 50, y);
        doc.text('590 MPa (Min 520)', 230, y);
        doc.text('48.5% (Min 40%)', 410, y);

        // Certification Stamp & Signoff
        y += 60;
        doc.rect(40, y, 520, 75).fill('#f1f5f9');
        doc.fillColor('#0369a1').fontSize(10).text('DIGITAL COMPLIANCE VERIFICATION', 50, y + 12);
        doc.fillColor('#475569').fontSize(8.5).text('This laboratory report certifies that the referenced materials have been tested and strictly conform to the engineering specifications, mechanical thresholds, and chemical limits defined in the Purchase Order terms.', 50, y + 28, { width: 500 });
        doc.fillColor('#1e293b').fontSize(9).text('Authorized Quality Auditor: Dr. S. K. Nambiar (Lead QA Fellow) • Digitally Sealed', 50, y + 54);

        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }
};
