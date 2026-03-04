import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { showNotification } from "../store/slices/notificationSlice";
import tablesService from "../services/tablesService";
import reservationsService from "../services/reservationsService";
import {
  Calendar,
  Clock,
  Users,
  User,
  Mail,
  Phone,
  MessageSquare,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  TableIcon,
  CalendarCheck,
  UserPlus,
  Trash2,
  Plus,
} from "lucide-react";

// Available time slots
const TIME_SLOTS = [
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "18:00",
  "18:30",
  "19:00",
  "19:30",
  "20:00",
  "20:30",
  "21:00",
  "21:30",
];

const LOCATION_STYLES = {
  Indoor: {
    badge: "bg-blue-100 text-blue-700 border border-blue-200",
    dot: "bg-blue-500",
  },
  Outdoor: {
    badge: "bg-green-100 text-green-700 border border-green-200",
    dot: "bg-green-500",
  },
  VIP: {
    badge: "bg-purple-100 text-purple-700 border border-purple-200",
    dot: "bg-purple-500",
  },
  Bar: {
    badge: "bg-orange-100 text-orange-700 border border-orange-200",
    dot: "bg-orange-500",
  },
};

const formatTimeDisplay = (t) => {
  const [h, m] = t.split(":");
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  return `${hour % 12 || 12}:${m} ${ampm}`;
};

const getTodayStr = () => new Date().toISOString().split("T")[0];

