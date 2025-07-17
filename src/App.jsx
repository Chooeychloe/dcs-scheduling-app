import React, { useEffect, useState } from "react";
import ScheduleForm from "./components/ScheduleForm";
import TimeSlotGrid from "./components/TimeSlotGrid";
import ExportPDFButton from "./components/ExportPDFButton";
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

          {/* Export Filters */}
          <div className="mt-6 w-80 flex flex-col gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Room
              </label>
              <select
                value={selectedRoom}
                onChange={(e) => setSelectedRoom(e.target.value)}
                className="w-full border rounded p-2 text-sm"
              >
                {initialRooms.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </div>

            <ExportPDFButton
              schedules={schedules}
              filterBy={{ type: "room", value: selectedRoom }}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Faculty
              </label>
              <select
                value={selectedFaculty}
                onChange={(e) => setSelectedFaculty(e.target.value)}
                className="w-full border rounded p-2 text-sm"
              >
                {initialFaculty.map((f) => (
                  <option key={f}>{f}</option>
                ))}
              </select>
            </div>

            <ExportPDFButton
              schedules={schedules}
              filterBy={{ type: "faculty", value: selectedFaculty }}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Section
              </label>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="w-full border rounded p-2 text-sm"
              >
                {Object.values(initialSections)
                  .flatMap((year) => Object.values(year).flat())
                  .map((sec) => (
                    <option key={sec}>{sec}</option>
                  ))}
              </select>
            </div>

            <ExportPDFButton
              schedules={schedules}
              filterBy={{ type: "section", value: selectedSection }}
            />
            <div className="mt-4">
              <ExportPDFButton schedules={schedules} />
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
    </div>
  );
};

export default App;
