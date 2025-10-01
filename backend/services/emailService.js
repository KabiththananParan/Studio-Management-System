import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Create transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Email templates
const createBookingConfirmationEmail = (booking, packageInfo, slotInfo) => {
  return {
    from: process.env.EMAIL_USER,
    to: booking.customerInfo.email,
    subject: `Booking Confirmation - ${booking.bookingReference}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #7c3aed; margin: 0;">Studio Management System</h1>
          <h2 style="color: #4b5563; margin: 10px 0;">Booking Confirmation</h2>
        </div>
        
        <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #1f2937; margin-top: 0;">Hello ${booking.customerInfo.name},</h3>
          <p style="color: #4b5563; line-height: 1.6;">
            Thank you for booking with us! Your studio session has been confirmed. Here are the details:
          </p>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h3 style="color: #1f2937; border-bottom: 2px solid #7c3aed; padding-bottom: 5px;">Booking Details</h3>
          <p><strong>Booking Reference:</strong> ${booking.bookingReference}</p>
          <p><strong>Package:</strong> ${booking.packageName}</p>
          <p><strong>Date:</strong> ${new Date(booking.bookingDate).toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</p>
          <p><strong>Time:</strong> ${booking.bookingTime}</p>
          <p><strong>Duration:</strong> ${booking.duration} hours</p>
          <p><strong>Total Amount:</strong> $${booking.totalAmount}</p>
          <p><strong>Payment Status:</strong> ${booking.paymentStatus.toUpperCase()}</p>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h3 style="color: #1f2937; border-bottom: 2px solid #7c3aed; padding-bottom: 5px;">Customer Information</h3>
          <p><strong>Name:</strong> ${booking.customerInfo.name}</p>
          <p><strong>Email:</strong> ${booking.customerInfo.email}</p>
          <p><strong>Phone:</strong> ${booking.customerInfo.phone}</p>
          <p><strong>Address:</strong> ${booking.customerInfo.address}</p>
        </div>
        
        ${booking.specialRequests ? `
        <div style="margin-bottom: 20px;">
          <h3 style="color: #1f2937; border-bottom: 2px solid #7c3aed; padding-bottom: 5px;">Special Requests</h3>
          <p style="color: #4b5563;">${booking.specialRequests}</p>
        </div>
        ` : ''}
        
        <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <h4 style="color: #92400e; margin-top: 0;">Important Information:</h4>
          <ul style="color: #92400e; margin: 0; padding-left: 20px;">
            <li>Please arrive 15 minutes before your scheduled time</li>
            <li>Bring a valid ID for verification</li>
            <li>Cancellations must be made 24 hours in advance</li>
            ${booking.paymentStatus === 'pending' ? '<li><strong>Payment is still pending. Please complete your payment to confirm your booking.</strong></li>' : ''}
          </ul>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <p style="color: #6b7280;">
            If you have any questions, please contact our support team.
          </p>
          <p style="color: #6b7280; font-size: 12px;">
            This is an automated email. Please do not reply to this message.
          </p>
        </div>
      </div>
    `
  };
};

// Send booking confirmation email
export const sendBookingConfirmationEmail = async (booking, packageInfo = null, slotInfo = null) => {
  try {
    const emailOptions = createBookingConfirmationEmail(booking, packageInfo, slotInfo);
    const info = await transporter.sendMail(emailOptions);
    console.log(`📧 Booking confirmation email sent to ${booking.customerInfo.email}:`, info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Failed to send booking confirmation email to ${booking.customerInfo.email}:`, error);
    return { success: false, error: error.message };
  }
};

// Send payment confirmation email
export const sendPaymentConfirmationEmail = async (booking) => {
  try {
    const emailOptions = {
      from: process.env.EMAIL_USER,
      to: booking.customerInfo.email,
      subject: `Payment Confirmed - ${booking.bookingReference}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #7c3aed; margin: 0;">Studio Management System</h1>
            <h2 style="color: #059669; margin: 10px 0;">Payment Confirmed! ✅</h2>
          </div>
          
          <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #059669;">
            <h3 style="color: #065f46; margin-top: 0;">Hello ${booking.customerInfo.name},</h3>
            <p style="color: #047857; line-height: 1.6;">
              Great news! Your payment has been successfully processed and your studio booking is now fully confirmed.
            </p>
          </div>
          
          <div style="margin-bottom: 20px;">
            <h3 style="color: #1f2937; border-bottom: 2px solid #059669; padding-bottom: 5px;">Payment Details</h3>
            <p><strong>Booking Reference:</strong> ${booking.bookingReference}</p>
            <p><strong>Amount Paid:</strong> $${booking.totalAmount}</p>
            <p><strong>Payment Status:</strong> COMPLETED ✅</p>
            <p><strong>Date & Time:</strong> ${new Date(booking.bookingDate).toLocaleDateString()} at ${booking.bookingTime}</p>
          </div>
          
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <h4 style="color: #374151; margin-top: 0;">What's Next?</h4>
            <ul style="color: #4b5563; margin: 0; padding-left: 20px;">
              <li>Save this confirmation email for your records</li>
              <li>Arrive 15 minutes before your scheduled time</li>
              <li>Bring a valid ID and this confirmation</li>
              <li>Contact us if you need to make any changes</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #6b7280;">
              We look forward to seeing you at your studio session!
            </p>
          </div>
        </div>
      `
    };
    
    const info = await transporter.sendMail(emailOptions);
    console.log(`📧 Payment confirmation email sent to ${booking.customerInfo.email}:`, info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Failed to send payment confirmation email to ${booking.customerInfo.email}:`, error);
    return { success: false, error: error.message };
  }
};

export default { sendBookingConfirmationEmail, sendPaymentConfirmationEmail };