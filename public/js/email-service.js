// Email Service Integration
// Supports both EmailJS (frontend) and Backend API

class EmailService {
    constructor() {
        // EmailJS Configuration - Get from https://www.emailjs.com/
        // Option 1: Using EmailJS (Frontend - Development)
        this.emailJsServiceId = 'YOUR_SERVICE_ID'; // Replace with your Service ID
        this.emailJsTemplateId = 'YOUR_TEMPLATE_ID'; // Replace with your Template ID
        this.emailJsPublicKey = 'YOUR_PUBLIC_KEY'; // Replace with your Public Key
        
        // Option 2: Using Backend API (Production)
        this.backendUrl = 'http://localhost:5000';
        this.useBackend = false; // Set to true for production
        
        this.initializeEmailJS();
    }
    
    initializeEmailJS() {
        // Initialize EmailJS - only if not using backend
        if (!this.useBackend && typeof emailjs !== 'undefined') {
            emailjs.init(this.emailJsPublicKey);
        }
    }
    
    async sendEmailWithBackend(params) {
        try {
            const response = await fetch(`${this.backendUrl}/api/send-email`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(params)
            });
            
            if (!response.ok) {
                throw new Error('Backend email service failed');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Backend email error:', error);
            throw error;
        }
    }
    
    async sendEmailWithEmailJS(params) {
        try {
            // EmailJS template parameters
            const templateParams = {
                service_id: this.emailJsServiceId,
                template_id: this.emailJsTemplateId,
                user_id: this.emailJsPublicKey,
                template_params: {
                    to_email: params.to,
                    subject: params.subject,
                    message: params.htmlContent,
                    from_name: params.fromName || 'Booking System'
                }
            };
            
            const response = await emailjs.send(
                this.emailJsServiceId,
                this.emailJsTemplateId,
                templateParams
            );
            
            return { success: true, message: 'Email sent successfully', response: response };
        } catch (error) {
            console.error('EmailJS error:', error);
            throw error;
        }
    }
    
    async sendInvoice(invoice, clientEmail) {
        try {
            if (!clientEmail) {
                throw new Error('Client email is required');
            }
            
            // Generate PDF
            const pdfBase64 = await this.generateInvoicePDF(invoice);
            
            // Prepare email content
            const emailParams = {
                to: clientEmail,
                subject: `Invoice ${invoice.invoiceNumber}`,
                htmlContent: this.getInvoiceEmailTemplate(invoice),
                pdfBase64: pdfBase64,
                fileName: `${invoice.invoiceNumber}.pdf`,
                fromName: 'Prestige Bali'
            };
            
            if (this.useBackend) {
                return await this.sendEmailWithBackend(emailParams);
            } else {
                return await this.sendEmailWithEmailJS(emailParams);
            }
        } catch (error) {
            console.error('Send invoice error:', error);
            throw error;
        }
    }
    
    async sendQuotation(quotation, clientEmail) {
        try {
            if (!clientEmail) {
                throw new Error('Client email is required');
            }
            
            // Generate PDF
            const pdfBase64 = await this.generateQuotationPDF(quotation);
            
            // Prepare email content
            const emailParams = {
                to: clientEmail,
                subject: `Quotation ${quotation.quotationNumber}`,
                htmlContent: this.getQuotationEmailTemplate(quotation),
                pdfBase64: pdfBase64,
                fileName: `${quotation.quotationNumber}.pdf`,
                fromName: 'Prestige Bali'
            };
            
            if (this.useBackend) {
                return await this.sendEmailWithBackend(emailParams);
            } else {
                return await this.sendEmailWithEmailJS(emailParams);
            }
        } catch (error) {
            console.error('Send quotation error:', error);
            throw error;
        }
    }
    
    async sendItinerary(itinerary, clientEmail) {
        try {
            if (!clientEmail) {
                throw new Error('Client email is required');
            }
            
            // Generate PDF
            const pdfBase64 = await this.generateItineraryPDF(itinerary);
            
            // Prepare email content
            const emailParams = {
                to: clientEmail,
                subject: `Itinerary: ${itinerary.title}`,
                htmlContent: this.getItineraryEmailTemplate(itinerary),
                pdfBase64: pdfBase64,
                fileName: `${itinerary.title.replace(/\s+/g, '_')}_itinerary.pdf`,
                fromName: 'Prestige Bali'
            };
            
            if (this.useBackend) {
                return await this.sendEmailWithBackend(emailParams);
            } else {
                return await this.sendEmailWithEmailJS(emailParams);
            }
        } catch (error) {
            console.error('Send itinerary error:', error);
            throw error;
        }
    }
    
