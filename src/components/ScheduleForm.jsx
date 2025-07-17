import React, { useState, useEffect, useCallback } from 'react';
import Select from 'react-select';
import { timeToMinutes, minutesToTime, allTimeSlots } from '../utils/timeUtils';
import {
  FaCalendarDay,
  FaChalkboardTeacher,
  FaClock,
  FaLayerGroup,
  FaBook,
  FaUser,
  FaDoorOpen,
} from 'react-icons/fa';

const ScheduleForm = ({
  rooms,
  days,
  subjects,
  sections,
  faculty,
  onAddSchedule,
  schedules,
  editingSchedule,
}) => {
  const [program, setProgram] = useState('');
  const [yearLevel, setYearLevel] = useState('');
  const [subject, setSubject] = useState('');
  const [section, setSection] = useState('');
  const [facultyMember, setFacultyMember] = useState('');
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState(30);
  const [selectedRoom, setSelectedRoom] = useState('');
  const [selectedDay, setSelectedDay] = useState('');
  const [endTime, setEndTime] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  useEffect(() => {
    if (editingSchedule) {
      setProgram(editingSchedule.program || '');
      setYearLevel(editingSchedule.yearLevel || '');
      setSubject(editingSchedule.subject);
      setSection(editingSchedule.section);
      setFacultyMember(editingSchedule.faculty);
      setStartTime(editingSchedule.startTime);
      setDuration(editingSchedule.duration);
      setSelectedRoom(editingSchedule.room);
      setSelectedDay(editingSchedule.day);
    }
  }, [editingSchedule]);

  useEffect(() => {
    if (startTime && duration) {
      const startMinutes = timeToMinutes(startTime);
      const endMinutes = startMinutes + parseInt(duration, 10);
      if (endMinutes > timeToMinutes('09:00 PM')) {
        setEndTime('Beyond 9:00 PM');
        setMessage('The selected duration extends beyond 9:00 PM. Please adjust.');
        setMessageType('error');
      } else {
        setEndTime(minutesToTime(endMinutes));
        setMessage('');
      }
    } else {
      setEndTime('');
      setMessage('');
    }
  }, [startTime, duration]);

  useEffect(() => {
    setSubject('');
    setSection('');
  }, [program, yearLevel]);

  const checkConflict = useCallback(
    (newSchedule) => {
      const newStartMinutes = timeToMinutes(newSchedule.startTime);
      const newEndMinutes = newStartMinutes + parseInt(newSchedule.duration, 10);

      for (const existing of schedules) {
        if (editingSchedule && existing.id === editingSchedule.id) continue;
        const existingStart = timeToMinutes(existing.startTime);
        const existingEnd = existingStart + existing.duration;
        const hasOverlap =
          newStartMinutes < existingEnd && newEndMinutes > existingStart;

        if (existing.day === newSchedule.day && hasOverlap) {
          if (existing.room === newSchedule.room)
            return `Room Conflict: ${existing.room} already booked on ${existing.day}.`;
          if (existing.section === newSchedule.section)
            return `Section Conflict: ${existing.section} already has a class on ${existing.day}.`;
          if (existing.faculty === newSchedule.faculty)
            return `Faculty Conflict: ${existing.faculty} has another class.`;
        }
      }
      return null;
    },
    [schedules, editingSchedule]
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!program || !yearLevel || !subject || !section || !facultyMember || !startTime || !duration || !selectedRoom || !selectedDay) {
      setMessage('Please fill in all required fields.');
      setMessageType('error');
      return;
    }

    if (endTime === 'Beyond 9:00 PM') {
      setMessage('Invalid time range.');
      setMessageType('error');
      return;
    }

    const newSchedule = {
      id: editingSchedule ? editingSchedule.id : Date.now(),
      program,
      yearLevel,
      subject,
      section,
      faculty: facultyMember,
      startTime,
      duration: parseInt(duration, 10),
      endTime,
      room: selectedRoom,
      day: selectedDay,
    };

    const conflict = checkConflict(newSchedule);
    if (conflict) {
      setMessage(conflict);
      setMessageType('error');
      return;
    }

    onAddSchedule(newSchedule);
    setMessage(editingSchedule ? 'Schedule updated!' : 'Schedule added!');
    setMessageType('success');

    // Reset form
    setProgram('');
    setYearLevel('');
    setSubject('');
    setSection('');
    setFacultyMember('');
    setStartTime('');
    setDuration(30);
    setSelectedRoom('');
    setSelectedDay('');
  };

  const durationOptions = Array.from({ length: 24 }, (_, i) => 30 * (i + 1));

  const renderSearchableSelect = (label, icon, value, setValue, options, placeholder) => {
    const formattedOptions = options.map((opt) => ({ value: opt, label: opt }));
    return (
      <div className="flex flex-col">
        <label className="mb-1 text-sm font-medium text-gray-700 flex items-center gap-2">
          {icon} {label}
        </label>
        <Select
          value={value ? { value, label: value } : null}
          onChange={(selected) => setValue(selected ? selected.value : '')}
          options={formattedOptions}
          placeholder={placeholder}
          isClearable
          className="text-sm"
          styles={{
            control: (base) => ({
              ...base,
              borderColor: '#d1d5db',
              minHeight: '38px',
            }),
          }}
        />
      </div>
    );
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {editingSchedule ? 'Edit Schedule' : 'Add New Schedule'}
      </h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderSearchableSelect('Program', <FaUser className="text-blue-500" />, program, setProgram, ['Information Technology', 'Computer Science'], 'Select Program')}
        {renderSearchableSelect('Year Level', <FaUser className="text-blue-500" />, yearLevel, setYearLevel, ['1st Year', '2nd Year', '3rd Year', '4th Year'], 'Select Year Level')}
        {renderSearchableSelect('Day', <FaCalendarDay className="text-blue-500" />, selectedDay, setSelectedDay, days, 'Select Day')}
        {renderSearchableSelect('Room', <FaDoorOpen className="text-blue-500" />, selectedRoom, setSelectedRoom, rooms, 'Select Room')}
        {renderSearchableSelect('Subject', <FaBook className="text-blue-500" />, subject, setSubject, program && yearLevel ? subjects[program]?.[yearLevel] || [] : [], 'Select Subject')}
        {renderSearchableSelect('Section', <FaLayerGroup className="text-blue-500" />, section, setSection, program && yearLevel ? sections[program]?.[yearLevel] || [] : [], 'Select Section')}
        {renderSearchableSelect('Faculty', <FaChalkboardTeacher className="text-blue-500" />, facultyMember, setFacultyMember, faculty, 'Select Faculty')}

        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium text-gray-700 flex items-center gap-2">
            <FaClock className="text-blue-500" /> Start Time
          </label>
          <select
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
          >
            <option value="" disabled>Select Start Time</option>
            {allTimeSlots.slice(0, -1).map((time) => (
              <option key={time} value={time}>{time}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium text-gray-700 flex items-center gap-2">
            <FaClock className="text-blue-500" /> Duration (mins)
          </label>
          <select
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
          >
            {durationOptions.map((mins) => (
              <option key={mins} value={mins}>{mins}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium text-gray-700 flex items-center gap-2">
            <FaClock className="text-blue-500" /> End Time
          </label>
          <input
            type="text"
            value={endTime}
            readOnly
            className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-sm text-gray-600"
          />
        </div>

        <div className="md:col-span-2">
          <button
            type="submit"
            className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition"
          >
            {editingSchedule ? 'Update Schedule' : 'Add Schedule'}
          </button>
        </div>
      </form>

      {message && (
        <p className={`mt-4 text-sm ${messageType === 'success' ? 'text-green-600' : 'text-red-600'}`}>
          {message}
        </p>
      )}
    </div>
  );
};

export default ScheduleForm;
