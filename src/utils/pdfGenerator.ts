import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { Booking } from '../types/index.js';

export async function generateTicketPDF(booking: Booking): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  // 1. Generate QR Code Data URL
  const qrDataPayload = JSON.stringify({
    service: 'RailEase Indian Railway E-Ticket',
    pnr: booking.pnr,
    bookingRef: booking.bookingReference,
    train: `${booking.train.number} ${booking.train.name}`,
    date: booking.journeyDate,
    from: `${booking.sourceStation.name} (${booking.sourceStation.code})`,
    to: `${booking.destinationStation.name} (${booking.destinationStation.code})`,
    depTime: booking.train.departureTime,
    arrTime: booking.train.arrivalTime,
    class: booking.travelClass,
    status: booking.status,
    passengers: booking.passengers.map((p) => ({
      name: p.passengerName,
      age: p.age,
      gender: p.gender,
      seat: `${p.coachCode}-${p.seatNumber} (${p.berthType})`,
      status: p.status,
    })),
    fare: `INR ${booking.totalFare.toFixed(2)}`,
    txnId: booking.payment?.transactionId || 'N/A',
  });

  let qrDataUrl = '';
  try {
    qrDataUrl = await QRCode.toDataURL(qrDataPayload, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 180,
    });
  } catch (err) {
    console.error('Failed to generate QR data URL:', err);
  }

  // 2. Header Background (Deep Navy)
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(margin, 12, contentWidth, 28, 'F');

  // Brand Name & Subtitle
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('RailEase', margin + 6, 23);

  doc.setTextColor(34, 211, 238); // cyan-400
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('INDIAN RAILWAYS ELECTRONIC RESERVATION SLIP (ERS)', margin + 6, 29);

  doc.setTextColor(148, 163, 184); // slate-400
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Next-Gen Passenger Ticketing & Live Berth Allotment', margin + 6, 35);

  // PNR Badge in Header (Right Side)
  const pnrBoxWidth = 56;
  const pnrBoxX = margin + contentWidth - pnrBoxWidth - 4;
  doc.setFillColor(30, 41, 59); // slate-800
  doc.roundedRect(pnrBoxX, 15, pnrBoxWidth, 22, 2, 2, 'F');

  doc.setTextColor(148, 163, 184);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('PNR NUMBER', pnrBoxX + 4, 21);

  doc.setTextColor(34, 211, 238); // cyan-400
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(booking.pnr, pnrBoxX + 4, 28);

  doc.setTextColor(203, 213, 225);
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`Ref: ${booking.bookingReference}`, pnrBoxX + 4, 33);

  let curY = 44;

  // 3. Status Bar
  const isCancelled = booking.status === 'CANCELLED';
  if (isCancelled) {
    doc.setFillColor(254, 242, 242); // rose-50
    doc.setDrawColor(244, 63, 94); // rose-500
    doc.roundedRect(margin, curY, contentWidth, 8, 1, 1, 'FD');
    doc.setTextColor(190, 18, 60);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('BOOKING STATUS: CANCELLED (Demo Refund Processed)', margin + 4, curY + 5.5);
  } else {
    doc.setFillColor(236, 253, 245); // emerald-50
    doc.setDrawColor(16, 185, 129); // emerald-500
    doc.roundedRect(margin, curY, contentWidth, 8, 1, 1, 'FD');
    doc.setTextColor(4, 120, 87);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('BOOKING STATUS: CONFIRMED (CNF)', margin + 4, curY + 5.5);
  }

  curY += 12;

  // 4. Train & Schedule Information Card
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.roundedRect(margin, curY, contentWidth, 34, 2, 2, 'FD');

  // Left Train Column
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('TRAIN DETAILS', margin + 5, curY + 6);

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.text(`${booking.train.number} - ${booking.train.name}`, margin + 5, curY + 12);

  doc.setTextColor(71, 85, 105);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Type: ${booking.train.type || 'Express'}   |   Quota: General (GN)`, margin + 5, curY + 17);
  doc.text(`Class: ${booking.travelClass}   |   Journey Date: ${booking.journeyDate}`, margin + 5, curY + 22);
  doc.text(`Booked On: ${new Date(booking.createdAt).toLocaleString('en-IN')}`, margin + 5, curY + 27);

  // Right Route Box
  const routeX = margin + 95;
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('BOARDING STATION', routeX, curY + 6);
  doc.text('DEBOARDING STATION', routeX + 45, curY + 6);

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(9.5);
  doc.text(`${booking.sourceStation.name}`, routeX, curY + 12);
  doc.text(`${booking.destinationStation.name}`, routeX + 45, curY + 12);

  doc.setTextColor(37, 99, 235); // blue-600
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text(`${booking.sourceStation.code} (Dep: ${booking.train.departureTime})`, routeX, curY + 17);
  doc.text(`${booking.destinationStation.code} (Arr: ${booking.train.arrivalTime})`, routeX + 45, curY + 17);

  doc.setDrawColor(203, 213, 225);
  doc.line(routeX, curY + 21, margin + contentWidth - 5, curY + 21);

  doc.setTextColor(100, 116, 139);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.text('Direct Indian Railway Scheduled Service', routeX, curY + 27);

  curY += 38;

  // 5. Passenger Reservation Table
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('PASSENGER RESERVATION DETAILS', margin, curY);

  curY += 4;

  // Table Header
  doc.setFillColor(30, 41, 59); // slate-800
  doc.rect(margin, curY, contentWidth, 7, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');

  const colX = {
    num: margin + 3,
    name: margin + 12,
    age: margin + 65,
    coach: margin + 88,
    seat: margin + 105,
    berthType: margin + 125,
    status: margin + 155,
  };

  doc.text('#', colX.num, curY + 4.8);
  doc.text('PASSENGER NAME', colX.name, curY + 4.8);
  doc.text('AGE / SEX', colX.age, curY + 4.8);
  doc.text('COACH', colX.coach, curY + 4.8);
  doc.text('SEAT/BERTH', colX.seat, curY + 4.8);
  doc.text('BERTH TYPE', colX.berthType, curY + 4.8);
  doc.text('STATUS', colX.status, curY + 4.8);

  curY += 7;

  // Passenger Rows
  booking.passengers.forEach((p, idx) => {
    const isEven = idx % 2 === 0;
    doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252);
    doc.rect(margin, curY, contentWidth, 7, 'F');

    doc.setDrawColor(226, 232, 240);
    doc.line(margin, curY + 7, margin + contentWidth, curY + 7);

    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);

    doc.text(`${idx + 1}`, colX.num, curY + 4.8);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(p.passengerName, colX.name, curY + 4.8);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`${p.age} / ${p.gender.charAt(0)}`, colX.age, curY + 4.8);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(37, 99, 235);
    doc.text(isCancelled ? '-' : p.coachCode, colX.coach, curY + 4.8);
    doc.text(isCancelled ? '-' : `${p.seatNumber}`, colX.seat, curY + 4.8);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(isCancelled ? '-' : p.berthType, colX.berthType, curY + 4.8);

    if (isCancelled) {
      doc.setTextColor(190, 18, 60);
      doc.setFont('helvetica', 'bold');
      doc.text('CAN', colX.status, curY + 4.8);
    } else {
      doc.setTextColor(4, 120, 87);
      doc.setFont('helvetica', 'bold');
      doc.text(p.status, colX.status, curY + 4.8);
    }

    curY += 7;
  });

  curY += 6;

  // 6. Payment Breakdown & Live QR Code Box
  const boxHeight = 44;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, curY, contentWidth, boxHeight, 2, 2, 'FD');

  // Left side: Payment breakdown
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text('PAYMENT & TRANSACTION BREAKDOWN', margin + 5, curY + 6);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);

  const ticketFare = Math.max(0, booking.totalFare - 17.7);
  doc.text(`Ticket Fare (${booking.passengers.length} Passenger${booking.passengers.length > 1 ? 's' : ''}):`, margin + 5, curY + 12);
  doc.text(`Rs. ${ticketFare.toFixed(2)}`, margin + 70, curY + 12);

  doc.text('IRCTC / RailEase Convenience Fee (GST Inc.):', margin + 5, curY + 17);
  doc.text('Rs. 17.70', margin + 70, curY + 17);

  doc.text('Travel Insurance Scheme:', margin + 5, curY + 22);
  doc.text('FREE (Included)', margin + 70, curY + 22);

  doc.setDrawColor(203, 213, 225);
  doc.line(margin + 5, curY + 25, margin + 90, curY + 25);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('TOTAL AMOUNT PAID:', margin + 5, curY + 30);
  doc.setTextColor(37, 99, 235);
  doc.setFontSize(9);
  doc.text(`Rs. ${booking.totalFare.toFixed(2)}`, margin + 70, curY + 30);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(100, 116, 139);
  doc.text(`Payment Gateway: ${booking.payment?.paymentGateway || 'RailEase Pay'}`, margin + 5, curY + 36);
  doc.text(`Txn ID: ${booking.payment?.transactionId || 'TXN-RAIL-000000'}  |  Mode: ${booking.payment?.paymentMethod || 'UPI'}`, margin + 5, curY + 40);

  // Right side: Real Scannable QR Code
  const qrX = margin + contentWidth - 40;
  if (qrDataUrl) {
    doc.addImage(qrDataUrl, 'PNG', qrX, curY + 4, 34, 34);
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(6);
    doc.setFont('helvetica', 'bold');
    doc.text('SCAN TO VERIFY LIVE PNR', qrX + 1, curY + 41);
  }

  curY += boxHeight + 8;

  // 7. Cancellation details if cancelled
  if (isCancelled && booking.cancellationRefund !== null && booking.cancellationRefund !== undefined) {
    doc.setFillColor(254, 242, 242);
    doc.setDrawColor(254, 205, 211);
    doc.roundedRect(margin, curY, contentWidth, 14, 2, 2, 'FD');

    doc.setTextColor(159, 18, 57);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.text('CANCELLATION & REFUND RECORD:', margin + 4, curY + 5);

    doc.setFont('helvetica', 'normal');
    doc.text(`Refund Amount: Rs. ${booking.cancellationRefund.toFixed(2)}  |  Reason: ${booking.cancellationReason || 'Passenger Request'}`, margin + 4, curY + 9.5);
    doc.text('Status: Refund credited back to original payment account within 3-5 banking business days (Simulated).', margin + 4, curY + 13);

    curY += 18;
  }

  // 8. Important Passenger Instructions
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin, curY, contentWidth, 24, 1.5, 1.5, 'F');

  doc.setTextColor(51, 65, 85);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('IMPORTANT PASSENGER INSTRUCTIONS:', margin + 4, curY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(71, 85, 105);
  doc.text('1. One of the passengers booked on an E-Ticket must carry an original valid photo identity card during the journey.', margin + 4, curY + 9);
  doc.text('   Valid IDs: Aadhaar Card, Passport, PAN Card, Voter ID, Driving License, Student ID from recognized institution.', margin + 4, curY + 12.5);
  doc.text('2. Chart preparation typically occurs 4 hours prior to scheduled departure from the train originating station.', margin + 4, curY + 16);
  doc.text('3. RailEase is a modern demonstration platform simulating Indian Railways reservations with zero financial liability.', margin + 4, curY + 19.5);

  // 9. Document Footer
  const footerY = pageHeight - 10;
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, footerY - 3, margin + contentWidth, footerY - 3);

  doc.setTextColor(148, 163, 184);
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.text('RailEase Electronic Ticket Slip (ERS)  •  Official Demonstration Prototype', margin, footerY);
  doc.text('24x7 Customer Helpline: Dial 139  •  support@railease.in', margin + contentWidth - 65, footerY);

  // 10. Save and Trigger PDF Download
  doc.save(`RailEase_Ticket_${booking.pnr}.pdf`);
}
