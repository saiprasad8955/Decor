const Invoice = require("../models/invoice");
const path = require("path");

async function getInvoiceData(invoiceId) {
  const invoice = await Invoice.findById(invoiceId)
    .populate("customerId") // Get customer details
    .populate("items.item") // Get item details
    .lean(); // Return plain JS object

  if (!invoice) throw new Error("Invoice not found");

  // Transform invoice to match the HBS template structure
  console.log(invoice.items)
  const data = {
    logoPath: path.join(__dirname, "logo_single.png"),
    customer: invoice.customerId.name,
    invoiceDate: invoice.invoice_date.toISOString().split("T")[0],
    deliveryDate: invoice.delivery_date.toISOString().split("T")[0],
    description: invoice.description,
    salesPerson: invoice.sales_person,
    items: invoice.items.map((i) => {
      return {
        name: i.item.item_name,
        quantity: i.quantity,
        rate: i.rate.toFixed(2),
        tax: i.tax,
        total: i.total.toFixed(2),
      }
  }
  ),
    subtotal: invoice.subtotal.toFixed(2),
    discount: invoice.discount.toFixed(2),
    finalAmount: invoice.final_amount.toFixed(2),
  };

  return data;
}

module.exports = getInvoiceData