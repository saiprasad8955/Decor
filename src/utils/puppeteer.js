const hbs = require("handlebars");
const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");
const getInvoiceData = require('./hbs-preview-generator')

async function generateInvoicePDF(invoiceId) {
  const data = await getInvoiceData(invoiceId);

  // Load and compile the template
  const filePath = path.join(__dirname, "invoiceTemplate.hbs");
  const source = fs.readFileSync(filePath, "utf-8");
  const template = hbs.compile(source);
  const html = template(data);

  // Generate PDF
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(html);
  const pdf = await page.pdf({ format: "A4" });

  await browser.close();
  return pdf;
}

module.exports = {generateInvoicePDF}