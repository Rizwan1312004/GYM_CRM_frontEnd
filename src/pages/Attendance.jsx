/**
 * -----------------------------------------------------------------------------
 * FILE: src/pages/Attendance.jsx
 * 
 * WHAT THIS FILE DOES:
 * This page displays a full calendar view to track member attendance.
 * You can click on any day to see who attended and who was absent.
 * You can also mark new attendance records for a specific day.
 * 
 * KEY REACT CONCEPTS USED:
 * - date-fns library: Extensively used here for date math (next month, days in month).
 * - Complex State: Manages the current calendar view date, selected date for the modal,
 *   and lists of both attendances and members.
 * - Array Filtering & Mapping: To show the right records on the right calendar square.
 * -----------------------------------------------------------------------------
 */

import React, { useState, useEffect } from "react";
import api from "../services/api";

// date-fns is a popular library for manipulating dates in JavaScript
import {
  format,             // Formats a date object into a string (e.g., "MMMM yyyy" -> "October 2023")
  addMonths,          // Adds 1 month to a date
  subMonths,          // Subtracts 1 month from a date
  startOfMonth,       // Gets the first day of the month
  endOfMonth,         // Gets the last day of the month
  eachDayOfInterval,  // Returns an array of every day between two dates
  isSameMonth,
  isSameDay,          // Checks if two dates are exactly the same day
  parseISO,           // Converts a string like "2023-10-25" into a JavaScript Date object
} from "date-fns";

import { ChevronLeft, ChevronRight, X, UserCheck, UserX } from "lucide-react";
import toast from "react-hot-toast";

/**
 * COMPONENT: Attendance
 */
