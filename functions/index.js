const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");


admin.initializeApp();
const db = admin.firestore();

// 🔹 Configure Gmail SMTP Transport
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "18nu1a0598@nsrit.edu.in",  
        pass: "epjd ceic iduv ytml"  
    }
});

// 🔹 Function to Send Email
async function sendEmail(to, subject, message) {
    const mailOptions = {
        from: "AutoPay Reminder <18nu1a0598@nsrit.edu.in>",
        to: to,
        subject: subject,
        html: message
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("✅ Email Sent to:", to);
    } catch (error) {
        console.error("❌ Email Sending Failed:", error);
    }
}

// 🔹 Function to Check Due Payments and Send Email
exports.checkDuePayments = functions.pubsub.schedule("every 24 hours").onRun(async (context) => {
    console.log("🔹 Running Daily Reminder Check...");

    const today = new Date();
    const twoDaysAhead = new Date();
    const oneDayAhead = new Date();
    
    twoDaysAhead.setDate(today.getDate() + 2);
    oneDayAhead.setDate(today.getDate() + 1);

    const formattedTwoDays = twoDaysAhead.toISOString().split("T")[0];
    const formattedOneDay = oneDayAhead.toISOString().split("T")[0];

    try {
        const snapshot = await db.collection("autopay_reminders").where("status", "==", "pending").get();

        let remindersDue = [];
        snapshot.forEach((doc) => {
            const data = doc.data();
            if (data.dueDate === formattedTwoDays || data.dueDate === formattedOneDay) {
                remindersDue.push(data);
            }
        });

        if (remindersDue.length > 0) {
            let message = "<h2>Upcoming Payments Reminder</h2><ul>";
            remindersDue.forEach((reminder) => {
                message += `<li><strong>${reminder.service}</strong> - Due: ${reminder.dueDate} (${reminder.category})</li>`;
            });
            message += "</ul>";

            await sendEmail("YOUR_EMAIL@gmail.com", "⏳ Payment Reminder", message);
        } else {
            console.log("✅ No payments due in the next 2 days.");
        }

    } catch (error) {
        console.error("❌ Error Checking Payments:", error);
    }

    return null;
});