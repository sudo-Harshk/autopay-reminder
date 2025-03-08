import { db } from "./firebase.js";
import { collection, addDoc, getDocs, updateDoc, doc } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";

// DOM Elements
const addPaymentBtn = document.getElementById("addPayment");
const serviceNameInput = document.getElementById("serviceName");
const dueDateInput = document.getElementById("dueDate");
const categoryInput = document.getElementById("category");
const paymentList = document.getElementById("paymentList");
const paidList = document.getElementById("paidList"); // New: Paid Payments List

// Firestore Collection Reference
const remindersCollection = collection(db, "autopay_reminders");

// Function to Add a New Reminder
async function addReminder() {
    console.log("🔹 addReminder() function triggered!");

    const service = serviceNameInput.value.trim();
    const dueDate = dueDateInput.value;
    const category = categoryInput.value;

    if (!service || !dueDate || !category) {
        alert("⚠ Please fill in all fields.");
        return;
    }

    try {
        const docRef = await addDoc(remindersCollection, {
            service: service,
            dueDate: dueDate,
            category: category,
            status: "pending" // Default status
        });

        console.log("✅ Reminder added with ID:", docRef.id);
        alert("✅ Reminder Added Successfully!");

        // Clear inputs
        serviceNameInput.value = "";
        dueDateInput.value = "";
        categoryInput.value = "Bills";

        // Reload the reminders list
        loadReminders();
    } catch (error) {
        console.error("❌ Error adding reminder:", error);
        alert("⚠ Error adding reminder! Check console for details.");
    }
}

// Function to Mark Reminder as Paid
async function markAsPaid(reminderId) {
    console.log("🔹 Marking as Paid:", reminderId);

    try {
        const reminderRef = doc(db, "autopay_reminders", reminderId);
        await updateDoc(reminderRef, {
            status: "paid"
        });

        console.log("✅ Payment marked as Paid!");
        loadReminders(); // Refresh lists
    } catch (error) {
        console.error("❌ Error marking as Paid:", error);
    }
}

// Function to Fetch and Display Reminders
async function loadReminders() {
    console.log("🔹 Loading reminders...");

    try {
        const querySnapshot = await getDocs(remindersCollection);
        paymentList.innerHTML = "";
        paidList.innerHTML = "";

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            console.log("📌 Reminder Fetched:", data);

            const listItem = document.createElement("li");
            listItem.classList.add("payment-item");

            // Determine the Badge Color
            let badgeClass = "";
            if (data.category === "Bills") badgeClass = "badge-bills";
            else if (data.category === "Subscriptions") badgeClass = "badge-subscriptions";
            else if (data.category === "Loans") badgeClass = "badge-loans";

            listItem.innerHTML = `
                <strong>${data.service}</strong> 
                - Due: ${data.dueDate} 
                <span class="badge ${badgeClass}">${data.category}</span>
            `;

            // If it's a paid payment, style it accordingly
            if (data.status === "pending") {
                const payButton = document.createElement("button");
                payButton.textContent = "Mark as Paid";
                payButton.classList.add("pay-button");
                payButton.onclick = () => markAsPaid(doc.id);
                listItem.appendChild(payButton);
                paymentList.appendChild(listItem);
            } else {
                listItem.classList.add("paid-item");
                listItem.innerHTML = `
                    <strong>${data.service}</strong> 
                    - Paid: ${data.dueDate} 
                    <span class="badge ${badgeClass}">${data.category}</span>
                    <span class="checkmark">✅</span>
                `;
                paidList.appendChild(listItem);
            }
        });

    } catch (error) {
        console.error("❌ Error fetching reminders:", error);
    }
}

// Attach Event Listener to Button
addPaymentBtn.addEventListener("click", addReminder);

// Load Existing Reminders on Page Load
window.onload = loadReminders;
