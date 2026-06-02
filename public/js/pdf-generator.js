// PDF Generation Service using html2pdf
// Requires: <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>

class PDFGenerator {
    static generateInvoicePDF(invoice, downloadFile = true) {
        const invoiceHTML = PDFGenerator.getInvoiceHTML(invoice);
        return PDFGenerator.generatePDF(invoiceHTML, `${invoice.invoiceNumber}.pdf`, downloadFile);
    }
    
    static generateQuotationPDF(quotation, downloadFile = true) {
        const quotationHTML = PDFGenerator.getQuotationHTML(quotation);
        return PDFGenerator.generatePDF(quotationHTML, `${quotation.quotationNumber}.pdf`, downloadFile);
    }
    
    static generateItineraryPDF(itinerary, downloadFile = true) {
        const itineraryHTML = PDFGenerator.getItineraryHTML(itinerary);
        const fileName = `${itinerary.title.replace(/\s+/g, '_')}_itinerary.pdf`;
        return PDFGenerator.generatePDF(itineraryHTML, fileName, downloadFile);
    }
    
    static async generatePDF(htmlContent, fileName, download = true) {
        return new Promise((resolve, reject) => {
            try {
                const element = document.createElement('div');
                element.innerHTML = htmlContent;
                
                const options = {
                    margin: 10,
                    filename: fileName,
                    image: { type: 'png', quality: 0.98 },
                    html2canvas: { scale: 2, useCORS: true, logging: false },
                    jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
                };
                
                if (download) {
                    html2pdf().set(options).from(element).save();
                } else {
                    html2pdf().set(options).from(element).output('blob').then(blob => {
                        resolve(blob);
                    });
                }
                
                resolve({ success: true, message: 'PDF generated successfully' });
            } catch (error) {
                console.error('PDF generation error:', error);
                reject(error);
            }
        });
    }
    
    static getInvoiceHTML(invoice) {
        const products = getFromStorage(storageKeys.products) || [];
        const product = products.find(p => p.id === invoice.productId);
        
        return `
            <div style="font-family: Arial, sans-serif; padding: 40px; background: white;">
                <style>
                    body { margin: 0; padding: 0; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { padding: 10px; text-align: left; }
                    .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #3498db; padding-bottom: 20px; }
                    .logo { height: 80px; margin-bottom: 10px; }
                    .company-name { font-size: 24px; color: #2c3e50; font-weight: bold; }
                    .invoice-title { font-size: 28px; color: #3498db; margin: 10px 0; }
                    .invoice-number { color: #7f8c8d; font-size: 14px; }
                    .section-header { background-color: #34495e; color: white; font-weight: bold; }
                    .section-title { font-weight: bold; margin-top: 20px; margin-bottom: 10px; color: #2c3e50; }
                    .info-row { margin-bottom: 8px; }
                    .total-row { background-color: #f9f9f9; font-weight: bold; font-size: 16px; }
                    .footer { margin-top: 30px; text-align: center; color: #95a5a6; font-size: 12px; border-top: 1px solid #ecf0f1; padding-top: 20px; }
                </style>
                
                <div class="header">
                    <img src="public/logos/logo.png" alt="Logo" class="logo">
                    <div class="company-name">Prestige Bali</div>
                    <div class="invoice-title">INVOICE</div>
                    <div class="invoice-number">${invoice.invoiceNumber}</div>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px;">
                    <div>
                        <div class="section-title">Bill To:</div>
                        <div class="info-row"><strong>${invoice.clientName}</strong></div>
                        ${invoice.email ? `<div class="info-row">${invoice.email}</div>` : ''}
                    </div>
                    <div>
                        <div class="info-row"><strong>Invoice Date:</strong> ${formatDate(invoice.createdAt)}</div>
                        <div class="info-row"><strong>Due Date:</strong> ${formatDate(invoice.dueDate)}</div>
                        <div class="info-row"><strong>Payment Status:</strong> ${invoice.paymentStatus.toUpperCase()}</div>
                        <div class="info-row"><strong>Payment Method:</strong> ${invoice.paymentMethod}</div>
                    </div>
                </div>
                
                <table>
                    <thead>
                        <tr class="section-header">
                            <th>Description</th>
                            <th style="text-align: right;">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Invoice Amount</td>
                            <td style="text-align: right;">${formatCurrency(invoice.amount || 0)}</td>
                        </tr>
                        <tr class="total-row">
                            <td>TOTAL DUE</td>
                            <td style="text-align: right; color: #e74c3c;">${formatCurrency(invoice.amount || 0)}</td>
                        </tr>
                    </tbody>
                </table>
                
                ${invoice.notes ? `<div style="margin-top: 20px; padding: 15px; background: #f9f9f9; border-radius: 5px;"><strong>Notes:</strong> ${invoice.notes}</div>` : ''}
                
                <div class="footer">
                    <p>Thank you for your business!</p>
                    <p>Generated on ${formatDate(new Date())}</p>
                </div>
            </div>
        `;
    }
    
