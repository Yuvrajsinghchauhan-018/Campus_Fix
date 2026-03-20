const PDFDocument = require('pdfkit');

exports.generateReport = (res, reportData) => {
  const doc = new PDFDocument();
  let filename = 'CampusFix_Report.pdf';
  filename = encodeURIComponent(filename);
  
  res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"');
  res.setHeader('Content-type', 'application/pdf');

  doc.fontSize(20).text('CampusFix Maintenance Report', { align: 'center' });
  doc.moveDown();
  
  doc.fontSize(14).text(`Total Complaints: ${reportData.total}`);
  doc.text(`Resolved Percentage: ${reportData.resolvedPercentage}%`);
  doc.text(`Pending Complaints: ${reportData.pendingCount}`);
  doc.text(`Average Resolution Time: ${reportData.avgResolutionTime} hours`);
  doc.moveDown();
  
  // End document
  doc.pipe(res);
  doc.end();
};
