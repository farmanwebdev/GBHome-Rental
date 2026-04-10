const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify connection
transporter.verify((error, success) => {
  if (error) {
    console.log('❌ Email service not configured:', error.message);
  } else {
    console.log('✅ Email service ready');
  }
});

// Send email function
const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: `"GBRentals" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('📧 Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email send failed:', error.message);
    return { success: false, error: error.message };
  }
};

// Booking notification templates
const sendBookingNotification = async (booking, property, buyer, owner) => {
  const ownerSubject = `New Property Booking: ${property.title}`;
  const ownerHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #131849;">New Booking Application Received</h2>
      <p>Dear ${owner.name},</p>
      <p>You have received a new booking application for your property.</p>

      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #131849;">Property Details</h3>
        <p><strong>Property:</strong> ${property.title}</p>
        <p><strong>Location:</strong> ${property.location.city}, ${property.location.address}</p>
        <p><strong>Price:</strong> PKR ${property.price.toLocaleString()}</p>
      </div>

      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #131849;">Applicant Details</h3>
        <p><strong>Name:</strong> ${buyer.name}</p>
        <p><strong>Email:</strong> ${buyer.email}</p>
        <p><strong>Phone:</strong> ${buyer.phone || 'Not provided'}</p>
        <p><strong>CNIC:</strong> ${buyer.cnic}</p>
        <p><strong>Booking Type:</strong> ${booking.bookingType === 'rent' ? 'Rental' : 'Purchase'}</p>
        <p><strong>Agreed Price:</strong> PKR ${booking.agreedPrice.toLocaleString()}</p>
        <p><strong>Start Date:</strong> ${new Date(booking.startDate).toLocaleDateString('en-PK')}</p>
        ${booking.endDate ? `<p><strong>End Date:</strong> ${new Date(booking.endDate).toLocaleDateString('en-PK')}</p>` : ''}
        ${booking.buyerNote ? `<p><strong>Applicant Note:</strong> ${booking.buyerNote}</p>` : ''}
      </div>

      <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0;"><strong>📋 Next Steps:</strong></p>
        <ul style="margin: 10px 0;">
          <li>Review the applicant's CNIC documents</li>
          <li>Verify the applicant's identity</li>
          <li>Approve or reject the application within 1-3 business days</li>
          <li>Contact the applicant if you need additional information</li>
        </ul>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/dashboard/owner/bookings"
           style="background: #131849; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          View Booking Details
        </a>
      </div>

      <p style="color: #666; font-size: 14px;">
        This is an automated notification from GBRentals. Please do not reply to this email.
      </p>
    </div>
  `;

  // Send to property owner
  await sendEmail(owner.email, ownerSubject, ownerHtml);

  // Send to all admins
  const Admin = require('../models/User');
  const admins = await Admin.find({ role: 'admin', isActive: true });
  for (const admin of admins) {
    const adminSubject = `New Booking Alert: ${property.title}`;
    const adminHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #131849;">New Booking Application Submitted</h2>
        <p>Dear Admin,</p>
        <p>A new booking application has been submitted on the platform.</p>

        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #131849;">Property Details</h3>
          <p><strong>Property:</strong> ${property.title}</p>
          <p><strong>Owner:</strong> ${owner.name} (${owner.email})</p>
          <p><strong>Location:</strong> ${property.location.city}, ${property.location.address}</p>
        </div>

        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #131849;">Applicant Details</h3>
          <p><strong>Name:</strong> ${buyer.name}</p>
          <p><strong>Email:</strong> ${buyer.email}</p>
          <p><strong>CNIC:</strong> ${buyer.cnic}</p>
          <p><strong>Booking Type:</strong> ${booking.bookingType === 'rent' ? 'Rental' : 'Purchase'}</p>
          <p><strong>Agreed Price:</strong> PKR ${booking.agreedPrice.toLocaleString()}</p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/dashboard/admin"
             style="background: #131849; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            View Admin Dashboard
          </a>
        </div>

        <p style="color: #666; font-size: 14px;">
          This is an automated notification from GBRentals. Please do not reply to this email.
        </p>
      </div>
    `;
    await sendEmail(admin.email, adminSubject, adminHtml);
  }
};

module.exports = {
  sendEmail,
  sendBookingNotification,
};