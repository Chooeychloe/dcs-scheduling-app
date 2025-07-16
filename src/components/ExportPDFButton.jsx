import React from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase"; // Firestore only (no storage)

const ExportPDFButton = ({ schedules, filterBy }) => {
  const handleExportPDF = async () => {
    const doc = new jsPDF();
    doc.setFontSize(16);

    let title = "All Schedules";
    let filteredSchedules = schedules;

    if (filterBy) {
      title = `Schedules by ${filterBy}`;
      // You can group/filter here if you want
    }

    doc.text(title, 14, 20);

    const headers = [
      [
        "Subject",
        "Section",
        "Faculty",
        "Start",
        "End",
        "Duration",
        "Day",
        "Room",
      ],
    ];
    const data = filteredSchedules.map((s) => [
      s.subject,
      s.section,
      s.faculty,
      s.startTime,
      s.endTime,
      `${s.duration} mins`,
      s.day,
      s.room,
    ]);

    autoTable(doc, {
      startY: 30,
      head: headers,
      body: data,
    });

    // Save PDF locally
    const filename = `schedule_${filterBy || "all"}_${Date.now()}.pdf`;
    doc.save(filename);

    // Save metadata to Firestore
    try {
      await addDoc(collection(db, "exports"), {
        filename,
        filter: filterBy || "all",
        createdAt: serverTimestamp(),
        total: filteredSchedules.length,
      });

      alert("PDF exported and logged in Firestore!");
    } catch (error) {
      console.error("Failed to log export:", error);
    }
  };

  return (
    <button
      onClick={handleExportPDF}
      className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
    >
      Export as PDF {filterBy ? `(${filterBy})` : ""}
    </button>
  );
};

export default ExportPDFButton;
