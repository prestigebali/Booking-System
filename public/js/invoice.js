// Updated Invoice Management with Email and PDF Support

function openInvoiceForm() {
    const quotations = getFromStorage(storageKeys.quotations);
    const approvedQuotations = quotations.filter(q => q.status === 'approved');
    const quotationOptions = approvedQuotations.map(q => `<option value="${q.id}">${q.quotationNumber} - ${q.clientName}</option>`).join('');
    
    const form = `
        <div class="modal" id="invoiceModal">
            <div class="modal-content">
                <span class="close" onclick="closeModal('invoiceModal')">&times;</span>
                <h2>Create Invoice</h2>
                <form onsubmit="saveInvoice(event)">
                    <div class="form-group">
                        <label>Invoice Type *</label>
                        <select name="type" required>
                            <option value="quotation">From Quotation</option>
                            <option value="manual">Manual Entry</option>
                        </select>
                    </div>
                    <div id="quotationSection" class="form-group">
                        <label>Select Quotation *</label>
                        <select name="quotationId" id="quotationSelect">
                            <option value="">Select approved quotation</option>
                            ${quotationOptions}
                        </select>
                    </div>
                    <div id="manualSection" style="display: none;">
                        <div class="form-group">
                            <label>Client Name *</label>
                            <input type="text" name="manualClientName">
                        </div>
                        <div class="form-group">
                            <label>Client Email</label>
                            <input type="email" name="manualClientEmail">
                        </div>
                        <div class="form-group">
                            <label>Amount *</label>
                            <input type="number" name="manualAmount" step="0.01">
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Payment Method *</label>
                        <select name="paymentMethod" required>
                            <option value="cash">Cash</option>
                            <option value="bank_transfer">Bank Transfer</option>
                            <option value="credit_card">Credit Card</option>
                            <option value="check">Check</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Payment Status *</label>
                        <select name="paymentStatus" required>
                            <option value="pending">Pending</option>
                            <option value="paid">Paid</option>
                            <option value="partial">Partial</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Due Date *</label>
                        <input type="date" name="dueDate" required>
                    </div>
                    <div class="form-group">
                        <label>Notes</label>
                        <textarea name="notes"></textarea>
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="btn-primary">Create Invoice</button>
                        <button type="button" class="btn-secondary" onclick="closeModal('invoiceModal')">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    const existingModal = document.getElementById('invoiceModal');
    if (existingModal) existingModal.remove();
    
    document.body.insertAdjacentHTML('beforeend', form);
    openModal('invoiceModal');
    
    // Set due date to 30 days from now
    const dueDateInput = document.querySelector('input[name="dueDate"]');
    if (dueDateInput) {
        const date = new Date();
        date.setDate(date.getDate() + 30);
        dueDateInput.value = date.toISOString().split('T')[0];
    }
    
    // Handle type change
    const typeSelect = document.querySelector('select[name="type"]');
    if (typeSelect) {
        typeSelect.addEventListener('change', function() {
            const quotationSection = document.getElementById('quotationSection');
            const manualSection = document.getElementById('manualSection');
            if (this.value === 'quotation') {
                quotationSection.style.display = 'block';
                manualSection.style.display = 'none';
            } else {
                quotationSection.style.display = 'none';
                manualSection.style.display = 'block';
            }
        });
    }
}

function saveInvoice(event) {
    event.preventDefault();
    
    const form = event.target;
    const type = form.type.value;
    let invoice = {
        id: generateId(),
        invoiceNumber: `INV-${Date.now()}`,
        type: type,
        paymentMethod: form.paymentMethod.value,
        paymentStatus: form.paymentStatus.value,
        dueDate: form.dueDate.value,
        notes: form.notes.value,
        createdAt: new Date().toISOString()
    };
    
    if (type === 'quotation') {
        const quotations = getFromStorage(storageKeys.quotations);
        const quotation = quotations.find(q => q.id === form.quotationId.value);
        if (quotation) {
            invoice = {
                ...invoice,
                quotationId: quotation.id,
                clientName: quotation.clientName,
                email: quotation.email,
                amount: quotation.persons * (quotation.pricing?.pricePerPerson || 0)
            };
        }
    } else {
        invoice = {
            ...invoice,
            clientName: form.manualClientName.value,
            email: form.manualClientEmail.value,
            amount: parseFloat(form.manualAmount.value)
        };
    }
    
    const invoices = getFromStorage(storageKeys.invoices);
    invoices.push(invoice);
    saveToStorage(storageKeys.invoices, invoices);
    
    closeModal('invoiceModal');
    loadInvoices();
    showNotification('Invoice created successfully!');
}

function loadInvoices() {
    const invoices = getFromStorage(storageKeys.invoices);
    const container = document.getElementById('invoiceList');
    
    if (invoices.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 40px; color: #95a5a6;">No invoices yet. Create your first invoice!</p>';
        return;
    }
    
    container.innerHTML = invoices.map(invoice => {
        const statusColor = invoice.paymentStatus === 'paid' ? '#27ae60' : invoice.paymentStatus === 'partial' ? '#f39c12' : '#e74c3c';
        
        return `
            <div class="invoice-card">
                <h3>${invoice.invoiceNumber}</h3>
                <p><strong>Client:</strong> ${invoice.clientName}</p>
                <p><strong>Amount:</strong> ${formatCurrency(invoice.amount || 0)}</p>
                <p><strong>Payment Status:</strong> <span style="color: ${statusColor}; font-weight: bold;">${invoice.paymentStatus.toUpperCase()}</span></p>
                <p><strong>Due Date:</strong> ${formatDate(invoice.dueDate)}</p>
                <div style="display: flex; gap: 10px; margin-top: 15px; flex-wrap: wrap;">
                    <button class="btn-primary" style="flex: 1; min-width: 100px;" onclick="viewInvoice('${invoice.id}')">View</button>
                    <button class="btn-primary" style="flex: 1; min-width: 100px;" onclick="downloadInvoicePDF('${invoice.id}')">📥 PDF</button>
                    <button class="btn-primary" style="flex: 1; min-width: 100px;" onclick="emailInvoice('${invoice.id}')">📧 Email</button>
                    <button class="btn-secondary" style="flex: 1; min-width: 100px;" onclick="deleteInvoice('${invoice.id}')">Delete</button>
                </div>
            </div>
        `;
    }).join('');
}

function viewInvoice(invoiceId) {
    const invoices = getFromStorage(storageKeys.invoices);
    const invoice = invoices.find(i => i.id === invoiceId);
    
    if (!invoice) return;
    
    const statusColor = invoice.paymentStatus === 'paid' ? '#27ae60' : invoice.paymentStatus === 'partial' ? '#f39c12' : '#e74c3c';
    
    const modal = `
        <div class="modal" id="viewInvoiceModal">
            <div class="modal-content" style="max-height: 90vh; overflow-y: auto;">
                <span class="close" onclick="closeModal('viewInvoiceModal')">&times;</span>
                <div id="invoicePDFContent" style="border: 1px solid #bdc3c7; padding: 30px; border-radius: 8px; background: white;">
                    <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #3498db; padding-bottom: 20px;">
                        <img src="public/logos/logo.png" alt="Logo" style="height: 60px; margin-bottom: 15px;">
                        <h1 style="margin: 10px 0; color: #2c3e50;">INVOICE</h1>
                        <p style="font-size: 18px; color: #3498db; margin: 5px 0;">${invoice.invoiceNumber}</p>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px;">
                        <div>
                            <h4 style="margin-bottom: 10px;">Bill To:</h4>
                            <p style="margin: 5px 0;"><strong>${invoice.clientName}</strong></p>
                            ${invoice.email ? `<p style="margin: 5px 0;">${invoice.email}</p>` : ''}
                        </div>
                        <div>
                            <p style="margin: 5px 0;"><strong>Invoice Date:</strong> ${formatDate(invoice.createdAt)}</p>
                            <p style="margin: 5px 0;"><strong>Due Date:</strong> ${formatDate(invoice.dueDate)}</p>
                            <p style="margin: 5px 0;"><strong>Payment Status:</strong> <span style="color: ${statusColor}; font-weight: bold;">${invoice.paymentStatus.toUpperCase()}</span></p>
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
                                <td style="padding: 12px; font-weight: bold;">Total Due</td>
                                <td style="padding: 12px; text-align: right; font-weight: bold; color: #3498db; font-size: 16px;">${formatCurrency(invoice.amount || 0)}</td>
                            </tr>
                        </tbody>
                    </table>
                    
                    ${invoice.notes ? `<div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;"><strong>Notes:</strong> ${invoice.notes}</div>` : ''}
                    
                    <div style="text-align: center; margin-top: 30px; color: #95a5a6; font-size: 12px;">
                        <p>Thank you for your business!</p>
                    </div>
                </div>
                
                <div style="display: flex; gap: 10px; margin-top: 20px; flex-wrap: wrap;">
                    <button class="btn-primary" onclick="downloadInvoicePDF('${invoice.id}')">📥 Download PDF</button>
                    <button class="btn-primary" onclick="emailInvoice('${invoice.id}')">📧 Send Email</button>
                    <button class="btn-secondary" onclick="updateInvoiceStatus('${invoice.id}', 'paid')">Mark as Paid</button>
                    <button class="btn-secondary" onclick="closeModal('viewInvoiceModal')">Close</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modal);
    openModal('viewInvoiceModal');
}

