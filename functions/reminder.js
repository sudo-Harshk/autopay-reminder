const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
require("dotenv").config();

// 🔹 Initialize Firebase
console.log("🟢 Initializing Firebase...");
const serviceAccountBase64 = process.env.GCP_SERVICE_ACCOUNT;
const serviceAccount = JSON.parse(Buffer.from(serviceAccountBase64, "base64").toString("utf-8"));

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});


const db = admin.firestore();
console.log("✅ Firebase Initialized");

// 🔹 Configure Gmail SMTP Transport
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,  
        pass: process.env.EMAIL_PASS      
    }
});

// Function to Send a Professional Email
async function sendEmail(to, subject, reminders) {
    console.log("📨 Sending Email to:", to);

    let emailBody = `
        <div style="max-width: 500px; margin: auto; padding: 20px; font-family: Arial, sans-serif; border: 1px solid #ddd; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <h2 style="background: #007bff; color: white; padding: 10px; text-align: center; border-radius: 6px;">
                AutoPay Reminder 📅
            </h2>
            <p style="font-size: 16px; color: #333;">You have upcoming payments due:</p>
            <ul style="list-style: none; padding: 0;">
    `;

    reminders.forEach((reminder) => {
        emailBody += `
            <li style="padding: 10px; border-bottom: 1px solid #ddd;">
                <strong style="font-size: 18px; color: #007bff;">${reminder.service}</strong> <br>
                <span style="font-size: 14px; color: #555;">Due: <b>${reminder.dueDate}</b></span> <br>
                <span style="font-size: 14px; font-weight: bold; color: ${reminder.category === "Loans" ? "red" : "#28a745"};">
                    ${reminder.category}
                </span>
            </li>
        `;
    });

    emailBody += `
            </ul>
            <p style="font-size: 14px; color: #777; text-align: center;">
                Stay on top of your payments! ✔  
            </p>
        </div>
    `;

    const mailOptions = {
        from: "AutoPay Reminder 18nu1a0598@nsrit.edu.in",
        to: to,
        subject: subject,
        html: emailBody
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("✅ Professional Email Sent Successfully!");
    } catch (error) {
        console.error("❌ Email Sending Failed:", error);
    }
}

// Function to Check Due Payments and Send Email
async function checkDuePayments() {
    console.log("🔹 Running Reminder Check...");

    const today = new Date();
    const twoDaysAhead = new Date();
    const oneDayAhead = new Date();

    twoDaysAhead.setDate(today.getDate() + 2);
    oneDayAhead.setDate(today.getDate() + 1);

    const formattedTwoDays = twoDaysAhead.toISOString().split("T")[0];
    const formattedOneDay = oneDayAhead.toISOString().split("T")[0];

    console.log(`🔍 Checking payments for: ${formattedTwoDays} & ${formattedOneDay}`);

    try {
        const snapshot = await db.collection("autopay_reminders").where("status", "==", "pending").get();

        if (snapshot.empty) {
            console.log("✅ No pending payments found in Firestore.");
            return;
        }

        let remindersDue = [];
        snapshot.forEach((doc) => {
            const data = doc.data();
            console.log("📌 Reminder Found:", data);

            if (data.dueDate === formattedTwoDays || data.dueDate === formattedOneDay) {
                remindersDue.push(data);
            }
        });

        if (remindersDue.length > 0) {
            await sendEmail("18nu1a0598@nsrit.edu.in", "⏳ Upcoming Payment Reminder", remindersDue);
        } else {
            console.log("✅ No payments due in the next 2 days.");
        }

    } catch (error) {
        console.error("❌ Error Checking Payments:", error);
    }
}

// Run the function
checkDuePayments();