    // Email Templates
    getInvoiceEmailTemplate(invoice) {
        return `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="text-align: center; padding: 20px; border-bottom: 2px solid #3498db;">
                    <img src="cid:logo" alt="Logo" style="height: 60px; margin-bottom: 10px;">
                    <h1 style="color: #2c3e50; margin: 10px 0;">Invoice</h1>
                </div>
                <div style="padding: 20px;">
                    <p>Dear <strong>${invoice.clientName}</strong>,</p>
                    <p>Thank you for your business! Please find your invoice attached.</p>
                    <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <p><strong>Invoice Number:</strong> ${invoice.invoiceNumber}</p>
                        <p><strong>Invoice Date:</strong> ${formatDate(invoice.createdAt)}</p>
                        <p><strong>Due Date:</strong> ${formatDate(invoice.dueDate)}</p>
                        <p><strong>Amount Due:</strong> <span style="color: #e74c3c; font-size: 18px; font-weight: bold;">${formatCurrency(invoice.amount || 0)}</span></p>
                    </div>
                    <p><strong>Payment Method:</strong> ${invoice.paymentMethod}</p>
                    ${invoice.notes ? `<p><strong>Notes:</strong> ${invoice.notes}</p>` : ''}
                    <p style="margin-top: 30px; color: #95a5a6; font-size: 12px;">
                        This is an automated message. Please do not reply to this email.
                    </p>
                </div>
            </div>
        `;
    }
    
    getQuotationEmailTemplate(quotation) {
        return `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="text-align: center; padding: 20px; border-bottom: 2px solid #3498db;">
                    <img src="cid:logo" alt="Logo" style="height: 60px; margin-bottom: 10px;">
                    <h1 style="color: #2c3e50; margin: 10px 0;">Quotation</h1>
                </div>
                <div style="padding: 20px;">
                    <p>Dear <strong>${quotation.clientName}</strong>,</p>
                    <p>Thank you for your interest! Please find your quotation attached.</p>
                    <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <p><strong>Quotation Number:</strong> ${quotation.quotationNumber}</p>
                        <p><strong>Date:</strong> ${formatDate(quotation.createdAt)}</p>
                        <p><strong>Valid Until:</strong> ${formatDate(quotation.validUntil)}</p>
                        <p><strong>For ${quotation.persons} person(s)</strong></p>
                    </div>
                    <p>${quotation.notes || 'Please review the attached quotation and let us know if you have any questions.'}</p>
                    <p style="margin-top: 30px; color: #95a5a6; font-size: 12px;">
                        This is an automated message. Please do not reply to this email.
                    </p>
                </div>
            </div>
        `;
    }
    
    getItineraryEmailTemplate(itinerary) {
        return `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="text-align: center; padding: 20px; border-bottom: 2px solid #3498db;">
                    <img src="cid:logo" alt="Logo" style="height: 60px; margin-bottom: 10px;">
                    <h1 style="color: #2c3e50; margin: 10px 0;">Your Itinerary</h1>
                </div>
                <div style="padding: 20px;">
                    <p>Dear Guest,</p>
                    <p>We're excited to welcome you! Please find your detailed itinerary attached.</p>
                    <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <h2 style="margin-top: 0;">${itinerary.title}</h2>
                        <p><strong>Duration:</strong> ${itinerary.duration} days</p>
                        <p><strong>Description:</strong> ${itinerary.description}</p>
                    </div>
                    <p>If you have any questions about your itinerary, please don't hesitate to contact us.</p>
                    <p style="margin-top: 30px; color: #95a5a6; font-size: 12px;">
                        This is an automated message. Please do not reply to this email.
                    </p>
                </div>
            </div>
        `;
    }
    
    // PDF Generation Helpers (will use html2pdf)
    async generateInvoicePDF(invoice) {
        // This will be called from invoice.js using html2pdf
        return new Promise((resolve, reject) => {
            const element = document.getElementById('invoicePDFContent');
            if (!element) {
                reject(new Error('Invoice element not found'));
                return;
            }
            
            html2pdf().set({
                margin: 10,
                filename: `${invoice.invoiceNumber}.pdf`,
                image: { type: 'png', quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
            }).from(element).toImg().then(() => {
                resolve(element.innerHTML);
            }).catch(reject);
        });
    }
    
    async generateQuotationPDF(quotation) {
        return new Promise((resolve, reject) => {
            const element = document.getElementById('quotationPDFContent');
            if (!element) {
                reject(new Error('Quotation element not found'));
                return;
            }
            
            html2pdf().set({
                margin: 10,
                filename: `${quotation.quotationNumber}.pdf`,
                image: { type: 'png', quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
            }).from(element).toImg().then(() => {
                resolve(element.innerHTML);
            }).catch(reject);
        });
    }
    
    async generateItineraryPDF(itinerary) {
        return new Promise((resolve, reject) => {
            const element = document.getElementById('itineraryPDFContent');
            if (!element) {
                reject(new Error('Itinerary element not found'));
                return;
            }
            
            html2pdf().set({
                margin: 10,
                filename: `${itinerary.title.replace(/\s+/g, '_')}_itinerary.pdf`,
                image: { type: 'png', quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
            }).from(element).toImg().then(() => {
                resolve(element.innerHTML);
            }).catch(reject);
        });
    }
}

// Initialize Email Service
const emailService = new EmailService();