    static getQuotationHTML(quotation) {
        const products = getFromStorage(storageKeys.products) || [];
        const product = products.find(p => p.id === quotation.productId);
        const pricings = getFromStorage(storageKeys.pricing) || [];
        const pricing = pricings.find(p => p.id === quotation.pricingId);
        const totalPrice = pricing ? (pricing.pricePerPerson * quotation.persons * (1 - pricing.discount / 100)) : 0;
        
        return `
            <div style="font-family: Arial, sans-serif; padding: 40px; background: white;">
                <style>
                    body { margin: 0; padding: 0; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { padding: 10px; text-align: left; }
                    .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #3498db; padding-bottom: 20px; }
                    .logo { height: 80px; margin-bottom: 10px; }
                    .company-name { font-size: 24px; color: #2c3e50; font-weight: bold; }
                    .quotation-title { font-size: 28px; color: #3498db; margin: 10px 0; }
                    .quotation-number { color: #7f8c8d; font-size: 14px; }
                    .section-header { background-color: #34495e; color: white; font-weight: bold; }
                    .section-title { font-weight: bold; margin-top: 20px; margin-bottom: 10px; color: #2c3e50; }
                    .info-row { margin-bottom: 8px; }
                    .total-row { background-color: #f0f0f0; font-weight: bold; font-size: 16px; }
                    .footer { margin-top: 30px; text-align: center; color: #95a5a6; font-size: 12px; border-top: 1px solid #ecf0f1; padding-top: 20px; }
                </style>
                
                <div class="header">
                    <img src="public/logos/logo.png" alt="Logo" class="logo">
                    <div class="company-name">Prestige Bali</div>
                    <div class="quotation-title">QUOTATION</div>
                    <div class="quotation-number">${quotation.quotationNumber}</div>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px;">
                    <div>
                        <div class="section-title">Bill To:</div>
                        <div class="info-row"><strong>${quotation.clientName}</strong></div>
                        ${quotation.company ? `<div class="info-row">${quotation.company}</div>` : ''}
                        ${quotation.email ? `<div class="info-row">${quotation.email}</div>` : ''}
                        ${quotation.phone ? `<div class="info-row">${quotation.phone}</div>` : ''}
                    </div>
                    <div>
                        <div class="info-row"><strong>Quotation Date:</strong> ${formatDate(quotation.createdAt)}</div>
                        <div class="info-row"><strong>Valid Until:</strong> ${formatDate(quotation.validUntil)}</div>
                        <div class="info-row"><strong>Status:</strong> ${quotation.status.toUpperCase()}</div>
                    </div>
                </div>
                
                <table>
                    <thead>
                        <tr class="section-header">
                            <th>Description</th>
                            <th style="text-align: right;">Qty</th>
                            <th style="text-align: right;">Unit Price</th>
                            <th style="text-align: right;">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>${product?.name || 'Service'}</td>
                            <td style="text-align: right;">${quotation.persons}</td>
                            <td style="text-align: right;">${formatCurrency(pricing?.pricePerPerson || 0)}</td>
                            <td style="text-align: right;">${formatCurrency(totalPrice)}</td>
                        </tr>
                        ${pricing?.discount ? `<tr><td colspan="3" style="text-align: right;"><strong>Discount (${pricing.discount}%):</strong></td><td style="text-align: right; color: #27ae60;">-${formatCurrency(totalPrice * (pricing.discount / 100) / (1 - pricing.discount / 100))}</td></tr>` : ''}
                        <tr class="total-row">
                            <td colspan="3" style="text-align: right;"><strong>TOTAL</strong></td>
                            <td style="text-align: right; color: #3498db;">${formatCurrency(totalPrice)}</td>
                        </tr>
                    </tbody>
                </table>
                
                ${quotation.notes ? `<div style="margin-top: 20px; padding: 15px; background: #f9f9f9; border-radius: 5px;"><strong>Notes:</strong> ${quotation.notes}</div>` : ''}
                
                <div class="footer">
                    <p>Thank you for considering our services!</p>
                    <p>Generated on ${formatDate(new Date())}</p>
                </div>
            </div>
        `;
    }
    
    static getItineraryHTML(itinerary) {
        const products = getFromStorage(storageKeys.products) || [];
        const product = products.find(p => p.id === itinerary.productId);
        
        const daysHTML = itinerary.days.map(day => `
            <div style="margin-bottom: 20px; padding: 15px; background: #f9f9f9; border-left: 4px solid #3498db; border-radius: 0 5px 5px 0;">
                <h3 style="margin-top: 0; color: #3498db;">Day ${day.day}</h3>
                <p>${day.activity}</p>
            </div>
        `).join('');
        
        return `
            <div style="font-family: Arial, sans-serif; padding: 40px; background: white;">
                <style>
                    body { margin: 0; padding: 0; }
                    .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #3498db; padding-bottom: 20px; }
                    .logo { height: 80px; margin-bottom: 10px; }
                    .company-name { font-size: 24px; color: #2c3e50; font-weight: bold; }
                    .itinerary-title { font-size: 28px; color: #3498db; margin: 10px 0; }
                    .section-title { font-weight: bold; margin-top: 20px; margin-bottom: 10px; color: #2c3e50; font-size: 18px; }
                    .footer { margin-top: 30px; text-align: center; color: #95a5a6; font-size: 12px; border-top: 1px solid #ecf0f1; padding-top: 20px; }
                </style>
                
                <div class="header">
                    <img src="public/logos/logo.png" alt="Logo" class="logo">
                    <div class="company-name">Prestige Bali</div>
                    <div class="itinerary-title">ITINERARY</div>
                </div>
                
                <div style="background: #f9f9f9; padding: 20px; border-radius: 5px; margin-bottom: 30px;">
                    <h2 style="margin-top: 0; color: #2c3e50;">${itinerary.title}</h2>
                    <p><strong>Duration:</strong> ${itinerary.duration} days</p>
                    <p><strong>Tour Package:</strong> ${product?.name || 'N/A'}</p>
                    <p><strong>Description:</strong> ${itinerary.description}</p>
                </div>
                
                <div class="section-title">Daily Activities</div>
                ${daysHTML}
                
                <div class="footer">
                    <p>We look forward to welcoming you!</p>
                    <p>Generated on ${formatDate(new Date())}</p>
                </div>
            </div>
        `;
    }
}
