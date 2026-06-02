# Booking System

A comprehensive booking and tour management system with product catalog, pricing, itinerary building, quotations, and invoicing.

## Features

- **Products** - Manage tour packages and services
- **Pricing** - Dynamic pricing management
- **Itinerary Builder** - Create detailed tour itineraries
- **Quotations** - Generate professional quotes
- **Invoices** - Create and manage invoices
- **Calendar** - Integrated booking calendar
- **Document Branding** - Add logo to all documents (invoices, itineraries, quotations)
- **PDF Download** - Download invoices, quotations, and itineraries as PDF
- **Email Integration** - Send documents directly via email

## Tech Stack

- Frontend: HTML5, CSS3, JavaScript
- PDF Generation: html2pdf.js
- Email Service: EmailJS or Backend API
- Calendar: FullCalendar
- Data Storage: LocalStorage (can be replaced with backend)

## Project Structure

```
├── index.html
├── public/
│   ├── css/
│   │   ���── styles.css
│   │   ├── menu.css
│   │   └── print.css
│   ├── js/
│   │   ├── main.js
│   │   ├── products.js
│   │   ├── pricing.js
│   │   ├── calendar.js
│   │   ├── itinerary.js
│   │   ├── quotation.js
│   │   ├── invoice.js
│   │   ├── email-service.js
│   │   └── pdf-generator.js
│   └── logos/
│       └── logo.png
├── templates/
│   ├── invoice-template.html
│   ├── quotation-template.html
│   └── itinerary-template.html
├── server.js (optional backend)
└── README.md
```

## Setup Instructions

### 1. Email Configuration

The system uses **EmailJS** for sending emails. To set it up:

1. Go to [EmailJS](https://www.emailjs.com/)
2. Sign up for a free account
3. Create an email service (Gmail, Outlook, or custom SMTP)
4. Note your Service ID, Template ID, and Public Key
5. Update these in `public/js/email-service.js`

### 2. Local Setup

```bash
# Just open index.html in your browser
# No installation required for basic functionality
```

### 3. Backend Setup (Optional - for production)

See `server.js` for a Node.js/Express backend to handle email securely.

```bash
npm install
node server.js
```

## Usage

1. **Add Products** - Create tour packages with pricing
2. **Set Pricing Tiers** - Define pricing for different group sizes
3. **Manage Calendar** - View and create bookings
4. **Create Itineraries** - Plan day-by-day activities
5. **Generate Quotations** - Create client quotes
6. **Create Invoices** - Convert quotations to invoices
7. **Download/Email** - Export documents as PDF or send via email

## Features

### Document Generation
- Professional PDF export with company branding
- Automatic logo inclusion on all documents
- Print-optimized formatting

### Email Integration
- Send quotations directly to clients
- Send invoices with automatic reminders
- Send itineraries to tour groups
- Track email sending status

### Data Management
- LocalStorage for offline capability
- Export data to JSON
- Import backup data

## Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- IE11: Not supported

## Security Notes

- For production, use backend API for email sending
- Never expose API keys in frontend code
- Implement user authentication
- Add database for persistent storage

## Future Enhancements

- [ ] Database integration
- [ ] User authentication
- [ ] Multi-language support
- [ ] Advanced reporting
- [ ] Commission management
- [ ] Payment gateway integration
- [ ] SMS notifications
- [ ] Automated reminders

## Support

For issues or questions, please check the code comments or create an issue in the repository.

## License

MIT License - feel free to use for your business
