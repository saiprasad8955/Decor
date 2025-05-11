const hbs = require("handlebars");
const fs = require("fs");
const path = require("path");
const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');
const getInvoiceData = require("./hbs-preview-generator");

async function generateInvoicePDF(invoiceId) {
  const data = await getInvoiceData(invoiceId);

  // Load and compile the Handlebars template
  const filePath = path.join(__dirname, "invoiceTemplate.hbs");
  const source = fs.readFileSync(filePath, "utf-8");
  const template = hbs.compile(source);
  const html = template(data);

  // Launch Puppeteer
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath(), // chromium will resolve the path
    headless: chromium.headless,
  });

  const page = await browser.newPage();

  // Set content and wait until all resources are loaded
  await page.setContent(html, { waitUntil: "networkidle0" });

  // Generate PDF buffer
  const pdf = await page.pdf({
    format: "A4",
    printBackground: true,
  });

  await browser.close();
  return pdf;
}

module.exports = { generateInvoicePDF };
