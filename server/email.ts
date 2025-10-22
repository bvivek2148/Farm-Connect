import nodemailer from 'nodemailer';
import { Contact } from '../shared/schema';

// Simple email configuration
const EMAIL_CONFIG = {
  service: 'gmail',
  auth: {
    user: 'farmconnect.helpdesk@gmail.com',
    pass: 'ncxo ujdp vihx aogw' // Gmail app password
  }
};

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport(EMAIL_CONFIG);
};

// Test email on startup
const transporter = createTransporter();
transporter.verify((error: any, success: boolean) => {
  if (error) {
    console.error('❌ Email configuration error:', error.message);
  } else if (success) {
    console.log('✅ Email transporter verified and ready to send to farmconnect.helpdesk@gmail.com');
  }
});

// Send contact form notification email
export async function sendContactFormNotification(contact: Contact): Promise<boolean> {
  try {
    const helpdeskEmail = 'farmconnect.helpdesk@gmail.com';
    console.log('📧 Processing contact form submission from:', contact.email);
    
    // Email to admin/support team
    const adminMailOptions = {
      from: `"Farm Connect" <${EMAIL_CONFIG.auth.user}>`,
      to: helpdeskEmail,
      subject: `New Contact Form Submission - ${contact.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #22c55e, #3b82f6); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">🌱 Farm Connect</h1>
            <p style="color: white; margin: 5px 0 0 0;">New Contact Form Submission</p>
          </div>
          
          <div style="padding: 30px; background: #f9fafb; border: 1px solid #e5e7eb;">
            <h2 style="color: #1f2937; margin-top: 0;">Contact Details</h2>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <p><strong>Name:</strong> ${contact.name}</p>
              <p><strong>Email:</strong> <a href="mailto:${contact.email}">${contact.email}</a></p>
              ${contact.phone ? `<p><strong>Phone:</strong> <a href="tel:${contact.phone}">${contact.phone}</a></p>` : ''}
              <p><strong>Submitted:</strong> ${new Date(contact.createdAt).toLocaleString()}</p>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px;">
              <h3 style="margin-top: 0; color: #1f2937;">Message:</h3>
              <p style="line-height: 1.6; color: #4b5563;">${contact.message}</p>
            </div>
            
            <div style="margin-top: 30px; padding: 20px; background: #dbeafe; border-radius: 8px; border-left: 4px solid #3b82f6;">
              <p style="margin: 0; color: #1e40af;">
                <strong>Action Required:</strong> Please respond to this inquiry within 24 hours.
              </p>
            </div>
          </div>
          
          <div style="padding: 20px; text-align: center; background: #f3f4f6; color: #6b7280; font-size: 14px;">
            <p>This email was sent from the Farm Connect contact form.</p>
            <p>Farm Connect - Connecting farmers with conscious consumers</p>
          </div>
        </div>
      `
    };

    // Auto-reply email to the person who submitted the form
    const autoReplyOptions = {
      from: `"Farm Connect Support" <${EMAIL_CONFIG.auth.user}>`,
      to: contact.email,
      subject: 'Thank you for contacting Farm Connect! 🌱',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #22c55e, #3b82f6); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">🌱 Farm Connect</h1>
            <p style="color: white; margin: 5px 0 0 0;">Thank you for reaching out!</p>
          </div>
          
          <div style="padding: 30px; background: #f9fafb; border: 1px solid #e5e7eb;">
            <h2 style="color: #1f2937; margin-top: 0;">Hi ${contact.name}!</h2>
            
            <p style="line-height: 1.6; color: #4b5563;">
              Thank you for contacting Farm Connect! We've received your message and our team will get back to you within 24 hours.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #1f2937;">Your Message:</h3>
              <p style="line-height: 1.6; color: #6b7280; font-style: italic;">"${contact.message}"</p>
            </div>
            
            <p style="line-height: 1.6; color: #4b5563;">
              In the meantime, feel free to explore our platform and discover fresh, local products from farmers in your area.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://farm-connect-vivek-bukkas-projects.vercel.app" 
                 style="background: linear-gradient(135deg, #22c55e, #16a34a); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Visit Farm Connect
              </a>
            </div>
            
            <div style="margin-top: 30px; padding: 20px; background: #f0fdf4; border-radius: 8px; border-left: 4px solid #22c55e;">
              <p style="margin: 0; color: #15803d;">
                <strong>Need immediate assistance?</strong><br>
                Email us directly at: <a href="mailto:farmconnect.helpdesk@gmail.com">farmconnect.helpdesk@gmail.com</a>
              </p>
            </div>
          </div>
          
          <div style="padding: 20px; text-align: center; background: #f3f4f6; color: #6b7280; font-size: 14px;">
            <p>Best regards,<br>The Farm Connect Team</p>
            <p>🌱 Connecting farmers with conscious consumers</p>
            <p>
              <a href="https://farm-connect-vivek-bukkas-projects.vercel.app" style="color: #22c55e;">Visit our website</a> | 
              <a href="mailto:farmconnect.helpdesk@gmail.com" style="color: #22c55e;">Contact Support</a>
            </p>
          </div>
        </div>
      `
    };

    // Send both emails
    console.log('📧 Sending admin notification email to:', helpdeskEmail);
    await transporter.sendMail(adminMailOptions);
    console.log('✅ Admin notification email sent successfully');
    
    console.log('📧 Sending auto-reply email to:', contact.email);
    await transporter.sendMail(autoReplyOptions);
    console.log('✅ Auto-reply email sent successfully');
    
    console.log(`🎆 Contact form notification completed for ${contact.name}`);
    return true;
  } catch (error: any) {
    console.error('❌ Error sending contact form notification:', error);
    console.error('🔍 Error details:', {
      message: error?.message,
      code: error?.code,
      responseCode: error?.responseCode,
      command: error?.command
    });
    
    // Check for common errors
    if (error?.message?.includes('Password')) {
      console.error('🚨 Possible authentication error - check EMAIL_PASSWORD');
    }
    if (error?.message?.includes('ENOTFOUND') || error?.message?.includes('connect')) {
      console.error('🚨 Network error - cannot connect to email server');
    }
    
    return false;
  }
}

// Send welcome email for new user registrations
export async function sendWelcomeEmail(userEmail: string, username: string, role: string): Promise<boolean> {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Farm Connect" <${EMAIL_CONFIG.auth.user}>`,
      to: userEmail,
      subject: `Welcome to Farm Connect, ${username}! 🌱`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #22c55e, #3b82f6); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">🌱 Farm Connect</h1>
            <p style="color: white; margin: 5px 0 0 0;">Welcome to the community!</p>
          </div>
          
          <div style="padding: 30px; background: #f9fafb; border: 1px solid #e5e7eb;">
            <h2 style="color: #1f2937; margin-top: 0;">Welcome ${username}!</h2>
            
            <p style="line-height: 1.6; color: #4b5563;">
              Thank you for joining Farm Connect as a <strong>${role}</strong>! You're now part of a community that's passionate about fresh, local food and sustainable agriculture.
            </p>
            
            ${role === 'farmer' ? `
              <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #22c55e;">
                <h3 style="margin-top: 0; color: #15803d;">🚜 Farmer Dashboard</h3>
                <p style="margin-bottom: 0; color: #166534;">
                  As a farmer, you can now add your products, manage your inventory, and connect directly with customers in your area.
                </p>
              </div>
            ` : `
              <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
                <h3 style="margin-top: 0; color: #1e40af;">🛒 Start Shopping</h3>
                <p style="margin-bottom: 0; color: #1e3a8a;">
                  Discover fresh, local products from farmers in your area and support sustainable agriculture.
                </p>
              </div>
            `}
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://farm-connect-vivek-bukkas-projects.vercel.app" 
                 style="background: linear-gradient(135deg, #22c55e, #16a34a); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Explore Farm Connect
              </a>
            </div>
            
            <p style="line-height: 1.6; color: #4b5563;">
              If you have any questions or need assistance, don't hesitate to reach out to our support team.
            </p>
          </div>
          
          <div style="padding: 20px; text-align: center; background: #f3f4f6; color: #6b7280; font-size: 14px;">
            <p>Best regards,<br>The Farm Connect Team</p>
            <p>🌱 Connecting farmers with conscious consumers</p>
            <p>
              <a href="mailto:farmconnect.helpdesk@gmail.com" style="color: #22c55e;">Contact Support</a>
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent successfully to ${userEmail}`);
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
}

// Send admin credentials confirmation email
export async function sendAdminCredentialsEmail(username: string, email: string, password: string): Promise<boolean> {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Farm Connect" <${EMAIL_CONFIG.auth.user}>`,
      to: email,
      subject: 'Farm Connect Admin Portal - Access Credentials',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #ef4444, #dc2626); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">🔐 Farm Connect Admin Portal</h1>
            <p style="color: white; margin: 5px 0 0 0;">Secure Access Credentials</p>
          </div>
          
          <div style="padding: 30px; background: #f9fafb; border: 1px solid #e5e7eb;">
            <h2 style="color: #1f2937; margin-top: 0;">Admin Account Created</h2>
            
            <p style="line-height: 1.6; color: #4b5563;">
              Your Farm Connect admin account has been successfully created. You now have full access to the admin portal.
            </p>
            
            <div style="background: #fee2e2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
              <h3 style="margin-top: 0; color: #991b1b;">Your Login Credentials:</h3>
              <p style="margin: 10px 0;"><strong>Username:</strong> <code style="background: white; padding: 5px 10px; border-radius: 4px;">${username}</code></p>
              <p style="margin: 10px 0;"><strong>Email:</strong> <code style="background: white; padding: 5px 10px; border-radius: 4px;">${email}</code></p>
              <p style="margin: 10px 0;"><strong>Password:</strong> <code style="background: white; padding: 5px 10px; border-radius: 4px;">${password}</code></p>
            </div>
            
            <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
              <p style="margin: 0; color: #92400e;">
                <strong>⚠️ Security Notice:</strong><br>
                • Keep these credentials secure and confidential<br>
                • Change your password after first login<br>
                • Never share these credentials with unauthorized users<br>
                • Delete this email after saving credentials securely
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://farm-connect-vivek-bukkas-projects.vercel.app/admin-login" 
                 style="background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Go to Admin Login
              </a>
            </div>
            
            <div style="background: #e0e7ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #312e81;">Admin Portal Features:</h3>
              <ul style="color: #3730a3; margin: 10px 0;">
                <li>Manage users and roles</li>
                <li>Monitor products and inventory</li>
                <li>View system analytics</li>
                <li>Manage site-wide settings</li>
                <li>View and manage all orders</li>
              </ul>
            </div>
          </div>
          
          <div style="padding: 20px; text-align: center; background: #f3f4f6; color: #6b7280; font-size: 14px;">
            <p>Best regards,<br>The Farm Connect System</p>
            <p>🌱 Connecting farmers with conscious consumers</p>
            <p>
              <a href="https://farm-connect-vivek-bukkas-projects.vercel.app" style="color: #ef4444;">Visit Farm Connect</a> |
              <a href="mailto:farmconnect.helpdesk@gmail.com" style="color: #ef4444;">Contact Support</a>
            </p>
            <p style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #d1d5db;">
              <strong>Farm Connect Admin Team</strong><br>
              farmconnect.helpdesk@gmail.com
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Admin credentials email sent successfully to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending admin credentials email:', error);
    return false;
  }
}
