import PDFDocument from 'pdfkit';
import { stringify } from 'csv-stringify';
import { supabase } from '../config/supabase.js';

export const getFilteredOrderLogs = async ({ startDate, endDate, restaurantId }) => {
  let query = supabase
    .from('orders')
    .select(`
      *,
      customer:users(id, name, email, phone),
      restaurant:restaurants(id, name, cuisine),
      items:order_items(*)
    `);

  if (startDate) {
    query = query.gte('created_at', startDate);
  }
  if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    query = query.lte('created_at', end.toISOString());
  }
  if (restaurantId && restaurantId !== 'ALL') {
    query = query.eq('restaurant_id', parseInt(restaurantId, 10));
  }

  query = query.order('created_at', { ascending: false });

  const { data: orders } = await query;
  return orders || [];
};

export const generateCSVReport = async (res, orders, filterInfo = {}) => {
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="sales_report_${Date.now()}.csv"`);

  const stringifier = stringify({
    header: true,
    columns: [
      { key: 'orderNumber', header: 'Order #' },
      { key: 'createdAt', header: 'Date & Time' },
      { key: 'restaurantName', header: 'Restaurant' },
      { key: 'customerName', header: 'Customer' },
      { key: 'customerPhone', header: 'Customer Phone' },
      { key: 'status', header: 'Status' },
      { key: 'itemList', header: 'Items Ordered' },
      { key: 'subtotal', header: 'Subtotal (INR)' },
      { key: 'deliveryFee', header: 'Delivery Fee (INR)' },
      { key: 'tax', header: 'Tax (INR)' },
      { key: 'total', header: 'Total (INR)' },
      { key: 'commissionRate', header: 'Application Fee Policy' },
      { key: 'commissionAmount', header: 'Application Charges (INR)' },
      { key: 'vendorEarnings', header: 'Vendor Food Payout (INR)' }
    ]
  });

  stringifier.pipe(res);

  for (const order of orders) {
    const itemList = order.items.map(i => `${i.quantity}x ${i.name}`).join('; ');
    stringifier.write({
      orderNumber: order.order_number,
      createdAt: new Date(order.created_at).toLocaleString(),
      restaurantName: order.restaurant?.name || 'Unknown',
      customerName: order.customer?.name || 'Unknown',
      customerPhone: order.customer_phone || order.customer?.phone || 'N/A',
      status: order.status,
      itemList,
      subtotal: `₹${order.subtotal.toFixed(2)}`,
      deliveryFee: `₹${order.delivery_fee.toFixed(2)}`,
      tax: `₹${order.tax.toFixed(2)}`,
      total: `₹${order.total.toFixed(2)}`,
      commissionRate: '₹5/item',
      commissionAmount: `₹${order.commission_amount.toFixed(2)}`,
      vendorEarnings: `₹${order.vendor_earnings.toFixed(2)}`
    });
  }

  stringifier.end();
};

export const generatePDFReport = async (res, orders, filterInfo = {}) => {
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="sales_report_${Date.now()}.pdf"`);

  const doc = new PDFDocument({ margin: 40, size: 'A4' });
  doc.pipe(res);

  const primaryColor = '#e11d48';
  const textColor = '#1f2937';

  doc.rect(40, 40, 515, 60).fill(primaryColor);
  doc.fillColor('#ffffff')
     .fontSize(20)
     .font('Helvetica-Bold')
     .text('SPICY ROUTE - SALES & EARNINGS REPORT (INR)', 55, 55);
  
  doc.fontSize(10)
     .font('Helvetica')
     .text(`Generated: ${new Date().toLocaleString()} | Filter Range: ${filterInfo.dateRangeLabel || 'All Time'}`, 55, 80);

  doc.moveDown(2);

  const totalOrders = orders.length;
  const validOrders = orders.filter(o => o.status !== 'CANCELLED');
  const totalRevenue = validOrders.reduce((sum, o) => sum + o.total, 0);
  const totalCommission = validOrders.reduce((sum, o) => sum + o.commission_amount, 0);
  const totalVendorPayouts = validOrders.reduce((sum, o) => sum + o.vendor_earnings, 0);

  const startY = 115;
  doc.rect(40, startY, 515, 65).fill('#f3f4f6').stroke('#e5e7eb');

  doc.fillColor(textColor).fontSize(10).font('Helvetica-Bold');
  doc.text('EXECUTIVE REPORT SUMMARY', 55, startY + 10);

  doc.font('Helvetica').fontSize(9);
  doc.text(`Total Orders Logged: ${totalOrders}`, 55, startY + 28);
  doc.text(`Completed/Active Revenue (GMV): Rs. ${totalRevenue.toFixed(2)}`, 55, startY + 44);

  doc.text(`Platform Application Charges: Rs. ${totalCommission.toFixed(2)}`, 300, startY + 28);
  doc.text(`Vendor Food Payouts: Rs. ${totalVendorPayouts.toFixed(2)}`, 300, startY + 44);

  let tableTop = startY + 80;
  doc.rect(40, tableTop, 515, 20).fill('#374151');
  
  doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(8);
  doc.text('Order #', 45, tableTop + 6);
  doc.text('Date', 105, tableTop + 6);
  doc.text('Restaurant', 165, tableTop + 6);
  doc.text('Status', 285, tableTop + 6);
  doc.text('Total (INR)', 355, tableTop + 6);
  doc.text('App Fee', 415, tableTop + 6);
  doc.text('Vendor Payout', 480, tableTop + 6);

  let currentY = tableTop + 22;

  orders.slice(0, 40).forEach((order, index) => {
    if (currentY > 750) {
      doc.addPage();
      currentY = 40;
      
      doc.rect(40, currentY, 515, 20).fill('#374151');
      doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(8);
      doc.text('Order #', 45, currentY + 6);
      doc.text('Date', 105, currentY + 6);
      doc.text('Restaurant', 165, currentY + 6);
      doc.text('Status', 285, currentY + 6);
      doc.text('Total (INR)', 355, currentY + 6);
      doc.text('Commission', 415, currentY + 6);
      doc.text('Vendor Net', 480, currentY + 6);
      currentY += 22;
    }

    const rowBg = index % 2 === 0 ? '#f9fafb' : '#ffffff';
    doc.rect(40, currentY, 515, 18).fill(rowBg);

    doc.fillColor(textColor).font('Helvetica').fontSize(8);
    doc.text(order.order_number, 45, currentY + 4);
    doc.text(new Date(order.created_at).toLocaleDateString(), 105, currentY + 4);
    doc.text((order.restaurant?.name || 'Unknown').substring(0, 20), 165, currentY + 4);
    
    let statusColor = '#3b82f6';
    if (order.status === 'DELIVERED') statusColor = '#10b981';
    if (order.status === 'CANCELLED') statusColor = '#ef4444';
    if (order.status === 'PENDING') statusColor = '#f59e0b';
    
    doc.fillColor(statusColor).font('Helvetica-Bold').text(order.status, 285, currentY + 4);
    
    doc.fillColor(textColor).font('Helvetica');
    doc.text(`Rs. ${order.total.toFixed(2)}`, 355, currentY + 4);
    doc.text(`Rs. ${order.commission_amount.toFixed(2)}`, 415, currentY + 4);
    doc.text(`Rs. ${order.vendor_earnings.toFixed(2)}`, 480, currentY + 4);

    currentY += 19;
  });

  if (orders.length > 40) {
    doc.moveDown(1);
    doc.fillColor('#6b7280').fontSize(8).text(`* Displaying top 40 orders out of ${orders.length} in PDF format. Download CSV for full record.`, 45, currentY + 10);
  }

  doc.moveDown(2);
  doc.fillColor('#9ca3af').fontSize(8).text('Spicy Route Financial Analytics & Automated Reporting Engine v2.0', 45, 800, { align: 'center' });

  doc.end();
};
