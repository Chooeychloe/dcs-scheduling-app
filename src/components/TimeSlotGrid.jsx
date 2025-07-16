// src/components/TimeSlotGrid.jsx
import React, { useState } from "react";
import { timeToMinutes, allTimeSlots } from "../utils/timeUtils";
import { FaTrash, FaEdit } from "react-icons/fa";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";

const colorPalette = [
  "bg-blue-100 border-blue-500 text-blue-800",
  "bg-green-100 border-green-500 text-green-800",
  "bg-yellow-100 border-yellow-500 text-yellow-800",
  "bg-purple-100 border-purple-500 text-purple-800",
  "bg-pink-100 border-pink-500 text-pink-800",
  "bg-indigo-100 border-indigo-500 text-indigo-800",
];

const TimeSlotGrid = ({
  schedules,
  rooms,
  days,
  selectedDay,
  setSelectedDay,
  selectedRoom,
  setSelectedRoom,
  onEdit,
  onDelete,
}) => {
  const [confirmId, setConfirmId] = useState(null);

  const getScheduleAtSlot = (day, room, timeSlot) => {
    const slotStartMinutes = timeToMinutes(timeSlot);
    for (const schedule of schedules) {
      const scheduleStart = timeToMinutes(schedule.startTime);
      const scheduleEnd = scheduleStart + schedule.duration;
      if (
        schedule.day === day &&
        schedule.room === room &&
        slotStartMinutes >= scheduleStart &&
        slotStartMinutes < scheduleEnd
      ) {
        return schedule;
      }
    }
    return null;
  };

  const getColorClass = (id) => {
    const index = schedules.findIndex((s) => s.id === id);
    return colorPalette[index % colorPalette.length];
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 overflow-x-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Room Schedules</h2>

      {/* Day Selection Buttons */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          View Day:
        </label>
        <div className="flex flex-wrap gap-2">
          {days.map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out ${
                selectedDay === day
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      {/* Room Selection Buttons */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          View Room:
        </label>
        <div className="flex flex-wrap gap-2">
          {rooms.map((room) => (
            <button
              key={room}
              onClick={() => setSelectedRoom(room)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out ${
                selectedRoom === room
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {room}
            </button>
          ))}
        </div>
      </div>

      {/* Schedule Grid */}
      {selectedDay && selectedRoom ? (
        <div className="grid grid-cols-[auto_1fr] border border-gray-300 rounded-lg overflow-hidden">
          <div className="col-span-1 bg-gray-100 p-2 border-b border-r border-gray-300 font-semibold text-gray-700 text-center sticky left-0 z-10">
            Time
          </div>
          <div className="col-span-1 bg-gray-100 p-2 border-b border-gray-300 font-semibold text-gray-700 text-center">
            Schedule for {selectedRoom} on {selectedDay}
          </div>

          {allTimeSlots.map((timeSlot) => {
            const schedule = getScheduleAtSlot(
              selectedDay,
              selectedRoom,
              timeSlot
            );
            const isOccupied = !!schedule;
            const scheduleStart = schedule
              ? timeToMinutes(schedule.startTime)
              : -1;
            const slotStart = timeToMinutes(timeSlot);
            const isStartOfSchedule = isOccupied && scheduleStart === slotStart;

            return (
              <React.Fragment
                key={`${selectedDay}-${selectedRoom}-${timeSlot}`}
              >
                <div className="p-2 border-r border-b border-gray-300 bg-gray-50 text-gray-600 font-mono text-xs sm:text-sm text-center sticky left-0 z-10">
                  {timeSlot}
                </div>
                <div
                  className={`p-2 border-b border-gray-300 text-xs sm:text-sm flex items-center justify-between min-h-[40px] ${
                    isOccupied
                      ? `${getColorClass(schedule.id)} border-l-4`
                      : "bg-white text-gray-500"
                  }`}
                >
                  {isStartOfSchedule ? (
                    <div className="w-full flex justify-between items-center">
                      <div>
                        <p className="font-semibold">
                          {schedule.subject} ({schedule.section})
                        </p>
                        <p className="text-xs">Faculty: {schedule.faculty}</p>
                        <p className="text-xs">
                          {schedule.startTime} - {schedule.endTime}
                        </p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          data-tooltip-id={`edit-${schedule.id}`}
                          onClick={() => onEdit(schedule)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white p-1 rounded text-xs"
                        >
                          <FaEdit />
                        </button>
                        <Tooltip
                          id={`edit-${schedule.id}`}
                          content="Edit Schedule"
                        />

                        <button
                          data-tooltip-id={`delete-${schedule.id}`}
                          onClick={() => setConfirmId(schedule.id)}
                          className="bg-red-600 hover:bg-red-700 text-white p-1 rounded text-xs"
                        >
                          <FaTrash />
                        </button>
                        <Tooltip
                          id={`delete-${schedule.id}`}
                          content="Delete Schedule"
                        />
                      </div>
                    </div>
                  ) : isOccupied ? null : (
                    <span>Available</span>
                  )}
                </div>
              </React.Fragment>
            );
          })}
        </div>
      ) : (
        <p className="text-center text-gray-500 text-lg mt-8">
          Please select a Day and a Room to view the schedule.
        </p>
      )}

      {/* Confirm Delete Modal */}
      {confirmId !== null && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-sm text-center">
            <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete this schedule?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  onDelete(confirmId);
                  setConfirmId(null);
                }}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Delete
              </button>
              <button
                onClick={() => setConfirmId(null)}
                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeSlotGrid;
