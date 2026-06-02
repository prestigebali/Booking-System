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
        return `
            <div style="font-family: Arial, sans-serif; padding: 40px; background: white;">
                <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #3498db; padding-bottom: 20px;">
                    <img src="public/logos/logo.png" alt="Logo" style="height: 80px; margin-bottom: 10px;">
                    <div style="font-size: 24px; color: #2c3e50; font-weight: bold;">Prestige Bali</div>
                    <div style="font-size: 28px; color: #3498db; margin: 10px 0;">INVOICE</div>
                    <div style="color: #7f8c8d; font-size: 14px;">${invoice.invoiceNumber}</div>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px;">
                    <div>
                        <div style="font-weight: bold; margin-bottom: 10px;">Bill To:</div>
                        <p style="margin: 5px 0;"><strong>${invoice.clientName}</strong></p>
                        ${invoice.email ? `<p style="margin: 5px 0;">${invoice.email}</p>` : ''}
                    </div>
                    <div>
                        <p style="margin: 5px 0;"><strong>Invoice Date:</strong> ${formatDate(invoice.createdAt)}</p>
                        <p style="margin: 5px 0;"><strong>Due Date:</strong> ${formatDate(invoice.dueDate)}</p>
                        <p style="margin: 5px 0;"><strong>Payment Status:</strong> ${invoice.paymentStatus.toUpperCase()}</p>
                        <p style="margin: 5px 0;"><strong>Payment Method:</strong> ${invoice.paymentMethod}</p>
                    </div>
                </div>
                
                <table style="width: 100%; margin: 30px 0; border-collapse: collapse;">
                    <thead>
                        <tr style="background-color: #34495e; color: white;">
                            <th style="padding: 12px; text-align: left;">Description</th>
                            <th style="padding: 12px; text-align: right;">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="padding: 12px; border-bottom: 1px solid #bdc3c7;">Invoice Amount</td>
                            <td style="padding: 12px; text-align: right; border-bottom: 1px solid #bdc3c7; font-weight: bold;">${formatCurrency(invoice.amount || 0)}</td>
                        </tr>
                        <tr style="background: #f9f9f9;">
                            <td style="padding: 12px; font-weight: bold;">TOTAL DUE</td>
                            <td style="padding: 12px; text-align: right; font-weight: bold; color: #3498db; font-size: 16px;">${formatCurrency(invoice.amount || 0)}</td>
                        </tr>
                    </tbody>
                </table>
                
                ${invoice.notes ? `<div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;"><strong>Notes:</strong> ${invoice.notes}</div>` : ''}
                
                <div style="text-align: center; margin-top: 30px; color: #95a5a6; font-size: 12px;">
                    <p>Thank you for your business!</p>
                    <p>Generated on ${formatDate(new Date())}</p>
                </div>
            </div>
        `;
    }
    
    static getQuotationHTML(quotation) {
        const products = getFromStorage(storageKeys.products) || [];
        const product = products.find(p => p.id === quotation.productId);
        
        return `
            <div style="font-family: Arial, sans-serif; padding: 40px; background: white;">
                <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #3498db; padding-bottom: 20px;">
                    <img src="public/logos/logo.png" alt="Logo" style="height: 80px; margin-bottom: 10px;">
                    <div style="font-size: 24px; color: #2c3e50; font-weight: bold;">Prestige Bali</div>
                    <div style="font-size: 28px; color: #3498db; margin: 10px 0;">QUOTATION</div>
                    <div style="color: #7f8c8d; font-size: 14px;">${quotation.quotationNumber}</div>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px;">
                    <div>
                        <div style="font-weight: bold; margin-bottom: 10px;">Bill To:</div>
                        <p style="margin: 5px 0;"><strong>${quotation.clientName}</strong></p>
                        ${quotation.company ? `<p style="margin: 5px 0;">${quotation.company}</p>` : ''}
                        ${quotation.email ? `<p style="margin: 5px 0;">${quotation.email}</p>` : ''}
                        ${quotation.phone ? `<p style="margin: 5px 0;">${quotation.phone}</p>` : ''}
                    </div>
                    <div>
                        <p style="margin: 5px 0;"><strong>Quotation Date:</strong> ${formatDate(quotation.createdAt)}</p>
                        <p style="margin: 5px 0;"><strong>Valid Until:</strong> ${formatDate(quotation.validUntil)}</p>
                        <p style="margin: 5px 0;"><strong>Status:</strong> ${quotation.status.toUpperCase()}</p>
                    </div>
                </div>
                
                <table style="width: 100%; margin: 20px 0;">
                    <thead style="background-color: #34495e; color: white;">
                        <tr>
                            <th style="padding: 10px; text-align: left;">Description</th>
                            <th style="padding: 10px; text-align: right;">Qty</th>
                            <th style="padding: 10px; text-align: right;">Unit Price</th>
                            <th style="padding: 10px; text-align: right;">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #bdc3c7;">${product?.name || 'Service'}</td>
                            <td style="padding: 10px; text-align: right; border-bottom: 1px solid #bdc3c7;">${quotation.persons}</td>
                            <td style="padding: 10px; text-align: right; border-bottom: 1px solid #bdc3c7;">${formatCurrency(product?.price || 0)}</td>
                            <td style="padding: 10px; text-align: right; border-bottom: 1px solid #bdc3c7;">${formatCurrency((product?.price || 0) * quotation.persons)}</td>
                        </tr>
                    </tbody>
                </table>
                
                ${quotation.notes ? `<p><strong>Notes:</strong> ${quotation.notes}</p>` : ''}
                
                <div style="text-align: center; margin-top: 30px; color: #95a5a6; font-size: 12px;">
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
                <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #3498db; padding: 30px 0; padding-bottom: 20px;">
                    <img src="public/logos/logo.png" alt="Logo" style="height: 80px; margin-bottom: 15px;">
                    <div style="font-size: 24px; color: #2c3e50; font-weight: bold;">Prestige Bali</div>
                    <h1 style="margin: 10px 0; color: #3498db;">${itinerary.title}</h1>
                    <p style="color: #3498db;">ITINERARY</p>
                </div>
                
                <div style="background: #f9f9f9; padding: 20px; border-radius: 5px; margin-bottom: 30px;">
                    <p><strong>Duration:</strong> ${itinerary.duration} days</p>
                    <p><strong>Tour Package:</strong> ${product?.name || 'N/A'}</p>
                    <p><strong>Description:</strong> ${itinerary.description}</p>
                </div>
                
                <h3 style="margin-top: 30px; margin-bottom: 20px; color: #2c3e50;">Daily Activities</h3>
                ${daysHTML}
                
                <div style="text-align: center; margin-top: 30px; color: #95a5a6; font-size: 12px; border-top: 1px solid #ecf0f1; padding-top: 20px;">
                    <p>We look forward to welcoming you!</p>
                    <p>Generated on ${formatDate(new Date())}</p>
                </div>
            </div>
        `;
    }
}