export default function Attendance() {
  // --- STATE VARIABLES ---

  // `currentDate` determines which month the calendar is currently showing.
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Stores all attendance records for the currently viewed month
  const [attendances, setAttendances] = useState([]);
  
  // Stores the list of all members (needed for the dropdown when marking attendance)
  const [members, setMembers] = useState([]);
  
  // Loading spinner state
  const [isLoading, setIsLoading] = useState(false);

  // --- MODAL STATE ---
  
  // Which specific calendar day did the user click on?
  const [selectedDate, setSelectedDate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Data for the "Mark New Attendance" form
  const [attendanceForm, setAttendanceForm] = useState({
    memberId: "",
    status: "present", // Defaults to "present"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- CALENDAR LOGIC ---
  
  // 1. Find the start and end of the currently viewed month
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  
  // 2. Generate an array containing every single day in this month
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // 3. To make the calendar line up with the correct days of the week (Sun-Sat),
  // we figure out what day of the week the 1st of the month falls on.
  const startDayOfWeek = monthStart.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  // 4. Create an array of `null` values to represent empty squares before the 1st
  const paddingDays = Array(startDayOfWeek).fill(null);
  
  // 5. Combine the empty squares and the actual days into one big array to render
  const calendarDays = [...paddingDays, ...daysInMonth];

  /**
   * FUNCTION: fetchMonthData
   * Fetches attendance for the specific month/year currently being viewed.
   */
  const fetchMonthData = async (date) => {
    setIsLoading(true);
    try {
      // Extract just the year and month string from the Date object to send to the API
      const year = format(date, "yyyy");
      const month = format(date, "MM");

      // Fetch attendance and the list of members simultaneously
      const [attRes, memRes] = await Promise.all([
        api.get(`/attendance/?year=${year}&month=${month}`),
        api.get(`/members/`),
      ]);

      // Save data, handling different possible API response shapes (arrays vs paginated objects)
      setAttendances(
        Array.isArray(attRes.data) ? attRes.data : attRes.data.results || [],
      );
      setMembers(
        Array.isArray(memRes.data) ? memRes.data : memRes.data.results || [],
      );
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * HOOK: useEffect
   * This effect depends on `currentDate`. 
   * It will run once when the component mounts, AND whenever the user changes the month.
   */
  useEffect(() => {
    fetchMonthData(currentDate);
  }, [currentDate]); // <--- Dependency array. Triggers effect when this changes.

  // Handlers to change the month being viewed
  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  // Handler for clicking a specific day square on the calendar
  const openDateModal = (date) => {
    setSelectedDate(date);
    setIsModalOpen(true);
    // Reset the form when opening
    setAttendanceForm({ memberId: "", status: "present" });
  };

  const closeDateModal = () => {
    setIsModalOpen(false);
    setSelectedDate(null);
  };

  /**
   * HANDLER: handleSubmitAttendance
   * Saves a new attendance record for the selected date.
   */
  const handleSubmitAttendance = async (e) => {
    e.preventDefault();
    if (!attendanceForm.memberId || !selectedDate) return;

    setIsSubmitting(true);
    try {
      await api.post(`/attendance/`, {
        member: attendanceForm.memberId,
        date: format(selectedDate, "yyyy-MM-dd"), // Format date for backend (e.g. "2023-10-25")
        status: attendanceForm.status,
      });
      // Refresh the month's data to show the new record on the calendar
      fetchMonthData(currentDate);
      closeDateModal();
      toast.success("Attendance marked successfully!");
    } catch (error) {
      console.error("Failed to mark attendance:", error);
      // Try to show a specific error message from the backend, otherwise a generic one
      toast.error(
        error.response?.data?.non_field_errors?.[0] ||
          "Failed to mark attendance.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * HELPER FUNCTION: getAttendanceForDay
   * Takes a specific Date, and filters the big `attendances` array to find
   * only the records that occurred on that specific day.
   */
  const getAttendanceForDay = (date) => {
    if (!date) return [];
    return attendances.filter((a) => isSameDay(parseISO(a.date), date));
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
      {/* --- HEADER --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Attendance Calendar
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Track and manage member attendance
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* --- CALENDAR HEADER CONTROLS --- */}
        <div className="p-6 flex items-center justify-between border-b border-slate-100 bg-slate-50/50">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 hover:shadow-sm text-slate-600 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            {/* Display e.g. "October 2023" */}
            {format(currentDate, "MMMM yyyy")}
            
            {/* Show a small loading spinner next to the month name if fetching data */}
            {isLoading && (
              <span className="w-4 h-4 rounded-full border-2 border-slate-300 border-t-blue-600 animate-spin ml-2"></span>
            )}
          </h2>

          <button
            onClick={handleNextMonth}
            className="p-2 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 hover:shadow-sm text-slate-600 transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* --- DAYS OF WEEK HEADER --- */}
        {/* grid-cols-7 creates exactly 7 equal columns */}
        <div className="grid grid-cols-7 border-b border-slate-200">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="py-3 text-center text-sm font-semibold text-slate-500 uppercase tracking-wider bg-slate-50"
            >
              {day}
            </div>
          ))}
        </div>

        {/* --- CALENDAR GRID --- */}
        {/* auto-rows-fr makes all rows stretch to fill available space equally */}
        <div className="grid grid-cols-7 auto-rows-fr">
          {/* Loop over our calculated calendarDays array (includes the null padding days) */}
          {calendarDays.map((day, idx) => {
            const isPadding = day === null;
            const isToday = day && isSameDay(day, new Date());
            
            // Get the specific attendance records for just this one day square
            const dayRecords = day ? getAttendanceForDay(day) : [];
            
            // Count how many presents and absents there are for this day
            const presentCount = dayRecords.filter(
              (r) => r.status === "present",
            ).length;
            const absentCount = dayRecords.filter(
              (r) => r.status === "absent",
            ).length;

            return (
              <div
                key={idx}
                // Only allow clicking if it's an actual day (not an empty padding square)
                onClick={() => !isPadding && openDateModal(day)}
                className={`
                  min-h-[120px] p-2 border-b border-r border-slate-100 relative group
                  ${isPadding ? "bg-slate-50 border-transparent" : "bg-white hover:bg-blue-50/50 cursor-pointer transition-colors"}
                  ${(idx + 1) % 7 === 0 ? "border-r-0" : ""}
                `}
              >
                {!isPadding && (
                  <>
                    <div className="flex justify-between items-start">
                      {/* Day Number (e.g. 15) */}
                      <span
                        className={`
                        text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full
                        ${isToday ? "bg-blue-600 text-white shadow-sm" : "text-slate-700"}
                      `}
                      >
                        {format(day, "d")}
                      </span>

                      {/* Small '+' icon that appears on hover */}
                      {true && (
                        <span className="opacity-0 group-hover:opacity-100 text-blue-500 bg-blue-100 w-6 h-6 rounded-md flex items-center justify-center transition-opacity text-lg">
                          +
                        </span>
                      )}
                    </div>

                    {/* Daily Summary Tags */}
                    {/* These show up inside the square if there are records for that day */}
                    <div className="mt-2 space-y-1.5 flex flex-col items-start px-1">
                      {presentCount > 0 && (
                        <div className="flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md w-full max-w-full overflow-hidden">
                          <UserCheck className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">
                            {presentCount} Present
                          </span>
                        </div>
                      )}
                      {absentCount > 0 && (
                        <div className="flex items-center gap-1 text-xs font-medium text-rose-700 bg-rose-100/80 px-2 py-0.5 rounded-md w-full max-w-full overflow-hidden">
                          <UserX className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{absentCount} Absent</span>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* --- MARK ATTENDANCE MODAL --- */}
      {/* Opens when a user clicks on a calendar square */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100 bg-slate-50/50">
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  Attendance for {format(selectedDate, "MMMM d, yyyy")}
                </h3>
              </div>
              <button
                onClick={closeDateModal}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              
              {/* --- LIST OF EXISTING RECORDS FOR THIS DAY --- */}
              <div className="mb-8">
                <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
                  Recorded Today ({getAttendanceForDay(selectedDate).length})
                </h4>
                
                {getAttendanceForDay(selectedDate).length === 0 ? (
                  // Empty state
                  <div className="text-sm text-slate-500 bg-slate-50 rounded-lg p-4 border border-slate-100 border-dashed text-center">
                    No attendance records for this date yet.
                  </div>
                ) : (
                  // List of records
                  <div className="max-h-48 overflow-y-auto pr-2 space-y-2">
                    {getAttendanceForDay(selectedDate).map((record) => (
                      <div
                        key={record.id}
                        className="flex items-center justify-between bg-white border border-slate-200 p-3 rounded-xl shadow-sm"
                      >
                        <span className="font-medium text-slate-700 flex items-center gap-3">
                          {/* Circle Avatar with Initials */}
                          <div className="w-8 h-8 rounded-full bg-slate-100 flexItems-center justify-center text-slate-500 font-bold text-xs uppercase">
                            {record.member_name?.substring(0, 2) || "M"}
                          </div>
                          {record.member_name}
                        </span>
                        
                        {/* Status pill (green for present, red for absent) */}
                        <span
                          className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide
                          ${record.status === "present" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}
                        `}
                        >
                          {record.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* --- FORM TO ADD A NEW RECORD --- */}
              <form
                onSubmit={handleSubmitAttendance}
                className="bg-slate-50 p-5 rounded-xl border border-slate-200"
              >
                <h4 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-blue-600" /> Mark New
                  Attendance
                </h4>

                <div className="space-y-4">
                  {/* Member Dropdown */}
                  <div>
                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">
                      Member
                    </label>
                    <select
                      required
                      value={attendanceForm.memberId}
                      onChange={(e) =>
                        setAttendanceForm({
                          ...attendanceForm,
                          memberId: e.target.value,
                        })
                      }
                      className="w-full border border-slate-300 rounded-lg py-2.5 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm bg-white"
                    >
                      <option value="">Select a member...</option>
                      {members.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name || m.email}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Custom Radio Buttons for Status */}
                  <div>
                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">
                      Status
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      
                      {/* "Present" Toggle Button */}
                      <label
                        className={`
                        flex items-center justify-center gap-2 py-2.5 border rounded-lg cursor-pointer transition-all font-medium text-sm
                        ${
                          attendanceForm.status === "present"
                            ? "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm ring-1 ring-emerald-500" // Active style
                            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"                          // Inactive style
                        }
                      `}
                      >
                        {/* The actual radio input is hidden (sr-only), we style the label instead */}
                        <input
                          type="radio"
                          name="status"
                          value="present"
                          checked={attendanceForm.status === "present"}
                          onChange={() =>
                            setAttendanceForm({
                              ...attendanceForm,
                              status: "present",
                            })
                          }
                          className="sr-only" 
                        />
                        <UserCheck className="w-4 h-4" /> Present
                      </label>

                      {/* "Absent" Toggle Button */}
                      <label
                        className={`
                        flex items-center justify-center gap-2 py-2.5 border rounded-lg cursor-pointer transition-all font-medium text-sm
                        ${
                          attendanceForm.status === "absent"
                            ? "bg-rose-50 border-rose-500 text-rose-700 shadow-sm ring-1 ring-rose-500"
                            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                        }
                      `}
                      >
                        <input
                          type="radio"
                          name="status"
                          value="absent"
                          checked={attendanceForm.status === "absent"}
                          onChange={() =>
                            setAttendanceForm({
                              ...attendanceForm,
                              status: "absent",
                            })
                          }
                          className="sr-only"
                        />
                        <UserX className="w-4 h-4" /> Absent
                      </label>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting || !attendanceForm.memberId}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg text-sm transition-all shadow-sm disabled:opacity-50 mt-2"
                  >
                    {isSubmitting ? "Saving..." : "Save Record"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