const Reservations = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useSelector((s) => s.auth);

  const [step, setStep] = useState(1); // 1: Date/Time/Size, 2: Table, 3: Contact, 4: Confirmation
  const topRef = useRef(null);

  // Step 1
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [partySize, setPartySize] = useState(2);

  // Step 2
  const [availableTables, setAvailableTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [loadingTables, setLoadingTables] = useState(false);

  // Step 3
  const [formData, setFormData] = useState({
    fullName: currentUser?.name || "",
    email: currentUser?.email || "",
    phone: "",
    specialRequests: "",
  });
  const [formErrors, setFormErrors] = useState({});

  // Guest details (optional, inside Step 3)
  const [hasGuestList, setHasGuestList] = useState(false);
  const [guestList, setGuestList] = useState([{ name: "", note: "" }]);

  // Step 4
  const [submitting, setSubmitting] = useState(false);
  const [confirmedReservation, setConfirmedReservation] = useState(null);

  // Scroll to top of wizard on every step change
  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [step]);

  // Sync user data when user changes
  useEffect(() => {
    if (currentUser) {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || currentUser.name || "",
        email: prev.email || currentUser.email || "",
      }));
    }
  }, [currentUser]);

  const fetchAvailableTables = useCallback(async () => {
    if (!selectedDate || !selectedTime) return;
    setLoadingTables(true);
    setSelectedTable(null);
    try {
      const tables = await tablesService.getAvailableTables({
        date: selectedDate,
        time: selectedTime,
        partySize,
      });
      setAvailableTables(tables);
    } catch {
      dispatch(
        showNotification({
          type: "error",
          message: "Failed to load available tables",
        }),
      );
    } finally {
      setLoadingTables(false);
    }
  }, [selectedDate, selectedTime, partySize, dispatch]);

  // Step 1 validation
  const validateStep1 = () => {
    if (!selectedDate) {
      dispatch(
        showNotification({ type: "error", message: "Please select a date" }),
      );
      return false;
    }
    if (selectedDate < getTodayStr()) {
      dispatch(
        showNotification({
          type: "error",
          message: "Please select a future date",
        }),
      );
      return false;
    }
    if (!selectedTime) {
      dispatch(
        showNotification({
          type: "error",
          message: "Please select a time slot",
        }),
      );
      return false;
    }
    if (!partySize || partySize < 1) {
      dispatch(
        showNotification({
          type: "error",
          message: "Please select party size",
        }),
      );
      return false;
    }
    return true;
  };

  const handleStep1Next = async () => {
    if (!validateStep1()) return;
    await fetchAvailableTables();
    setStep(2);
  };

  const validateStep3 = () => {
    const errors = {};
    if (!formData.fullName.trim()) errors.fullName = "Full name is required";
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email";
    }
    if (!formData.phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (!/^[\d\s\-+()]{10,}$/.test(formData.phone)) {
      errors.phone = "Please enter a valid phone number";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!validateStep3()) return;
    if (!validateGuestList()) return;
    setSubmitting(true);
    try {
      const result = await reservationsService.createReservation({
        tableId: selectedTable._id,
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        reservationDate: selectedDate,
        reservationTime: selectedTime,
        partySize,
        specialRequests: formData.specialRequests.trim(),
        guestDetails: {
          hasGuestList,
          guests: hasGuestList
            ? guestList.map((g) => ({
                name: g.name.trim(),
                note: g.note.trim(),
              }))
            : [],
        },
      });

      if (result.success) {
        setConfirmedReservation(result.reservation);
        setStep(4);
        setSubmitting(false);
        dispatch(
          showNotification({
            type: "success",
            message: "Reservation confirmed! Check your email.",
          }),
        );
      } else {
        setSubmitting(false);
        dispatch(showNotification({ type: "error", message: result.message }));
      }
    } catch {
      setSubmitting(false);
      dispatch(
        showNotification({
          type: "error",
          message: "Failed to place reservation. Please try again.",
        }),
      );
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: "" }));

    // Sync first guest name with lead booker name
    if (name === "fullName" && hasGuestList) {
      setGuestList((prev) =>
        prev.map((g, i) => (i === 0 ? { ...g, name: value } : g)),
      );
    }
  };

  // Guest list helpers
  const handleToggleGuestList = (enabled) => {
    setHasGuestList(enabled);
    if (enabled && (guestList.length === 0 || !guestList[0].name)) {
      setGuestList([{ name: formData.fullName, note: "" }]);
    }
  };

  const handleGuestChange = (index, field, value) => {
    setGuestList((prev) =>
      prev.map((g, i) => (i === index ? { ...g, [field]: value } : g)),
    );
  };

  const handleAddGuest = () => {
    if (guestList.length < partySize) {
      setGuestList((prev) => [...prev, { name: "", note: "" }]);
    }
  };

  const handleRemoveGuest = (index) => {
    if (index === 0) return; // Cannot remove host
    setGuestList((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      return updated.length === 0
        ? [{ name: formData.fullName, note: "" }]
        : updated;
    });
  };

  const validateGuestList = () => {
    if (!hasGuestList) return true;
    for (let i = 0; i < guestList.length; i++) {
      if (!guestList[i].name.trim()) {
        dispatch(
          showNotification({
            type: "error",
            message: `Guest ${i + 1} name is required`,
          }),
        );
        return false;
      }
    }
    if (guestList.length > partySize) {
      dispatch(
        showNotification({
          type: "error",
          message: `Cannot add more guests than party size (${partySize})`,
        }),
      );
      return false;
    }
    return true;
  };

  // Step indicator
  const steps = [
    { num: 1, label: "Date & Time" },
    { num: 2, label: "Choose Table" },
    { num: 3, label: "Your Details" },
    { num: 4, label: "Confirmed" },
  ];

  return (
    <div className="min-h-screen bg-[#faf9f6] pt-32 pb-20 px-4 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl pointer-events-none" />

      <div ref={topRef} className="max-w-4xl mx-auto relative z-10">
        {/* Page Header */}
        <div className="text-center pb-12 pt-28">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-primary rounded-[1.5rem] sm:rounded-[2rem] shadow-xl shadow-black/5 mb-4 sm:mb-6 border border-gray-50 group">
            <CalendarCheck className="w-8 h-8 sm:w-10 sm:h-10 text-white group-hover:scale-110 transition-transform duration-500" />
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-dark mb-3 sm:mb-4 tracking-tight px-4">
            Book Your <span className="text-primary">Experience</span>
          </h1>
          <p className="text-dark-gray text-sm sm:text-base lg:text-lg max-w-xl mx-auto font-medium leading-relaxed opacity-80 px-4">
            Join us for an unforgettable culinary journey. Reserve your
            preferred spot in simple steps.
          </p>
        </div>

        {/* Step Indicator */}
        {step < 4 && (
          <div className="flex items-center justify-center mb-10 sm:mb-12 max-w-4xl mx-auto px-4">
            {steps.slice(0, 3).map((s, i) => (
              <React.Fragment key={s.num}>
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center font-bold text-xs sm:text-sm transition-all duration-500 border-2 ${
                      step === s.num
                        ? "bg-primary border-primary text-white shadow-xl shadow-primary/20 scale-110 -translate-y-0.5"
                        : step > s.num
                          ? "bg-green-500 border-green-500 text-white shadow-md shadow-green-500/10"
                          : "bg-white border-gray-100 text-gray-300"
                    }`}
                  >
                    {step > s.num ? (
                      <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                    ) : (
                      s.num
                    )}
                  </div>
                  <span
                    className={`text-[10px] sm:text-xs font-bold uppercase tracking-widest hidden sm:block transition-all duration-300 ${
                      step === s.num
                        ? "text-primary opacity-100"
                        : step > s.num
                          ? "text-green-600 opacity-60"
                          : "text-gray-300 opacity-40"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {i < 2 && (
                  <div className="flex-1 mx-2 sm:mx-4 mb-5 sm:mb-8 h-0.5 sm:h-1 relative bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`absolute inset-0 bg-green-500 transition-all duration-700 ease-in-out ${
                        step > s.num ? "w-full" : "w-0"
                      }`}
                    />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* ─── STEP 1: Date, Time, Party Size ─── */}
        {step === 1 && (
          <div className="bg-white rounded-[1.5rem] sm:rounded-[2.5rem] shadow-2xl shadow-black/[0.03] border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-500">
            <div className="bg-cream px-6 sm:px-10 py-6 sm:py-8 border-b border-gray-50 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-full bg-primary/5 -skew-x-12 translate-x-10" />
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-dark relative z-10">
                Plan Your Visit
              </h2>
              <p className="text-dark-gray/60 text-[10px] sm:text-xs font-bold uppercase tracking-widest mt-1 relative z-10">
                Step 1: Date, Time & Group Size
              </p>
            </div>
            <div className="p-6 sm:p-10 space-y-8 sm:space-y-10">
              {/* Date */}
              <div className="space-y-3">
                <label className="block text-dark font-bold text-[10px] sm:text-xs tracking-wide uppercase px-1">
                  <Calendar className="w-4 h-4 inline mr-2 text-primary" />
                  Select Date
                </label>
                <div className="relative group">
                  <input
                    type="date"
                    value={selectedDate}
                    min={getTodayStr()}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-4 sm:px-6 py-4 sm:py-5 rounded-xl sm:rounded-2xl border-2 border-gray-100 bg-gray-50 focus:border-primary focus:bg-white focus:outline-none transition-all text-dark text-sm sm:text-md cursor-pointer"
                  />
                </div>
              </div>

              {/* Time Slots */}
              <div className="space-y-4">
                <label className="block text-dark font-bold text-[10px] sm:text-xs tracking-wide uppercase px-1">
                  <Clock className="w-4 h-4 inline mr-2 text-primary" />
                  Select Time Slot
                </label>

                <div className="space-y-6">
                  {/* Lunch Slots */}
                  <div>
                    <h3 className="text-[10px] font-bold text-dark-gray/40 mb-3 flex items-center gap-2">
                      <span className="w-6 h-px bg-gray-100"></span>
                      LUNCH SLOTS
                      <span className="w-6 h-px bg-gray-100"></span>
                    </h3>
                    <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2 sm:gap-3">
                      {TIME_SLOTS.filter(
                        (t) => parseInt(t.split(":")[0]) < 17,
                      ).map((t) => (
                        <button
                          key={t}
                          onClick={() => setSelectedTime(t)}
                          className={`py-2.5 sm:py-3 px-1 sm:px-2 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-bold transition-all border-2 ${
                            selectedTime === t
                              ? "bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-105"
                              : "border-gray-50 bg-gray-50 text-dark-gray/60 hover:border-primary/30 hover:bg-white hover:text-primary"
                          }`}
                        >
                          {formatTimeDisplay(t)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Dinner Slots */}
                  <div>
                    <h3 className="text-[10px] font-bold text-dark-gray/40 mb-3 flex items-center gap-2">
                      <span className="w-6 h-px bg-gray-100"></span>
                      DINNER SLOTS
                      <span className="w-6 h-px bg-gray-100"></span>
                    </h3>
                    <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2 sm:gap-3">
                      {TIME_SLOTS.filter(
                        (t) => parseInt(t.split(":")[0]) >= 17,
                      ).map((t) => (
                        <button
                          key={t}
                          onClick={() => setSelectedTime(t)}
                          className={`py-2.5 sm:py-3 px-1 sm:px-2 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-bold transition-all border-2 ${
                            selectedTime === t
                              ? "bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-105"
                              : "border-gray-50 bg-gray-50 text-dark-gray/60 hover:border-primary/30 hover:bg-white hover:text-primary"
                          }`}
                        >
                          {formatTimeDisplay(t)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Party Size */}
              <div className="space-y-4">
                <label className="block text-dark font-bold text-[10px] sm:text-xs tracking-wide uppercase px-1">
                  <Users className="w-4 h-4 inline mr-2 text-primary" />
                  Group Size
                </label>

                <div className="bg-gray-50/50 rounded-[1.5rem] sm:rounded-[2rem] p-6 sm:p-8 border-2 border-gray-50 flex flex-col items-center gap-6">
                  <div className="flex items-center justify-between w-full max-w-sm">
                    <button
                      onClick={() => setPartySize((p) => Math.max(1, p - 1))}
                      className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-dark hover:border-primary hover:text-primary transition-all shadow-sm active:scale-95"
                    >
                      <span className="text-2xl sm:text-3xl font-light">−</span>
                    </button>

                    <div className="flex flex-col items-center">
                      <div className="text-4xl sm:text-6xl font-bold text-primary tabular-nums tracking-tighter">
                        {partySize}
                      </div>
                      <p className="text-[9px] sm:text-[10px] font-bold text-dark-gray/60 uppercase tracking-[0.2em] mt-1 sm:mt-2">
                        {partySize === 1 ? "Guest" : "Guests"}
                      </p>
                    </div>

                    <button
                      onClick={() => setPartySize((p) => Math.min(20, p + 1))}
                      className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-dark hover:border-primary hover:text-primary transition-all shadow-sm active:scale-95"
                    >
                      <span className="text-2xl sm:text-3xl font-light">+</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                    {[1, 2, 3, 4, 6, 8, 10].map((n) => (
                      <button
                        key={n}
                        onClick={() => setPartySize(n)}
                        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold transition-all border-2 ${
                          partySize === n
                            ? "bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-105"
                            : "bg-white border-gray-50 text-dark-gray/40 hover:border-primary/20"
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 sm:px-10 py-6 sm:py-8 bg-gray-50/50 flex flex-col sm:flex-row justify-end items-center gap-4 sm:gap-6 border-t border-gray-100">
              <p className="text-[10px] font-bold text-dark-gray/40 uppercase tracking-widest hidden sm:block">
                Check Availability Next
              </p>
              <button
                onClick={handleStep1Next}
                className="group w-full sm:w-auto flex items-center justify-center gap-3 bg-primary text-white px-8 sm:px-10 py-4 sm:py-5 rounded-xl sm:rounded-2xl font-bold uppercase tracking-widest text-[10px] sm:text-xs hover:bg-primary-dark transition-all shadow-xl shadow-primary/20 hover:-translate-y-0.5"
              >
                Find My Table
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        )}

        {/* ─── STEP 2: Table Selection ─── */}
        {step === 2 && (
          <div className="bg-white rounded-[1.5rem] sm:rounded-[2.5rem] shadow-2xl shadow-black/[0.03] border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-500">
            <div className="bg-cream px-6 sm:px-10 py-6 sm:py-8 border-b border-gray-50 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-full bg-primary/5 -skew-x-12 translate-x-10" />
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-dark relative z-10">
                Choose Your Table
              </h2>
              <div className="flex flex-wrap gap-2 sm:gap-4 mt-2 sm:mt-3 relative z-10 text-dark-gray/60 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest">
                <span className="flex items-center gap-1.5 bg-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border border-gray-100">
                  <Calendar className="w-3 h-3 text-primary" />
                  {reservationsService.formatDate(selectedDate)}
                </span>
                <span className="flex items-center gap-1.5 bg-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border border-gray-100">
                  <Clock className="w-3 h-3 text-primary" />
                  {formatTimeDisplay(selectedTime)}
                </span>
                <span className="flex items-center gap-1.5 bg-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border border-gray-100">
                  <Users className="w-3 h-3 text-primary" />
                  {partySize} Guests
                </span>
              </div>
            </div>

            <div className="p-6 sm:p-10">
              {loadingTables ? (
                <div className="flex flex-col items-center justify-center py-16 sm:py-20 gap-5 sm:gap-6">
                  <div className="relative">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-primary/10 rounded-full" />
                    <div className="absolute top-0 left-0 w-12 h-12 sm:w-16 sm:h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                  <p className="text-dark font-bold text-[10px] sm:text-xs uppercase tracking-widest animate-pulse opacity-60">
                    Scanning Floor Map...
                  </p>
                </div>
              ) : availableTables.length === 0 ? (
                <div className="text-center py-16 sm:py-20 px-4">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-50 rounded-[1.5rem] sm:rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 border border-gray-100">
                    <TableIcon className="w-8 h-8 sm:w-10 sm:h-10 text-gray-200" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-dark mb-3">
                    Everything's Booked
                  </h3>
                  <p className="text-dark-gray text-xs sm:text-sm max-w-sm mx-auto font-medium leading-relaxed opacity-60 mb-8">
                    We're sorry, but no tables are available for your selection.
                    Try adjusting your time or choosing a different date.
                  </p>
                  <button
                    onClick={() => setStep(1)}
                    className="inline-flex items-center gap-3 bg-primary text-white px-6 py-3.5 rounded-xl sm:rounded-2xl font-bold uppercase tracking-widest text-[10px] sm:text-xs hover:bg-primary-dark transition-all shadow-xl shadow-primary/20"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    Adjust Time / Date
                  </button>
                </div>
              ) : (
                <>
                  {/* Legend */}
                  <div className="flex flex-wrap gap-4 sm:gap-6 mb-8 sm:mb-10 pb-6 border-b border-gray-50 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-dark-gray/40 justify-center">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />{" "}
                      Available Areas
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary" /> Your
                      Selection
                    </div>
                    <div className="flex items-center gap-2">
                      <TableIcon className="w-3 h-3 opacity-40" /> Select to
                      Confirm
                    </div>
                  </div>

                  {/* Group tables by location */}
                  <div className="space-y-8 sm:space-y-10">
                    {["Indoor", "Outdoor", "VIP", "Bar"].map((loc) => {
                      const locationTables = availableTables.filter(
                        (t) => t.location === loc,
                      );
                      if (locationTables.length === 0) return null;
                      const style = LOCATION_STYLES[loc] || {
                        badge:
                          "bg-gray-100 text-gray-700 border border-gray-200",
                        dot: "bg-gray-500",
                      };
                      return (
                        <div key={loc} className="relative">
                          <div className="flex items-center gap-3 sm:gap-4 mb-5 sm:mb-6">
                            <h3 className="text-base sm:text-lg font-bold text-dark flex items-center gap-2">
                              <span
                                className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${style.dot} animate-pulse`}
                              />
                              {loc} Area
                            </h3>
                            <div className="h-px flex-1 bg-gradient-to-r from-gray-200 to-transparent" />
                            <span
                              className={`text-[9px] sm:text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full font-bold ${style.badge}`}
                            >
                              {locationTables.length} Available
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                            {locationTables.map((table) => {
                              const isSelected =
                                selectedTable?._id === table._id;
                              return (
                                <button
                                  key={table._id}
                                  onClick={() => setSelectedTable(table)}
                                  className={`group relative text-left rounded-2xl sm:rounded-3xl transition-all duration-300 ${
                                    isSelected
                                      ? "ring-4 ring-primary/10 scale-[1.02]"
                                      : "hover:scale-[1.01]"
                                  }`}
                                >
                                  <div
                                    className={`h-full p-5 sm:p-6 rounded-2xl sm:rounded-3xl border-2 transition-all duration-300 flex flex-col gap-3 sm:gap-4 ${
                                      isSelected
                                        ? "bg-white border-primary shadow-xl shadow-primary/10"
                                        : "bg-gray-50 border-transparent hover:bg-white hover:border-primary/20 hover:shadow-lg"
                                    }`}
                                  >
                                    {/* Selection Icon */}
                                    <div
                                      className={`absolute top-4 right-4 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                                        isSelected
                                          ? "bg-primary text-white scale-110"
                                          : "bg-gray-200 text-transparent scale-0"
                                      }`}
                                    >
                                      <CheckCircle className="w-4 h-4" />
                                    </div>

                                    <div className="flex items-center gap-4">
                                      <div
                                        className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center transition-all ${
                                          isSelected
                                            ? "bg-primary text-white shadow-lg shadow-primary/20"
                                            : "bg-white text-dark-gray shadow-sm group-hover:bg-primary/5 group-hover:text-primary"
                                        }`}
                                      >
                                        <span className="text-[8px] sm:text-[10px] font-bold opacity-60 uppercase mb-0.5">
                                          No.
                                        </span>
                                        <span className="text-base sm:text-xl font-bold">
                                          #{table.tableNumber}
                                        </span>
                                      </div>

                                      <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-dark text-base sm:text-lg group-hover:text-primary transition-colors truncate">
                                          {table.name}
                                        </h4>
                                        <div className="flex flex-wrap gap-2 mt-1 sm:mt-2">
                                          <div className="flex items-center gap-1.5 px-2 py-0.5 sm:py-1 rounded-lg bg-white border border-gray-100 text-[10px] sm:text-[11px] font-bold text-dark-gray shadow-sm">
                                            <Users className="w-3 h-3 text-primary" />
                                            {table.capacity} Seats
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    {table.description && (
                                      <div className="pt-3 sm:pt-4 border-t border-gray-100">
                                        <p className="text-xs text-dark-gray leading-relaxed flex items-start gap-2">
                                          <MessageSquare className="w-3 h-3 mt-0.5 text-primary flex-shrink-0" />
                                          {table.description}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-gray-50 pt-8">
                <button
                  onClick={() => setStep(1)}
                  className="w-full sm:w-auto text-[10px] sm:text-xs font-bold text-dark-gray/40 uppercase tracking-widest hover:text-dark transition-colors px-6 py-4"
                >
                  ← Back to Selection
                </button>
                <button
                  disabled={!selectedTable}
                  onClick={() => setStep(3)}
                  className={`w-full sm:w-auto flex items-center justify-center gap-3 px-8 sm:px-10 py-4 sm:py-5 rounded-xl sm:rounded-2xl font-bold uppercase tracking-widest text-[10px] sm:text-xs transition-all shadow-xl ${
                    selectedTable
                      ? "bg-primary text-white shadow-xl shadow-primary/20 hover:bg-primary-dark hover:-translate-y-0.5"
                      : "bg-gray-100 text-gray-300 cursor-not-allowed"
                  }`}
                >
                  Book This Table
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── STEP 3: Contact Details ─── */}
        {/* ─── STEP 3: Contact Details ─── */}
        {step === 3 && (
          <div className="bg-white rounded-[1.5rem] sm:rounded-[2.5rem] shadow-2xl shadow-black/[0.03] border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-500">
            <div className="bg-cream px-6 sm:px-10 py-6 sm:py-8 border-b border-gray-50 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-full bg-primary/5 -skew-x-12 translate-x-10" />
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-dark relative z-10">
                Contact Details
              </h2>
              <p className="text-dark-gray/60 text-[10px] sm:text-xs font-bold uppercase tracking-widest mt-1 relative z-10">
                Step 3: Secure Your Reservation
              </p>
            </div>

            <div className="p-6 sm:p-10">
              <form onSubmit={handleSubmit} className="space-y-8 sm:space-y-10">
                {/* Summary Banner */}
                <div className="bg-gray-50/50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border-2 border-dashed border-gray-100 flex flex-wrap gap-4 sm:gap-8 justify-center sm:justify-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-primary shadow-sm border border-gray-50">
                      <TableIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[8px] font-bold text-dark-gray/40 uppercase tracking-widest">
                        Selected Table
                      </p>
                      <p className="text-sm font-bold text-dark">
                        Table #{selectedTable?.tableNumber} (
                        {selectedTable?.location})
                      </p>
                    </div>
                  </div>
                  <div className="w-px h-10 bg-gray-100 hidden sm:block" />
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-primary shadow-sm border border-gray-50">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[8px] font-bold text-dark-gray/40 uppercase tracking-widest">
                        Date & Time
                      </p>
                      <p className="text-sm font-bold text-dark uppercase">
                        {reservationsService.formatDate(selectedDate)} at{" "}
                        {formatTimeDisplay(selectedTime)}
                      </p>
                    </div>
                  </div>
                </div>

                {!isAuthenticated && (
                  <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm border border-primary/10">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-bold text-dark text-base">
                        Booking as a Guest
                      </h4>
                      <p className="text-dark-gray text-xs mt-1 leading-relaxed">
                        <button
                          type="button"
                          onClick={() => navigate("/login")}
                          className="text-primary font-bold hover:underline"
                        >
                          Sign in
                        </button>{" "}
                        to manage bookings and enjoy a faster checkout.
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                  {/* Name */}
                  <div className="space-y-3">
                    <label className="block text-dark font-bold text-[10px] sm:text-xs tracking-wide uppercase px-1">
                      Full Name
                    </label>
                    <div className="relative group">
                      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-dark-gray/30 group-focus-within:text-primary transition-colors">
                        <User className="w-5 h-5" />
                      </div>
                      <input
                        type="text"
                        name="fullName"
                        required
                        placeholder="John Doe"
                        className={`w-full pl-14 pr-6 py-4 rounded-xl sm:rounded-2xl border-2 transition-all text-dark font-medium text-sm sm:text-md ${
                          formErrors.fullName
                            ? "border-red-100 bg-red-50/30"
                            : "border-gray-100 bg-gray-50 focus:border-primary focus:bg-white focus:outline-none"
                        }`}
                        value={formData.fullName}
                        onChange={handleInputChange}
                      />
                    </div>
                    {formErrors.fullName && (
                      <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider px-1">
                        {formErrors.fullName}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-3">
                    <label className="block text-dark font-bold text-[10px] sm:text-xs tracking-wide uppercase px-1">
                      Email Address
                    </label>
                    <div className="relative group">
                      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-dark-gray/30 group-focus-within:text-primary transition-colors">
                        <Mail className="w-5 h-5" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        required
                        placeholder="john@example.com"
                        className={`w-full pl-14 pr-6 py-4 rounded-xl sm:rounded-2xl border-2 transition-all text-dark font-medium text-sm sm:text-md ${
                          formErrors.email
                            ? "border-red-100 bg-red-50/30"
                            : "border-gray-100 bg-gray-50 focus:border-primary focus:bg-white focus:outline-none"
                        }`}
                        value={formData.email}
                        onChange={handleInputChange}
                      />
                    </div>
                    {formErrors.email && (
                      <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider px-1">
                        {formErrors.email}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="space-y-3">
                    <label className="block text-dark font-bold text-[10px] sm:text-xs tracking-wide uppercase px-1">
                      Phone Number
                    </label>
                    <div className="relative group">
                      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-dark-gray/30 group-focus-within:text-primary transition-colors">
                        <Phone className="w-5 h-5" />
                      </div>
                      <input
                        type="tel"
                        name="phone"
                        required
                        placeholder="+1 (234) 567-890"
                        className={`w-full pl-14 pr-6 py-4 rounded-xl sm:rounded-2xl border-2 transition-all text-dark font-medium text-sm sm:text-md ${
                          formErrors.phone
                            ? "border-red-100 bg-red-50/30"
                            : "border-gray-100 bg-gray-50 focus:border-primary focus:bg-white focus:outline-none"
                        }`}
                        value={formData.phone}
                        onChange={handleInputChange}
                      />
                    </div>
                    {formErrors.phone && (
                      <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider px-1">
                        {formErrors.phone}
                      </p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <label className="block text-dark font-bold text-[10px] sm:text-xs tracking-wide uppercase px-1">
                      Special Requests
                    </label>
                    <div className="relative group">
                      <div className="absolute left-5 top-5 text-dark-gray/30 group-focus-within:text-primary transition-colors">
                        <MessageSquare className="w-5 h-5" />
                      </div>
                      <textarea
                        rows="1"
                        name="specialRequests"
                        placeholder="Allergies, seating..."
                        className="w-full pl-14 pr-6 py-4 rounded-xl sm:rounded-2xl border-2 border-gray-100 bg-gray-50 focus:border-primary focus:bg-white focus:outline-none transition-all text-dark font-medium text-sm sm:text-md resize-none"
                        value={formData.specialRequests}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>

                {/* Guest Details Section */}
                <div className="overflow-hidden rounded-2xl sm:rounded-3xl border-2 border-gray-50 bg-gray-50/50">
                  <div className="p-5 sm:p-8 bg-white flex flex-col sm:flex-row items-center gap-6 justify-between border-b border-gray-50">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center text-primary shadow-sm">
                        <UserPlus className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-dark text-base">
                          Guest Names
                        </h4>
                        <p className="text-dark-gray text-[10px] mt-0.5">
                          Optional: Add names for a better experience.
                        </p>
                      </div>
                    </div>

                    <div className="flex bg-gray-100 p-1 rounded-xl w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => handleToggleGuestList(true)}
                        className={`flex-1 px-8 py-2 rounded-lg text-[10px] font-bold transition-all ${
                          hasGuestList
                            ? "bg-white text-primary shadow-sm"
                            : "text-dark-gray hover:text-dark"
                        }`}
                      >
                        YES, ADD
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleGuestList(false)}
                        className={`px-8 py-2 rounded-lg text-[10px] font-bold transition-all ${
                          !hasGuestList
                            ? "bg-white text-primary shadow-sm"
                            : "text-dark-gray hover:text-dark"
                        }`}
                      >
                        NO, SKIP
                      </button>
                    </div>
                  </div>

                  {hasGuestList && (
                    <div className="p-5 sm:p-6 space-y-4 max-h-[300px] overflow-y-auto">
                      {guestList.map((guest, index) => (
                        <div
                          key={index}
                          className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm relative group/guest transition-all"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-md font-bold text-primary flex items-center gap-2">
                              Guest #{index + 1}
                              {index === 0 && (
                                <span className="text-[8px] px-2 py-0.5 bg-primary/10 text-primary rounded-full uppercase tracking-tighter">
                                  Host / Booker
                                </span>
                              )}
                            </span>
                            {guestList.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveGuest(index)}
                                className="w-6 h-6 rounded-lg flex items-center justify-center bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <input
                              type="text"
                              value={guest.name}
                              onChange={(e) =>
                                handleGuestChange(index, "name", e.target.value)
                              }
                              disabled={index === 0}
                              placeholder="Full Name *"
                              className={`w-full px-4 py-3 rounded-lg border border-gray-100 bg-gray-50 focus:bg-white focus:border-primary focus:outline-none transition-all text-xs font-medium ${
                                index === 0
                                  ? "opacity-60 cursor-not-allowed"
                                  : ""
                              }`}
                            />
                            <input
                              type="text"
                              value={guest.note}
                              onChange={(e) =>
                                handleGuestChange(index, "note", e.target.value)
                              }
                              placeholder="Notes (Optional)"
                              className="w-full px-4 py-3 rounded-lg border border-gray-100 bg-gray-50 focus:bg-white focus:border-primary focus:outline-none transition-all text-xs font-medium"
                            />
                          </div>
                        </div>
                      ))}

                      {guestList.length < partySize && (
                        <div className="flex items-center justify-center">
                          <button
                            type="button"
                            onClick={handleAddGuest}
                            className="flex items-center justify-center gap-2 py-4 px-5 rounded-xl border-2 bg-primary text-white text-xs sm:text-sm font-semibold tracking-widest hover:bg-primary-dark transition-all"
                          >
                            <Plus className="w-4 h-4" />
                            Add Guest
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-gray-50 pt-8">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="w-full sm:w-auto text-[10px] sm:text-xs font-bold text-dark-gray/40 uppercase tracking-widest hover:text-dark transition-colors px-6 py-4"
                  >
                    ← Back to Tables
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="group w-full sm:w-auto flex items-center justify-center gap-3 bg-primary text-white px-10 sm:px-12 py-4 sm:py-5 rounded-xl sm:rounded-2xl font-bold uppercase tracking-widest text-[10px] sm:text-xs hover:bg-primary-dark transition-all shadow-xl shadow-primary/20 hover:-translate-y-0.5 disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Finalizing...
                      </>
                    ) : (
                      <>
                        Complete Booking
                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ─── STEP 4: Confirmation Summary ─── */}
        {step === 4 && confirmedReservation && (
          <div className="animate-in fade-in slide-in-from-bottom-5 duration-700">
            {/* Success Header */}
            <div className="bg-white rounded-[2rem] sm:rounded-[3rem] p-8 sm:p-12 text-center shadow-2xl shadow-black/[0.03] border border-gray-100 mb-8 sm:mb-10 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-success/20 via-success to-success/20" />
              <div className="relative z-10">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-green-50 rounded-[1.5rem] sm:rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 sm:mb-8 border border-green-100">
                  <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-green-500" />
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-dark mb-3 sm:mb-4">
                  Booking Confirmed!
                </h2>
                <p className="text-dark-gray text-sm sm:text-base font-medium max-w-sm mx-auto opacity-70">
                  Step 4: Reservation Summary & Receipt
                </p>
              </div>
            </div>

            {/* Comprehensive Reservation Summary Form */}
            <div className="bg-white rounded-[1.5rem] sm:rounded-[2.5rem] shadow-2xl shadow-black/[0.03] border border-gray-100 overflow-hidden mb-12">
              <div className="bg-cream px-6 sm:px-10 py-6 sm:py-8 border-b border-gray-50 flex items-center justify-between">
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-dark">
                    Reservation Details
                  </h3>
                  <p className="text-dark-gray/60 text-[10px] sm:text-xs font-bold uppercase tracking-widest mt-1">
                    Booking ID: #
                    {confirmedReservation.reservationId ||
                      confirmedReservation._id?.slice(-8).toUpperCase()}
                  </p>
                </div>
                <div className="flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full font-bold text-[10px] uppercase tracking-wider">
                  <CheckCircle className="w-4 h-4" />
                  CONFIRMED
                </div>
              </div>

              <div className="p-6 sm:p-10 space-y-10">
                {/* Information Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12">
                  {/* Guest Information */}
                  <div className="space-y-6">
                    <h4 className="text-xs font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Guest Information
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <p className="text-[10px] font-bold text-dark-gray/40 uppercase tracking-widest mb-1">
                          Full Name
                        </p>
                        <p className="text-base font-bold text-dark">
                          {confirmedReservation.fullName}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[10px] font-bold text-dark-gray/40 uppercase tracking-widest mb-1">
                            Email Address
                          </p>
                          <p className="text-sm font-semibold text-dark truncate">
                            {confirmedReservation.email}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-dark-gray/40 uppercase tracking-widest mb-1">
                            Phone Number
                          </p>
                          <p className="text-sm font-semibold text-dark">
                            {confirmedReservation.phone}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Visit Details */}
                  <div className="space-y-6">
                    <h4 className="text-xs font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                      <CalendarCheck className="w-4 h-4" />
                      Visit Details
                    </h4>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[10px] font-bold text-dark-gray/40 uppercase tracking-widest mb-1">
                            Reservation Date
                          </p>
                          <p className="text-sm font-bold text-dark">
                            {reservationsService.formatDate(
                              confirmedReservation.reservationDate,
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-dark-gray/40 uppercase tracking-widest mb-1">
                            Time Slot
                          </p>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-primary" />
                            <p className="text-sm font-bold text-dark">
                              {formatTimeDisplay(
                                confirmedReservation.reservationTime,
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[10px] font-bold text-dark-gray/40 uppercase tracking-widest mb-1">
                            Table Number
                          </p>
                          <p className="text-base font-bold text-primary">
                            #
                            {confirmedReservation.tableId?.tableNumber ||
                              confirmedReservation.tableNumber}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-dark-gray/40 uppercase tracking-widest mb-1">
                            Party Size
                          </p>
                          <p className="text-base font-bold text-dark">
                            {confirmedReservation.partySize} Guests
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-gray-100 w-full" />

                {/* Additional Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12">
                  {/* Table & Location */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                      <TableIcon className="w-4 h-4" />
                      Seating Plan
                    </h4>
                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                      <p className="text-[10px] font-bold text-dark-gray/40 uppercase tracking-widest mb-2">
                        Location & View
                      </p>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-primary shadow-sm border border-gray-50 flex-shrink-0">
                          <TableIcon className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-base font-bold text-dark">
                            {confirmedReservation.tableId?.name ||
                              confirmedReservation.tableName}
                          </p>
                          <p className="text-xs font-medium text-dark-gray">
                            {confirmedReservation.tableId?.location ||
                              confirmedReservation.tableLocation}{" "}
                            Seating
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Special Requests */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Special Requests
                    </h4>
                    <div
                      className={`rounded-2xl p-6 border ${confirmedReservation.specialRequests ? "bg-primary/5 border-primary/10" : "bg-gray-50 border-gray-100"}`}
                    >
                      <p className="text-sm font-medium text-dark leading-relaxed italic">
                        {confirmedReservation.specialRequests ||
                          "No special requests provided for this visit."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Guest List Section */}
                {confirmedReservation.guestDetails?.hasGuestList &&
                  confirmedReservation.guestDetails?.guests?.length > 0 && (
                    <div className="mt-8 space-y-6">
                      <h4 className="text-xs font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Guest List (
                        {confirmedReservation.guestDetails.guests.length})
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {confirmedReservation.guestDetails.guests.map(
                          (guest, idx) => (
                            <div
                              key={idx}
                              className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100 flex items-center gap-4"
                            >
                              <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-md">
                                {idx + 1}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-bold text-dark truncate">
                                  {guest.name}
                                </p>
                                {guest.note && (
                                  <p className="text-[10px] font-medium text-dark-gray truncate italic">
                                    {guest.note}
                                  </p>
                                )}
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  )}
              </div>

              {/* Actions Footer */}
              <div className="bg-gray-50 px-6 sm:px-10 py-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => {
                    setConfirmedReservation(null);
                    setStep(1);
                    setSelectedTable(null);
                    setFormData({
                      fullName: currentUser?.name || "",
                      email: currentUser?.email || "",
                      phone: "",
                      specialRequests: "",
                    });
                    setGuestList([{ name: "", note: "" }]);
                    setHasGuestList(false);
                  }}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-dark border-2 border-gray-200 px-8 py-4 rounded-2xl font-bold text-[10px] sm:text-xs uppercase tracking-widest hover:border-primary/30 hover:text-primary transition-all hover:shadow-lg"
                >
                  Make Another Booking
                </button>
                {isAuthenticated ? (
                  <button
                    onClick={() => navigate("/my-reservations")}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-white px-10 py-4 rounded-2xl font-bold text-[10px] sm:text-xs uppercase tracking-widest hover:bg-primary-dark transition-all shadow-xl shadow-primary/20"
                  >
                    View My Bookings
                  </button>
                ) : (
                  <button
                    onClick={() => navigate("/")}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-white px-10 py-4 rounded-2xl font-bold text-[10px] sm:text-xs uppercase tracking-widest hover:bg-primary-dark transition-all shadow-xl"
                  >
                    Return to Home
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reservations;
