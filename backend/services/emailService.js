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

// Send inventory payment confirmation email
export const sendInventoryPaymentConfirmationEmail = async (inventoryBooking) => {
  try {
    const customerName = `${inventoryBooking.user.firstName} ${inventoryBooking.user.lastName}`;
    const customerEmail = inventoryBooking.user.email;
    
    // Format equipment list
    const equipmentList = inventoryBooking.items.map(item => {
      const inventory = item.inventory;
      return `
        <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; margin-bottom: 10px; background-color: #f9fafb;">
          <h4 style="margin: 0 0 8px 0; color: #1f2937;">${inventory.name}</h4>
          <p style="margin: 0; color: #6b7280; font-size: 14px;">
            <strong>Brand:</strong> ${inventory.brand} | 
            <strong>Model:</strong> ${inventory.model} | 
            <strong>Quantity:</strong> ${item.quantity}
          </p>
          <p style="margin: 5px 0 0 0; color: #059669; font-weight: bold;">
            LKR ${item.subtotal.toLocaleString()} (${item.quantity} × LKR ${inventory.rental.pricePerDay}/day)
          </p>
        </div>
      `;
    }).join('');

    // Format dates
    const startDate = new Date(inventoryBooking.bookingDates.startDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const endDate = new Date(inventoryBooking.bookingDates.endDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const emailOptions = {
      from: process.env.EMAIL_USER,
      to: customerEmail,
      subject: `Equipment Rental Payment Confirmed - ${inventoryBooking.bookingId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #7c3aed; margin: 0;">Studio Management System</h1>
            <h2 style="color: #059669; margin: 10px 0;">Equipment Rental Payment Confirmed! ✅</h2>
          </div>
          
          <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #059669;">
            <h3 style="color: #065f46; margin-top: 0;">Hello ${customerName},</h3>
            <p style="color: #047857; line-height: 1.6;">
              Excellent! Your payment has been successfully processed and your equipment rental is now confirmed. 
              Get ready for your photography session with our professional equipment!
            </p>
          </div>
          
          <div style="margin-bottom: 20px;">
            <h3 style="color: #1f2937; border-bottom: 2px solid #059669; padding-bottom: 5px;">Payment Details</h3>
            <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px;">
              <p><strong>Booking Reference:</strong> ${inventoryBooking.bookingId}</p>
              <p><strong>Total Paid:</strong> LKR ${inventoryBooking.pricing.total.toLocaleString()}</p>
              <p><strong>Payment Status:</strong> <span style="color: #059669; font-weight: bold;">COMPLETED ✅</span></p>
              <p><strong>Transaction ID:</strong> ${inventoryBooking.transactionId}</p>
              <p><strong>Payment Method:</strong> ${inventoryBooking.paymentMethod.toUpperCase()}</p>
            </div>
          </div>
          
          <div style="margin-bottom: 20px;">
            <h3 style="color: #1f2937; border-bottom: 2px solid #059669; padding-bottom: 5px;">Rental Period</h3>
            <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b;">
              <p><strong>Pickup Date:</strong> ${startDate}</p>
              <p><strong>Return Date:</strong> ${endDate}</p>
              <p><strong>Rental Duration:</strong> ${inventoryBooking.bookingDates.duration} day(s)</p>
            </div>
          </div>
          
          <div style="margin-bottom: 20px;">
            <h3 style="color: #1f2937; border-bottom: 2px solid #059669; padding-bottom: 5px;">Equipment List</h3>
            ${equipmentList}
            <div style="text-align: right; margin-top: 15px; padding: 15px; background-color: #f1f5f9; border-radius: 8px;">
              <p style="margin: 0; font-size: 18px; font-weight: bold; color: #1e293b;">
                Total: LKR ${inventoryBooking.pricing.total.toLocaleString()}
              </p>
            </div>
          </div>
          
          <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h4 style="color: #92400e; margin-top: 0;">📋 Important Instructions:</h4>
            <div style="color: #92400e;">
              <h5 style="margin: 15px 0 5px 0;">Equipment Pickup:</h5>
              <ul style="margin: 5px 0 15px 20px; padding: 0;">
                <li>Arrive 30 minutes before your rental start time</li>
                <li>Bring a valid photo ID (NIC/Passport/Driving License)</li>
                <li>Bring this confirmation email (digital or printed)</li>
                <li>Equipment will be inspected before handover</li>
              </ul>
              
              <h5 style="margin: 15px 0 5px 0;">During Rental Period:</h5>
              <ul style="margin: 5px 0 15px 20px; padding: 0;">
                <li>Handle all equipment with care and attention</li>
                <li>Keep equipment in provided cases when not in use</li>
                <li>Report any issues immediately: +94 11 234 5678</li>
                <li>Do not attempt repairs - contact us for technical issues</li>
              </ul>
              
              <h5 style="margin: 15px 0 5px 0;">Equipment Return:</h5>
              <ul style="margin: 5px 0 0 20px; padding: 0;">
                <li>Return by 6:00 PM on the return date</li>
                <li>All items must be cleaned and in original cases</li>
                <li>Late returns incur additional charges (LKR 500/hour)</li>
                <li>Inspection will be done upon return</li>
              </ul>
            </div>
          </div>
          
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <h4 style="color: #374151; margin-top: 0;">📍 Studio Location & Contact:</h4>
            <p style="color: #4b5563; margin: 5px 0;">
              <strong>Address:</strong> 123 Photography Lane, Colombo 03, Sri Lanka
            </p>
            <p style="color: #4b5563; margin: 5px 0;">
              <strong>Phone:</strong> +94 11 234 5678 | <strong>Mobile:</strong> +94 77 123 4567
            </p>
            <p style="color: #4b5563; margin: 5px 0;">
              <strong>Email:</strong> support@studiomanagement.lk
            </p>
            <p style="color: #4b5563; margin: 5px 0;">
              <strong>Business Hours:</strong> Monday - Sunday, 9:00 AM - 7:00 PM
            </p>
          </div>
          
          <div style="background-color: #dbeafe; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <h4 style="color: #1e40af; margin-top: 0;">💡 Pro Tips for Your Rental:</h4>
            <ul style="color: #1e40af; margin: 0; padding-left: 20px;">
              <li>Test all equipment immediately after pickup</li>
              <li>Bring extra batteries and memory cards</li>
              <li>Check weather conditions for outdoor shoots</li>
              <li>Consider equipment insurance for valuable items</li>
              <li>Ask our staff for usage tips and best practices</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #6b7280; font-size: 16px;">
              Have an amazing photography session! 📸
            </p>
            <p style="color: #6b7280; font-size: 12px;">
              This is an automated confirmation email. Please save this for your records.<br>
              For any questions, contact us at support@studiomanagement.lk
            </p>
          </div>
        </div>
      `
    };
    
    const info = await transporter.sendMail(emailOptions);
    console.log(`📧 Inventory payment confirmation email sent to ${customerEmail}:`, info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Failed to send inventory payment confirmation email:`, error);
    return { success: false, error: error.message };
  }
};

export default { sendBookingConfirmationEmail, sendPaymentConfirmationEmail, sendInventoryPaymentConfirmationEmail };