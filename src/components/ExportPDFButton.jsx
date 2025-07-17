import React from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

const ExportPDFButton = ({ schedules, filterBy }) => {
  const handleExportPDF = async () => {
    let filteredSchedules = schedules;
    let title = "All Schedules";

    if (filterBy?.type && filterBy?.value) {
      filteredSchedules = schedules.filter(
        (s) => s[filterBy.type] === filterBy.value
      );
      title = `Schedules by ${capitalize(filterBy.type)}: ${filterBy.value}`;
    }

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(title, 14, 20);

    const headers = [
      ["Program", "Year", "Subject", "Section", "Faculty", "Start", "End", "Duration", "Day", "Room"]
    ];
    const data = filteredSchedules.map((s) => [
      s.program || "-",
      s.yearLevel || "-",
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

    const filename = `schedule_${filterBy?.type || "all"}_${filterBy?.value || "all"}_${Date.now()}.pdf`;
    doc.save(filename);

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

  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  return (
    <button
      onClick={handleExportPDF}
      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
    >
      Export {filterBy?.type ? `(${capitalize(filterBy.type)}: ${filterBy.value})` : "All"}
    </button>
  );
};

export default ExportPDFButton;
