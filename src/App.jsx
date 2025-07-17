import React, { useEffect, useState } from "react";
import ScheduleForm from "./components/ScheduleForm";
import TimeSlotGrid from "./components/TimeSlotGrid";
import ExportPDFButton from "./components/ExportPDFButton";
import SchedulePreviewModal from "./components/SchedulePreviewModal";

import {
  initialRooms,
  initialDays,
  initialSubjects,
  initialSections,
  initialFaculty,
} from "./data/initialData";

import { db } from "../src/firebase";
import {
  collection,
  getDocs,
  setDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";

const App = () => {
  const [schedules, setSchedules] = useState([]);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [selectedDay, setSelectedDay] = useState(initialDays[0]);
  const [selectedRoom, setSelectedRoom] = useState(initialRooms[0]);

  const [selectedProgram, setSelectedProgram] = useState("IT");
  const [selectedSemester, setSelectedSemester] = useState("1st Semester");
  const [selectedYearLevel, setSelectedYearLevel] = useState("1st Year");

  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewFilterBy, setPreviewFilterBy] = useState(null);

  const schedulesCollection = collection(db, "schedules");

  useEffect(() => {
    const fetchSchedules = async () => {
      const querySnapshot = await getDocs(schedulesCollection);
      const data = querySnapshot.docs.map((doc) => doc.data());
      setSchedules(data);
    };
    fetchSchedules();
  }, []);

  const addOrUpdateSchedule = async (newSchedule) => {
    setSchedules((prev) => {
      const exists = prev.some((s) => s.id === newSchedule.id);
      return exists
        ? prev.map((s) => (s.id === newSchedule.id ? newSchedule : s))
        : [...prev, newSchedule];
    });
    setEditingSchedule(null);

    await setDoc(doc(db, "schedules", newSchedule.id.toString()), newSchedule);
  };

  const handleEdit = (schedule) => {
    setEditingSchedule(schedule);
  };

  const handleDelete = async (id) => {
    setSchedules((prev) => prev.filter((s) => s.id !== id));
    await deleteDoc(doc(db, "schedules", id.toString()));
  };

  const isMidyear = selectedSemester === "Midyear";
  const filteredSubjects = isMidyear
    ? initialSubjects?.[selectedProgram]?.[selectedSemester] || []
    : initialSubjects?.[selectedProgram]?.[selectedSemester]?.[0]?.[
        selectedYearLevel
      ] || [];

  const filteredSections = isMidyear
    ? Object.values(initialSections[selectedProgram]).flat()
    : initialSections?.[selectedProgram]?.[selectedYearLevel] || [];

  const filteredForPreview = () => {
    if (!previewFilterBy) return schedules;

    const grouped = {};
    for (const sched of schedules) {
      const key = sched[previewFilterBy];
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(sched);
    }

    return Object.entries(grouped).flatMap(([group, items]) => [
      { id: `group-${group}`, groupLabel: group, isGroup: true },
      ...items,
    ]);
  };
  const handleOpenPreview = (filter) => {
    setPreviewFilterBy(filter);
    setPreviewModalOpen(true);
  };
  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-900 p-4 sm:p-6 md:p-8">
      <header className="text-center lg:text-left mb-10 flex flex-col items-center lg:flex-row lg:justify-center gap-4">
        <img
          width="100"
          height="100"
          src="/dhan.jpg"
          alt="Jovelina Gift"
          className="rounded-full shadow-md"
        />
        <div>
          <h1 className="text-4xl font-extrabold text-blue-700">
            DCS Faculty Room Scheduling
          </h1>
          <p className="text-lg text-gray-600 mt-2">
            Pa-birthday ko sayo to Jovelina, Thank you ka naman!
          </p>
          <p className="text-lg text-gray-600 mt-2">
            Sana di ka na mahirapan sa pag-schedule ng rooms mo!
          </p>
        </div>
      </header>

      {/* Program Selection Panel */}
      <div className="max-w-xl mx-auto mb-8 bg-white shadow p-4 rounded-lg grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Program</label>
          <select
            value={selectedProgram}
            onChange={(e) => setSelectedProgram(e.target.value)}
            className="w-full border border-gray-300 rounded px-2 py-1"
          >
            {Object.keys(initialSubjects).map((prog) => (
              <option key={prog} value={prog}>
                {prog}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Semester</label>
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="w-full border border-gray-300 rounded px-2 py-1"
          >
            {Object.keys(initialSubjects[selectedProgram]).map((sem) => (
              <option key={sem} value={sem}>
                {sem}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Year Level</label>
          <select
            value={selectedYearLevel}
            onChange={(e) => setSelectedYearLevel(e.target.value)}
            disabled={isMidyear}
            className={`w-full border border-gray-300 rounded px-2 py-1 ${
              isMidyear ? "bg-gray-100 text-gray-500" : ""
            }`}
          >
            {Object.keys(initialSections[selectedProgram]).map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      <main className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
        <div>
          <ScheduleForm
            rooms={initialRooms}
            days={initialDays}
            subjects={filteredSubjects}
            sections={filteredSections}
            faculty={initialFaculty}
            schedules={schedules}
            onAddSchedule={addOrUpdateSchedule}
            editingSchedule={editingSchedule}
            selectedProgram={selectedProgram}
            selectedSemester={selectedSemester}
            selectedYearLevel={selectedYearLevel}
          />

          <div className="mt-4 w-80 flex flex-col gap-2">
            <div className="mt-4 w-80 flex flex-col gap-2">
              <ExportPDFButton schedules={schedules} />
              <ExportPDFButton schedules={schedules} filterBy="room" />
              <ExportPDFButton schedules={schedules} filterBy="faculty" />
              <ExportPDFButton schedules={schedules} filterBy="section" />
            </div>

            <div className="mt-4 w-80 flex flex-col gap-2">
              <button
                onClick={() => handleOpenPreview(null)}
                className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              >
                Preview All
              </button>
              <button
                onClick={() => handleOpenPreview("room")}
                className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              >
                Preview by Room
              </button>
              <button
                onClick={() => handleOpenPreview("faculty")}
                className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              >
                Preview by Faculty
              </button>
              <button
                onClick={() => handleOpenPreview("section")}
                className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              >
                Preview by Section
              </button>
            </div>
          </div>
        </div>

        <TimeSlotGrid
          schedules={schedules}
          rooms={initialRooms}
          days={initialDays}
          selectedDay={selectedDay}
          setSelectedDay={setSelectedDay}
          selectedRoom={selectedRoom}
          setSelectedRoom={setSelectedRoom}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </main>

      <SchedulePreviewModal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        schedules={filteredForPreview()}
        filterBy={previewFilterBy}
        title={
          previewFilterBy
            ? `Preview by ${
                previewFilterBy.charAt(0).toUpperCase() +
                previewFilterBy.slice(1)
              }`
            : "All Schedule Preview"
        }
      />
    </div>
  );
};

export default App;
