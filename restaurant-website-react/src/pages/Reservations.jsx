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
  MapPin,
  User,
  Mail,
  Phone,
  MessageSquare,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  Loader2,
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

  const handleStep2Next = () => {
    if (!selectedTable) {
      dispatch(
        showNotification({ type: "error", message: "Please select a table" }),
      );
      return;
    }
    setStep(3);
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

  const handleSubmit = async () => {
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
        dispatch(
          showNotification({
            type: "success",
            message: "Reservation confirmed! Check your email.",
          }),
        );
      } else {
        dispatch(showNotification({ type: "error", message: result.message }));
      }
    } catch {
      dispatch(
        showNotification({
          type: "error",
          message: "Failed to place reservation. Please try again.",
        }),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Guest list helpers
  const handleToggleGuestList = (enabled) => {
    setHasGuestList(enabled);
    if (enabled && guestList.length === 0) {
      setGuestList([{ name: "", note: "" }]);
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
    setGuestList((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      return updated.length === 0 ? [{ name: "", note: "" }] : updated;
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-cream-light to-amber-50 pt-28 pb-16 px-4">
      <div ref={topRef} className="max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-primary-dark rounded-2xl shadow-lg shadow-primary/30 mb-4">
            <CalendarCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl lg:text-4xl font-sans font-bold text-dark mb-2">
            Reserve a Table
          </h1>
          <p className="text-dark-gray text-lg">
            Book your perfect dining experience at Bites Restaurant
          </p>
        </div>

        {/* Step Indicator */}
        {step < 4 && (
          <div className="flex items-center justify-center mb-8 px-2">
            {steps.slice(0, 3).map((s, i) => (
              <React.Fragment key={s.num}>
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                      step === s.num
                        ? "bg-gradient-to-br from-primary to-primary-dark text-white shadow-lg shadow-primary/30 scale-110"
                        : step > s.num
                          ? "bg-green-500 text-white"
                          : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {step > s.num ? <CheckCircle className="w-5 h-5" /> : s.num}
                  </div>
                  <span
                    className={`text-xs font-medium hidden sm:block transition-colors ${
                      step === s.num
                        ? "text-primary"
                        : step > s.num
                          ? "text-green-600"
                          : "text-gray-400"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {i < 2 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 mb-5 rounded-full transition-all ${step > s.num ? "bg-green-400" : "bg-gray-200"}`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* ─── STEP 1: Date, Time, Party Size ─── */}
        {step === 1 && (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-primary to-primary-dark px-8 py-6">
              <h2 className="text-xl font-sans font-bold text-white">
                When would you like to visit?
              </h2>
              <p className="text-white/80 text-sm mt-1">
                Choose your date, time, and party size
              </p>
            </div>
            <div className="p-8 space-y-6">
              {/* Date */}
              <div className="space-y-2">
                <label className="block text-dark font-semibold text-sm">
                  <Calendar className="w-4 h-4 inline mr-2 text-primary" />
                  Select Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  min={getTodayStr()}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all text-dark text-sm"
                />
              </div>

              {/* Time Slots */}
              <div className="space-y-3">
                <label className="block text-dark font-semibold text-sm">
                  <Clock className="w-4 h-4 inline mr-2 text-primary" />
                  Select Time Slot
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {TIME_SLOTS.map((t) => (
                    <button
                      key={t}
                      onClick={() => setSelectedTime(t)}
                      className={`py-2.5 px-1 rounded-xl text-xs font-semibold transition-all border-2 ${
                        selectedTime === t
                          ? "bg-gradient-to-br from-primary to-primary-dark text-white border-primary shadow-md shadow-primary/30"
                          : "border-gray-200 text-dark-gray hover:border-primary/50 hover:text-primary hover:bg-cream-light"
                      }`}
                    >
                      {formatTimeDisplay(t)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Party Size */}
              <div className="space-y-3">
                <label className="block text-dark font-semibold text-sm">
                  <Users className="w-4 h-4 inline mr-2 text-primary" />
                  Party Size
                </label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setPartySize((p) => Math.max(1, p - 1))}
                    className="w-12 h-12 rounded-xl border-2 border-gray-200 flex items-center justify-center text-dark-gray hover:border-primary hover:text-primary transition-all text-xl font-bold"
                  >
                    −
                  </button>
                  <div className="flex-1 text-center">
                    <span className="text-4xl font-bold text-primary">
                      {partySize}
                    </span>
                    <p className="text-xs text-dark-gray mt-1">
                      {partySize === 1 ? "Guest" : "Guests"}
                    </p>
                  </div>
                  <button
                    onClick={() => setPartySize((p) => Math.min(20, p + 1))}
                    className="w-12 h-12 rounded-xl border-2 border-gray-200 flex items-center justify-center text-dark-gray hover:border-primary hover:text-primary transition-all text-xl font-bold"
                  >
                    +
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 6, 8, 10].map((n) => (
                    <button
                      key={n}
                      onClick={() => setPartySize(n)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        partySize === n
                          ? "bg-primary text-white border-primary"
                          : "border-gray-200 text-dark-gray hover:border-primary/50 hover:text-primary"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 px-8 py-5 bg-gray-50 flex justify-end">
              <button
                onClick={handleStep1Next}
                className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary-dark text-white px-8 py-3.5 rounded-xl font-semibold hover:shadow-lg hover:shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Find Available Tables
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* ─── STEP 2: Table Selection ─── */}
        {step === 2 && (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-primary to-primary-dark px-8 py-6">
              <h2 className="text-xl font-sans font-bold text-white">
                Choose Your Table
              </h2>
              <p className="text-white/80 text-sm mt-1">
                {reservationsService.formatDate(selectedDate)} ·{" "}
                {formatTimeDisplay(selectedTime)} · {partySize}{" "}
                {partySize === 1 ? "Guest" : "Guests"}
              </p>
            </div>

            <div className="p-8">
              {loadingTables ? (
                <div className="flex flex-col items-center justify-center py-16 gap-4">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  <p className="text-dark-gray font-medium">
                    Checking available tables...
                  </p>
                </div>
              ) : availableTables.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-cream rounded-full flex items-center justify-center mx-auto mb-4">
                    <TableIcon className="w-10 h-10 text-primary/60" />
                  </div>
                  <h3 className="text-lg font-bold text-dark mb-2">
                    No Tables Available
                  </h3>
                  <p className="text-dark-gray mb-6">
                    No tables available for {partySize} guests on{" "}
                    {reservationsService.formatDate(selectedDate)} at{" "}
                    {formatTimeDisplay(selectedTime)}. Try a different time or
                    date.
                  </p>
                  <button
                    onClick={() => setStep(1)}
                    className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-dark transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Change Date / Time
                  </button>
                </div>
              ) : (
                <>
                  {/* Legend */}
                  <div className="flex flex-wrap gap-3 mb-6 text-xs font-medium text-dark-gray">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-green-400" />{" "}
                      Available
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-primary" />{" "}
                      Selected
                    </div>
                  </div>

                  {/* Group tables by location */}
                  {["Indoor", "Outdoor", "VIP", "Bar"].map((loc) => {
                    const locationTables = availableTables.filter(
                      (t) => t.location === loc,
                    );
                    if (locationTables.length === 0) return null;
                    const style = LOCATION_STYLES[loc] || {
                      badge: "bg-gray-100 text-gray-700 border border-gray-200",
                      dot: "bg-gray-500",
                    };
                    return (
                      <div key={loc} className="mb-6">
                        <div className="flex items-center gap-2 mb-3">
                          <div
                            className={`w-2.5 h-2.5 rounded-full ${style.dot}`}
                          />
                          <h3 className="font-semibold text-dark text-sm">
                            {loc}
                          </h3>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-md font-medium ${style.badge}`}
                          >
                            {locationTables.length} available
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {locationTables.map((table) => {
                            const isSelected = selectedTable?._id === table._id;
                            return (
                              <button
                                key={table._id}
                                onClick={() => setSelectedTable(table)}
                                className={`relative text-left p-4 rounded-2xl border-2 transition-all duration-200 ${
                                  isSelected
                                    ? "border-primary bg-gradient-to-br from-cream-light to-cream shadow-lg shadow-primary/20 scale-[1.02]"
                                    : "border-gray-200 hover:border-primary/50 hover:bg-cream-light/50 hover:shadow-md"
                                }`}
                              >
                                {isSelected && (
                                  <div className="absolute top-3 right-3">
                                    <CheckCircle className="w-5 h-5 text-primary" />
                                  </div>
                                )}
                                <div className="flex items-start gap-3">
                                  <div
                                    className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm shadow-sm ${
                                      isSelected
                                        ? "bg-gradient-to-br from-primary to-primary-dark text-white"
                                        : "bg-gray-100 text-dark-gray"
                                    }`}
                                  >
                                    #{table.tableNumber}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-dark text-sm">
                                      {table.name}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                                      <div className="flex items-center gap-1 text-xs text-dark-gray">
                                        <Users className="w-3 h-3 text-primary" />
                                        Up to {table.capacity} seats
                                      </div>
                                      <span
                                        className={`text-xs px-2 py-0.5 rounded-md font-medium ${style.badge}`}
                                      >
                                        <MapPin className="w-3 h-3 inline mr-0.5" />
                                        {table.location}
                                      </span>
                                    </div>
                                    {table.description && (
                                      <p className="text-xs text-dark-gray mt-1 line-clamp-1">
                                        {table.description}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>

            {availableTables.length > 0 && (
              <div className="border-t border-gray-100 px-8 py-5 bg-gray-50 flex items-center justify-between gap-4">
                <button
                  onClick={() => {
                    setStep(1);
                    setSelectedTable(null);
                  }}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-gray-200 text-dark-gray font-semibold hover:border-gray-300 hover:bg-white transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>
                <button
                  onClick={handleStep2Next}
                  className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary-dark text-white px-8 py-3.5 rounded-xl font-semibold hover:shadow-lg hover:shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Continue
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* ─── STEP 3: Contact Details ─── */}
        {step === 3 && (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-primary to-primary-dark px-8 py-6">
              <h2 className="text-xl font-sans font-bold text-white">
                Your Contact Details
              </h2>
              <p className="text-white/80 text-sm mt-1">
                We'll use this to confirm your reservation
              </p>
            </div>

            {/* Summary Bar */}
            <div className="bg-cream px-8 py-4 border-b border-gray-100">
              <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-dark">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-primary" />
                  {reservationsService.formatDate(selectedDate)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-primary" />
                  {formatTimeDisplay(selectedTime)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-primary" />
                  {partySize} {partySize === 1 ? "Guest" : "Guests"}
                </span>
                <span className="flex items-center gap-1.5">
                  <TableIcon className="w-4 h-4 text-primary" />
                  Table #{selectedTable?.tableNumber} — {selectedTable?.name}
                </span>
              </div>
            </div>

            <div className="p-8 space-y-5">
              {/* Guest Banner */}
              {!isAuthenticated && (
                <div className="bg-amber-50 border-2 border-amber-200 rounded-xl px-4 py-3 flex items-start gap-3">
                  <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-amber-800 text-sm">
                      Booking as a Guest
                    </p>
                    <p className="text-amber-700 text-xs mt-0.5">
                      <button
                        onClick={() => navigate("/login")}
                        className="underline font-semibold"
                      >
                        Sign in
                      </button>{" "}
                      to track your reservations easily, or continue as guest
                      below.
                    </p>
                  </div>
                </div>
              )}

              {/* Full Name */}
              <div className="space-y-2">
                <label className="block text-dark font-semibold text-sm">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                  </div>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="John Smith"
                    className={`w-full pl-12 pr-4 py-4 rounded-xl border-2 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all text-dark placeholder:text-gray-400 ${
                      formErrors.fullName
                        ? "border-red-300 focus:border-red-400"
                        : "border-gray-200 focus:border-primary"
                    }`}
                  />
                </div>
                {formErrors.fullName && (
                  <p className="text-red-500 text-xs">{formErrors.fullName}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="block text-dark font-semibold text-sm">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="you@example.com"
                    className={`w-full pl-12 pr-4 py-4 rounded-xl border-2 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all text-dark placeholder:text-gray-400 ${
                      formErrors.email
                        ? "border-red-300 focus:border-red-400"
                        : "border-gray-200 focus:border-primary"
                    }`}
                  />
                </div>
                {formErrors.email && (
                  <p className="text-red-500 text-xs">{formErrors.email}</p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label className="block text-dark font-semibold text-sm">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Phone className="w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+92 300 0000000"
                    className={`w-full pl-12 pr-4 py-4 rounded-xl border-2 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all text-dark placeholder:text-gray-400 ${
                      formErrors.phone
                        ? "border-red-300 focus:border-red-400"
                        : "border-gray-200 focus:border-primary"
                    }`}
                  />
                </div>
                {formErrors.phone && (
                  <p className="text-red-500 text-xs">{formErrors.phone}</p>
                )}
              </div>

              {/* Special Requests */}
              <div className="space-y-2">
                <label className="block text-dark font-semibold text-sm">
                  Special Requests{" "}
                  <span className="text-dark-gray font-normal">(optional)</span>
                </label>
                <div className="relative group">
                  <div className="absolute top-4 left-4 pointer-events-none">
                    <MessageSquare className="w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                  </div>
                  <textarea
                    name="specialRequests"
                    value={formData.specialRequests}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Allergies, birthday celebration, high chair needed, etc."
                    className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all text-dark placeholder:text-gray-400 resize-none"
                  />
                </div>
              </div>

              {/* Guest Details (Optional) */}
              <div className="space-y-4 border-2 border-dashed border-gray-200 rounded-2xl p-5">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                    <UserPlus className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-dark text-sm">
                      Add Guest Names{" "}
                      <span className="text-dark-gray font-normal">
                        (optional)
                      </span>
                    </p>
                    <p className="text-xs text-dark-gray mt-0.5">
                      Would you like to add names for your guests? You can add
                      up to {partySize}{" "}
                      {partySize === 1 ? "guest" : "guests"}.
                    </p>
                  </div>
                </div>

                {/* Toggle buttons */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => handleToggleGuestList(true)}
                    className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                      hasGuestList
                        ? "bg-primary text-white border-primary shadow-md shadow-primary/20"
                        : "border-gray-200 text-dark-gray hover:border-primary/50 hover:text-primary"
                    }`}
                  >
                    Yes, add guest names
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleGuestList(false)}
                    className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                      !hasGuestList
                        ? "bg-gray-100 text-dark border-gray-300"
                        : "border-gray-200 text-dark-gray hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    No, skip this
                  </button>
                </div>

                {/* Guest list form */}
                {hasGuestList && (
                  <div className="space-y-3 pt-1">
                    <p className="text-xs font-semibold text-dark-gray uppercase tracking-wider">
                      Guest Details ({guestList.length}/{partySize} added)
                    </p>
                    {guestList.map((guest, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 rounded-xl p-4 space-y-3 relative"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-primary">
                            Guest {index + 1}
                          </span>
                          {guestList.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveGuest(index)}
                              className="w-6 h-6 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-100 hover:text-red-600 transition-all"
                              title="Remove guest"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        <input
                          type="text"
                          value={guest.name}
                          onChange={(e) =>
                            handleGuestChange(index, "name", e.target.value)
                          }
                          placeholder="Guest name *"
                          maxLength={80}
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all text-dark text-sm placeholder:text-gray-400"
                        />
                        <input
                          type="text"
                          value={guest.note}
                          onChange={(e) =>
                            handleGuestChange(index, "note", e.target.value)
                          }
                          placeholder="Any note (e.g. dietary requirement) — optional"
                          maxLength={120}
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all text-dark text-sm placeholder:text-gray-400"
                        />
                      </div>
                    ))}
                    {guestList.length < partySize && (
                      <button
                        type="button"
                        onClick={handleAddGuest}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-primary/40 text-primary text-sm font-semibold hover:border-primary hover:bg-cream-light transition-all"
                      >
                        <Plus className="w-4 h-4" />
                        Add Another Guest
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-gray-100 px-8 py-5 bg-gray-50 flex items-center justify-between gap-4">
              <button
                onClick={() => setStep(2)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-gray-200 text-dark-gray font-semibold hover:border-gray-300 hover:bg-white transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary-dark text-white px-8 py-3.5 rounded-xl font-semibold hover:shadow-lg hover:shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Confirming...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Confirm Reservation
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ─── STEP 4: Confirmation ─── */}
        {step === 4 && confirmedReservation && (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Success Header */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 px-8 py-10 text-center">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-2xl font-sans font-bold text-white mb-1">
                Reservation Confirmed!
              </h2>
              <p className="text-white/80">
                A confirmation has been sent to your email
              </p>
            </div>

            {/* Reservation ID */}
            <div className="bg-cream text-center px-8 py-5 border-b border-gray-100">
              <p className="text-xs text-dark-gray font-medium uppercase tracking-wider mb-1">
                Reservation ID
              </p>
              <p className="text-2xl font-bold font-mono text-primary">
                {confirmedReservation.reservationId}
              </p>
            </div>

            {/* Details Grid */}
            <div className="p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  {
                    icon: Calendar,
                    label: "Date",
                    value: reservationsService.formatDate(
                      confirmedReservation.reservationDate,
                    ),
                  },
                  {
                    icon: Clock,
                    label: "Time",
                    value: formatTimeDisplay(
                      confirmedReservation.reservationTime,
                    ),
                  },
                  {
                    icon: Users,
                    label: "Party Size",
                    value: `${confirmedReservation.partySize} ${confirmedReservation.partySize === 1 ? "Guest" : "Guests"}`,
                  },
                  {
                    icon: TableIcon,
                    label: "Table",
                    value: confirmedReservation.tableId
                      ? `Table #${confirmedReservation.tableId.tableNumber} — ${confirmedReservation.tableId.name} (${confirmedReservation.tableId.location})`
                      : `Table #${selectedTable?.tableNumber} — ${selectedTable?.name}`,
                  },
                  {
                    icon: User,
                    label: "Name",
                    value: confirmedReservation.fullName,
                  },
                  {
                    icon: Mail,
                    label: "Email",
                    value: confirmedReservation.email,
                  },
                ].map(({ icon: Icon, label, value }) => (
                  <div
                    key={label}
                    className="flex items-start gap-3 bg-gray-50 rounded-2xl p-4"
                  >
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-dark-gray font-medium">
                        {label}
                      </p>
                      <p className="text-sm font-semibold text-dark mt-0.5">
                        {value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {confirmedReservation.specialRequests && (
                <div className="mt-4 bg-amber-50 border border-amber-200 rounded-2xl p-4">
                  <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-1">
                    Special Requests
                  </p>
                  <p className="text-sm text-amber-800 italic">
                    "{confirmedReservation.specialRequests}"
                  </p>
                </div>
              )}

              <p className="text-center text-xs text-dark-gray mt-6 leading-relaxed">
                Please arrive a few minutes before your reservation time.
                <br />
                If you need to cancel or modify, please contact us as soon as
                possible.
              </p>
            </div>

            {/* Actions */}
            <div className="border-t border-gray-100 px-8 py-5 bg-gray-50 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => {
                  setStep(1);
                  setSelectedDate("");
                  setSelectedTime("");
                  setPartySize(2);
                  setSelectedTable(null);
                  setFormData({
                    fullName: currentUser?.name || "",
                    email: currentUser?.email || "",
                    phone: "",
                    specialRequests: "",
                  });
                  setHasGuestList(false);
                  setGuestList([{ name: "", note: "" }]);
                  setConfirmedReservation(null);
                }}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-gray-200 text-dark-gray font-semibold hover:border-primary hover:text-primary transition-all"
              >
                <Calendar className="w-4 h-4" />
                Make Another Reservation
              </button>
              {isAuthenticated && (
                <button
                  onClick={() => navigate("/my-reservations")}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-primary-dark text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-primary/30 transition-all"
                >
                  <CalendarCheck className="w-4 h-4" />
                  View My Reservations
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reservations;