function downloadInvoicePDF(invoiceId) {
    try {
        const invoices = getFromStorage(storageKeys.invoices);
        const invoice = invoices.find(i => i.id === invoiceId);
        
        if (!invoice) {
            showNotification('Invoice not found', 'error');
            return;
        }
        
        if (typeof PDFGenerator === 'undefined') {
            showNotification('PDF library not loaded. Please refresh the page.', 'error');
            return;
        }
        
        PDFGenerator.generateInvoicePDF(invoice, true);
        showNotification('Invoice PDF downloaded successfully!');
    } catch (error) {
        console.error('Download error:', error);
        showNotification('Failed to generate PDF: ' + error.message, 'error');
    }
}

function emailInvoice(invoiceId) {
    try {
        const invoices = getFromStorage(storageKeys.invoices);
        const invoice = invoices.find(i => i.id === invoiceId);
        
        if (!invoice) {
            showNotification('Invoice not found', 'error');
            return;
        }
        
        if (!invoice.email) {
            showNotification('Client email not available', 'error');
            return;
        }
        
        if (typeof emailService === 'undefined') {
            showNotification('Email service not initialized', 'error');
            return;
        }
        
        const confirmEmail = confirm(`Send invoice to ${invoice.email}?`);
        if (!confirmEmail) return;
        
        showNotification('Sending email...');
        
        emailService.sendInvoice(invoice, invoice.email)
            .then(result => {
                showNotification('Invoice sent successfully to ' + invoice.email);
            })
            .catch(error => {
                console.error('Email error:', error);
                showNotification('Failed to send email: ' + error.message, 'error');
            });
    } catch (error) {
        console.error('Email error:', error);
        showNotification('Error sending email: ' + error.message, 'error');
    }
}

function updateInvoiceStatus(invoiceId, status) {
    const invoices = getFromStorage(storageKeys.invoices);
    const invoiceIndex = invoices.findIndex(i => i.id === invoiceId);
    
    if (invoiceIndex !== -1) {
        invoices[invoiceIndex].paymentStatus = status;
        saveToStorage(storageKeys.invoices, invoices);
        closeModal('viewInvoiceModal');
        loadInvoices();
        showNotification(`Invoice marked as ${status}!`);
    }
}

function deleteInvoice(invoiceId) {
    if (confirm('Are you sure you want to delete this invoice?')) {
        let invoices = getFromStorage(storageKeys.invoices);
        invoices = invoices.filter(i => i.id !== invoiceId);
        saveToStorage(storageKeys.invoices, invoices);
        loadInvoices();
        showNotification('Invoice deleted successfully!');
    }
}
