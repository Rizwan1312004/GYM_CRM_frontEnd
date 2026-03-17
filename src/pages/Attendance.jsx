import React, { useState, useEffect } from "react";
import api from "../services/api";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  parseISO,
} from "date-fns";
import { ChevronLeft, ChevronRight, X, UserCheck, UserX } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

export default function Attendance() {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [attendances, setAttendances] = useState([]);
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Modal State
  const [selectedDate, setSelectedDate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [attendanceForm, setAttendanceForm] = useState({
    memberId: "",
    status: "present",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get days in current month view
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Add padding days for beginning of month to align with week days
  const startDayOfWeek = monthStart.getDay(); // 0 = Sunday
  const paddingDays = Array(startDayOfWeek).fill(null);
  const calendarDays = [...paddingDays, ...daysInMonth];

  const fetchMonthData = async (date) => {
    setIsLoading(true);
    try {
      const year = format(date, "yyyy");
      const month = format(date, "MM");

      const [attRes, memRes] = await Promise.all([
        api.get(`/attendance/?year=${year}&month=${month}`),
        api.get(`/members/`),
      ]);

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

  useEffect(() => {
    fetchMonthData(currentDate);
  }, [currentDate]);

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const openDateModal = (date) => {
    setSelectedDate(date);
    setIsModalOpen(true);
    setAttendanceForm({ memberId: "", status: "present" });
  };

  const closeDateModal = () => {
    setIsModalOpen(false);
    setSelectedDate(null);
  };

  const handleSubmitAttendance = async (e) => {
    e.preventDefault();
    if (!attendanceForm.memberId || !selectedDate) return;

    setIsSubmitting(true);
    try {
      await api.post(`/attendance/`, {
        member: attendanceForm.memberId,
        date: format(selectedDate, "yyyy-MM-dd"),
        status: attendanceForm.status,
      });
      fetchMonthData(currentDate);
      closeDateModal();
      toast.success("Attendance marked successfully!");
    } catch (error) {
      console.error("Failed to mark attendance:", error);
      toast.error(
        error.response?.data?.non_field_errors?.[0] ||
          "Failed to mark attendance.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAttendanceForDay = (date) => {
    if (!date) return [];
    return attendances.filter((a) => isSameDay(parseISO(a.date), date));
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
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
        {/* Calendar Header Controls */}
        <div className="p-6 flex items-center justify-between border-b border-slate-100 bg-slate-50/50">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 hover:shadow-sm text-slate-600 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            {format(currentDate, "MMMM yyyy")}
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

        {/* Days of Week Header */}
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

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 auto-rows-fr">
          {calendarDays.map((day, idx) => {
            const isPadding = day === null;
            const isToday = day && isSameDay(day, new Date());
            const dayRecords = day ? getAttendanceForDay(day) : [];
            const presentCount = dayRecords.filter(
              (r) => r.status === "present",
            ).length;
            const absentCount = dayRecords.filter(
              (r) => r.status === "absent",
            ).length;

            return (
              <div
                key={idx}
                onClick={() =>
                  !isPadding && user?.role === "admin" && openDateModal(day)
                }
                className={`
                  min-h-[120px] p-2 border-b border-r border-slate-100 relative group
                  ${isPadding ? "bg-slate-50 border-transparent" : "bg-white hover:bg-blue-50/50 cursor-pointer transition-colors"}
                  ${(idx + 1) % 7 === 0 ? "border-r-0" : ""}
                `}
              >
                {!isPadding && (
                  <>
                    <div className="flex justify-between items-start">
                      <span
                        className={`
                        text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full
                        ${isToday ? "bg-blue-600 text-white shadow-sm" : "text-slate-700"}
                      `}
                      >
                        {format(day, "d")}
                      </span>

                      {user?.role === "admin" && (
                        <span className="opacity-0 group-hover:opacity-100 text-blue-500 bg-blue-100 w-6 h-6 rounded-md flex items-center justify-center transition-opacity text-lg">
                          +
                        </span>
                      )}
                    </div>

                    {/* Daily Summary Tags */}
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

      {/* MARK ATTENDANCE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
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
              <div className="mb-8">
                <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
                  Recorded Today ({getAttendanceForDay(selectedDate).length})
                </h4>
                {getAttendanceForDay(selectedDate).length === 0 ? (
                  <div className="text-sm text-slate-500 bg-slate-50 rounded-lg p-4 border border-slate-100 border-dashed text-center">
                    No attendance records for this date yet.
                  </div>
                ) : (
                  <div className="max-h-48 overflow-y-auto pr-2 space-y-2">
                    {getAttendanceForDay(selectedDate).map((record) => (
                      <div
                        key={record.id}
                        className="flex items-center justify-between bg-white border border-slate-200 p-3 rounded-xl shadow-sm"
                      >
                        <span className="font-medium text-slate-700 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flexItems-center justify-center text-slate-500 font-bold text-xs uppercase">
                            {record.member_name?.substring(0, 2) || "M"}
                          </div>
                          {record.member_name}
                        </span>
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

              {/* Form to add new record */}
              <form
                onSubmit={handleSubmitAttendance}
                className="bg-slate-50 p-5 rounded-xl border border-slate-200"
              >
                <h4 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-blue-600" /> Mark New
                  Attendance
                </h4>

                <div className="space-y-4">
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

                  <div>
                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">
                      Status
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <label
                        className={`
                        flex items-center justify-center gap-2 py-2.5 border rounded-lg cursor-pointer transition-all font-medium text-sm
                        ${
                          attendanceForm.status === "present"
                            ? "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm ring-1 ring-emerald-500"
                            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                        }
                      `}
                      >
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
