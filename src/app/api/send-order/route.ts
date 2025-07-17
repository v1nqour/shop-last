import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      companyName,
      shippingAddress,
      dateLimit,
      productTable,
    } = await req.json();

    // Validate required fields
    if (
      !firstName ||
      !lastName ||
      !email ||
      !phoneNumber ||
      !companyName ||
      !shippingAddress ||
      !dateLimit ||
      !productTable
    ) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Configure Nodemailer with Infomaniak SMTP
    const transporter = nodemailer.createTransport({
      host: "mail.infomaniak.com",
      port: 587,
      secure: false, // Use TLS
      auth: {
        user: process.env.EMAIL_USER, // Your Infomaniak email
        pass: process.env.EMAIL_PASS, // Your Infomaniak email password
      },
    });

    // Email options
    const mailOptions = {
      from: `"Your Business" <${process.env.EMAIL_USER}>`,
      to: process.env.BUSINESS_EMAIL, // Your business email
      subject: `New Order from ${firstName} ${lastName} (${companyName})`,
      html: productTable, // Use the styled productTable directly
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return NextResponse.json(
      { message: "Order sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { message: "Failed to send order. Please try again." },
      { status: 500 }
    );
  }
}