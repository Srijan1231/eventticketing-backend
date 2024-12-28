import express from "express";
import QRCode from "qrcode";
import puppeteer from "puppeteer";
import fs from "fs/promises";
import path from "path";
import { findEventByID } from "../models/pg/events/model.js";
import { fileURLToPath } from "url";

const router = express.Router();

const __filename =
  "/Users/srijandahal/private files/eventticketing/backend/src";

const __dirname = path.dirname(__filename);

// API to generate the ticket as a PDF
router.post("/generate", async (req, res) => {
  try {
    const userName = req.userInfo?.name || "Guest";
    const { eventId } = req.body;

    // Fetch event details
    const event = await findEventByID(eventId);
    const eventName = event.name;
    const date = event.event_date;

    if (!eventId || !eventName || !date) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Generate the QR code with the ticket information
    const qrCodeData = `Event: ${eventName}\nDate: ${date}\nName: ${userName}`;
    const qrCodeUrl = await QRCode.toDataURL(qrCodeData);

    // Create the HTML content
    const htmlContent = `
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
              

            }
            .ticket {
              width: 700px;
              height: 300px;
              background-color:rgb(85, 51, 135);
              
              padding: 20px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .ticket .details {
              width: 65%;
            }
            .ticket .details h1 {
              font-size: 24px;
              color: #c90000;
              margin-bottom: 10px;
            }
            .ticket .details p {
              margin: 4px 0;
              font-size: 16px;
            }
            .ticket .qr-code {
              text-align: center;
            }
            .ticket .qr-code img {
              width: 120px;
              height: 120px;
            }
          </style>
        </head>
        <body>
          <div class="ticket">
            <div class="details">
              <h1>Cinema Ticket</h1>
              <p><strong>Name:</strong> ${userName}</p>
              <p><strong>Event:</strong> ${eventName}</p>
              <p><strong>Date:</strong> ${date}</p>
              
            </div>
            <div class="qr-code">
              <img src="${qrCodeUrl}" alt="QR Code" />
            </div>
          </div>
        </body>
      </html>
    `;

    // Use Puppeteer to generate the PDF
    const browser = await puppeteer.launch({
      headless: false, // Set to false if you want to see the browser window
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.setContent(htmlContent);

    // Define the save path for the PDF
    const pdfPath = path.join(
      __dirname,
      "./tmp/tickets",
      `ticket-${eventId}.pdf`
    );

    await fs.mkdir(path.dirname(pdfPath), { recursive: true }); // Ensure directory exists
    await page.pdf({
      width: "700px", // Custom width
      height: "300px", // Custom height
      margin: { top: 2, bottom: 2, left: 2, right: 2 },
      path: pdfPath,
    });

    // const pdfBuffer = await page.pdf({
    //   width: "700px",
    //   height: "300px",
    // });

    await browser.close();

    // Send the saved PDF file as a response
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=ticket-${eventId}.pdf`
    );
    res.sendFile(pdfPath);
  } catch (error) {
    console.error("Error generating ticket:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export default router;
