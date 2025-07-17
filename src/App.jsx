import React, { useEffect, useState } from "react";
import ScheduleForm from "./components/ScheduleForm";
import TimeSlotGrid from "./components/TimeSlotGrid";
import ExportPDFButton from "./components/ExportPDFButton";
import SchedulePreviewModal from "./components/PreviewModal";

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
  const [selectedFaculty, setSelectedFaculty] = useState(initialFaculty[0]);
  const [selectedSection, setSelectedSection] = useState(
    Object.values(initialSections)
      .flatMap((year) => Object.values(year).flat())
      .filter(Boolean)[0]
  );

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalFilter, setModalFilter] = useState({ type: null, value: null });

  const filteredForModal = () => {
    if (modalFilter?.type && modalFilter?.value) {
      return schedules.filter((s) => s[modalFilter.type] === modalFilter.value);
    }
    return schedules;
  };

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

  const handleEdit = (schedule) => setEditingSchedule(schedule);

  const handleDelete = async (id) => {
    setSchedules((prev) => prev.filter((s) => s.id !== id));
    await deleteDoc(doc(db, "schedules", id.toString()));
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

      <main className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
        <div>
          <ScheduleForm
            rooms={initialRooms}
            days={initialDays}
            subjects={initialSubjects}
            sections={initialSections}
            faculty={initialFaculty}
            schedules={schedules}
            onAddSchedule={addOrUpdateSchedule}
            editingSchedule={editingSchedule}
          />

          {/* Export and Preview Filters */}
          <div className="mt-6 w-80 flex flex-col gap-3">
            {/* Room Filter */}
            <label className="text-sm font-medium">Room</label>
            <select
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(e.target.value)}
              className="border p-2 rounded"
            >
              {initialRooms.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
            <ExportPDFButton schedules={schedules} filterBy={{ type: "room", value: selectedRoom }} />
            <button
              onClick={() => {
                setModalFilter({ type: "room", value: selectedRoom });
                setShowModal(true);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Preview by Room
            </button>

            {/* Faculty Filter */}
            <label className="text-sm font-medium">Faculty</label>
            <select
              value={selectedFaculty}
              onChange={(e) => setSelectedFaculty(e.target.value)}
              className="border p-2 rounded"
            >
              {initialFaculty.map((f) => (
                <option key={f}>{f}</option>
              ))}
            </select>
            <ExportPDFButton schedules={schedules} filterBy={{ type: "faculty", value: selectedFaculty }} />
            <button
              onClick={() => {
                setModalFilter({ type: "faculty", value: selectedFaculty });
                setShowModal(true);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Preview by Faculty
            </button>

            {/* Section Filter */}
            <label className="text-sm font-medium">Section</label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="border p-2 rounded"
            >
              {Object.values(initialSections)
                .flatMap((year) => Object.values(year).flat())
                .map((sec) => (
                  <option key={sec}>{sec}</option>
                ))}
            </select>
            <ExportPDFButton schedules={schedules} filterBy={{ type: "section", value: selectedSection }} />
            <button
              onClick={() => {
                setModalFilter({ type: "section", value: selectedSection });
                setShowModal(true);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Preview by Section
            </button>

            {/* Export and Preview All */}
            <ExportPDFButton schedules={schedules} />
            <button
              onClick={() => {
                setModalFilter({ type: null, value: null });
                setShowModal(true);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition mt-1"
            >
              Preview All
            </button>
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

      {/* Modal Preview */}
      <SchedulePreviewModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        schedules={filteredForModal()}
        title={
          modalFilter?.type
            ? `Schedules by ${modalFilter.type}: ${modalFilter.value}`
            : "All Schedules"
        }
      />
    </div>
  );
};

export default App;
