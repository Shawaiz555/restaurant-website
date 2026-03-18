import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { showNotification } from "../../store/slices/notificationSlice";
import tablesService from "../../services/tablesService";
import reservationsService from "../../services/reservationsService";
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
  ChevronDown,
  LayoutGrid,
  Layers,
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
  const [selectedTables, setSelectedTables] = useState([]);
  const [loadingTables, setLoadingTables] = useState(false);
  const [tableMode, setTableMode] = useState(null); // null | 'custom' | 'stacked'

  // Booked times for the selected date
  const [bookedTimes, setBookedTimes] = useState([]);
  const [loadingBookedTimes, setLoadingBookedTimes] = useState(false);
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  const timeDropdownRef = useRef(null);
  const dateInputRef = useRef(null);
  const step2Ref = useRef(null);
  const stepSectionRef = useRef(null);
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

  // Scroll to the step indicator on step or mode change; fall back to page top for step 4
  useEffect(() => {
    setTimeout(() => {
      if (stepSectionRef.current) {
        stepSectionRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }, 50);
  }, [step, tableMode]);

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

  // Close time dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (
        timeDropdownRef.current &&
        !timeDropdownRef.current.contains(e.target)
      ) {
        setShowTimeDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Fetch booked times whenever the date or party size changes
  useEffect(() => {
    if (!selectedDate) {
      setBookedTimes([]);
      return;
    }
    setLoadingBookedTimes(true);
    reservationsService
      .getBookedTimes(selectedDate, partySize)
      .then((times) => {
        setBookedTimes(times);
        // If the currently selected time just became booked, clear it
        if (selectedTime && times.includes(selectedTime)) {
          setSelectedTime("");
        }
      })
      .finally(() => setLoadingBookedTimes(false));
  }, [selectedDate, partySize]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchAvailableTables = useCallback(async () => {
    if (!selectedDate || !selectedTime) return;
    setLoadingTables(true);
    setSelectedTables([]);
    setTableMode(null);
    try {
      const tables = await tablesService.getAvailableTables({
        date: selectedDate,
        time: selectedTime,
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
  }, [selectedDate, selectedTime, dispatch]);

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

  // When stacked mode is chosen: skip table picker, go directly to Step 3
  const handleSelectStackedMode = () => {
    setTableMode("stacked");
    setSelectedTables([]); // no manual table selection needed
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

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!validateStep3()) return;
    if (!validateGuestList()) return;
    setSubmitting(true);
    try {
      const result = await reservationsService.createReservation({
        tableIds:
          tableMode === "stacked" ? [] : selectedTables.map((t) => t._id),
        tableSelectionMode: tableMode,
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
    const cap = combinedCapacity || partySize;
    if (guestList.length < cap) {
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
    const cap = combinedCapacity || partySize;
    if (guestList.length > cap) {
      dispatch(
        showNotification({
          type: "error",
          message: `Cannot add more guests than the combined table capacity (${cap} seats)`,
        }),
      );
      return false;
    }
    return true;
  };

  // Multi-table selection helpers (computed from state)
  // In 'stacked' mode, always force multi-select regardless of individual table capacity
  const needsMultiSelect =
    tableMode === "stacked" ||
    (availableTables.length > 0 &&
      availableTables.every((t) => t.capacity < partySize));
  const combinedCapacity = selectedTables.reduce((s, t) => s + t.capacity, 0);

  // Ref for smooth scrolling when a table is selected in multi-select mode
  const tableGridRef = useRef(null);

  // Compute the remaining seats needed after current selections
  const remaining = Math.max(0, partySize - combinedCapacity);

  // For multi-select: determine which capacity tier to show for the FINAL pick.
  // When remaining can be covered by a single table: show smallest table >= remaining.
  // When no single table covers remaining (remaining > max cap): show ALL sizes — user
  // must keep picking; tier restriction only kicks in on the last piece.
  const targetCapacity = useMemo(() => {
    if (!needsMultiSelect || remaining <= 0) return null;
    const unselected = availableTables.filter(
      (t) => !selectedTables.some((s) => s._id === t._id),
    );
    if (!unselected.length) return null;
    const maxCap = Math.max(...unselected.map((t) => t.capacity));
    // If remaining > max available cap, no single table can finish the job — show all
    if (remaining > maxCap) return "ALL";
    // Otherwise find the smallest table that covers the remaining seats
    const fits = unselected.filter((t) => t.capacity >= remaining);
    return Math.min(...fits.map((t) => t.capacity));
  }, [needsMultiSelect, remaining, availableTables, selectedTables]);

  // filteredTables:
  //  • Selected tables always shown (so user can deselect)
  //  • Single-select: only tables with capacity >= partySize
  //  • Multi-select, capacity met: hide all unselected
  //  • Multi-select, targetCapacity === "ALL": show every unselected table
  //  • Multi-select, final pick: show only tables matching the target tier
  //  Sort: selected first, then capacity descending
  const filteredTables = useMemo(() => {
    if (!availableTables.length) return [];

    return availableTables
      .filter((t) => {
        const isSelected = selectedTables.some((s) => s._id === t._id);
        if (isSelected) return true;
        if (!needsMultiSelect) return t.capacity >= partySize;
        if (remaining <= 0) return false;
        if (targetCapacity === "ALL") return true; // remaining > max cap: show all
        return t.capacity === targetCapacity; // final-pick tier
      })
      .sort((a, b) => {
        const aSelected = selectedTables.some((s) => s._id === a._id) ? 0 : 1;
        const bSelected = selectedTables.some((s) => s._id === b._id) ? 0 : 1;
        if (aSelected !== bSelected) return aSelected - bSelected;
        return b.capacity - a.capacity;
      });
  }, [
    availableTables,
    selectedTables,
    needsMultiSelect,
    partySize,
    remaining,
    targetCapacity,
  ]);

  // A table is click-disabled when it's already excluded from filteredTables;
  // but for the grid render we still need an isDisabled per visible table.
  // Selected tables are never disabled (allow deselect).
  // Unselected tables in multi-select are disabled once capacity is met.
  const isTableDisabled = useCallback(
    (table) => {
      const isSelected = selectedTables.some((t) => t._id === table._id);
      if (isSelected) return false;
      if (!needsMultiSelect) return table.capacity < partySize;
      return remaining <= 0;
    },
    [selectedTables, needsMultiSelect, partySize, remaining],
  );

  const handleTableClick = (table) => {
    if (needsMultiSelect) {
      setSelectedTables((prev) => {
        const isSelected = prev.some((t) => t._id === table._id);
        if (isSelected) return prev.filter((t) => t._id !== table._id);
        // Block adding more tables if combined capacity already meets party size
        const currentCapacity = prev.reduce((s, t) => s + t.capacity, 0);
        if (currentCapacity >= partySize) return prev;
        return [...prev, table];
      });
    } else {
      setSelectedTables([table]);
    }
  };

  // Step indicator
  const steps = [
    { num: 1, label: "Date & Time" },
    { num: 2, label: "Choose Table" },
    { num: 3, label: "Your Details" },
    { num: 4, label: "Confirmed" },
  ];

  return (
    <div className="min-h-screen bg-[#faf9f6] pt-44 pb-20 px-3 relative overflow-hidden">
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
            Book Your <span className="text-primary">Reservation</span>
          </h1>
          <p className="text-dark-gray text-sm sm:text-base lg:text-lg max-w-xl mx-auto font-medium leading-relaxed opacity-80 px-4">
            Join us for an unforgettable culinary journey. Reserve your
            preferred spot in simple steps.
          </p>
        </div>

        {/* Step Indicator */}
        {step < 4 && (
          <div
            ref={stepSectionRef}
            className="flex items-center justify-center mb-10 sm:mb-12 max-w-4xl mx-auto px-4"
          >
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
            <div className="bg-primary px-6 sm:px-10 py-6 sm:py-8 border-b border-gray-50 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-full bg-primary/5 -skew-x-12 translate-x-10" />
              <h2 className="text-xl sm:text-2xl lg:text-4xl font-bold text-white text-center relative z-10">
                Plan Your Visit
              </h2>
              <p className="text-white text-[10px] sm:text-xs text-center font-bold uppercase tracking-widest mt-1 relative z-10">
                Step 1: Date, Time & Group Size
              </p>
            </div>
            <div className="p-4 sm:p-8 space-y-8 sm:space-y-10">
              {/* Date */}
              <div className="space-y-3 border-2 border-gray-100 rounded-2xl p-3">
                <label className="block text-dark font-bold text-[10px] sm:text-xs tracking-wide uppercase px-1">
                  <Calendar className="w-4 h-4 inline mr-2 text-primary" />
                  Select Date
                </label>
                {/* Clicking anywhere on the box opens the native date picker */}
                <div
                  className={`relative flex items-center px-4 sm:px-6 rounded-xl sm:rounded-2xl border-2 transition-all cursor-pointer ${
                    selectedDate
                      ? "border-primary bg-white"
                      : "border-gray-100 bg-gray-50 hover:border-gray-200"
                  }`}
                  onClick={() => dateInputRef.current?.showPicker()}
                >
                  <Calendar
                    className={`w-5 h-5 flex-shrink-0 mr-3 transition-colors ${selectedDate ? "text-primary" : "text-dark-gray/30"}`}
                  />
                  <input
                    ref={dateInputRef}
                    type="date"
                    value={selectedDate}
                    min={getTodayStr()}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="flex-1 py-4 sm:py-5 bg-transparent focus:outline-none text-dark text-sm sm:text-md cursor-pointer [color-scheme:light]"
                  />
                </div>
              </div>

              {/* Time Slots */}
              <div className="space-y-3 border-2 border-gray-100 rounded-2xl p-3">
                <label className="block text-dark font-bold text-[10px] sm:text-xs tracking-wide uppercase px-1">
                  <Clock className="w-4 h-4 inline mr-2 text-primary" />
                  Select Time Slot
                </label>
                <div className="relative" ref={timeDropdownRef}>
                  {/* Trigger button */}
                  <button
                    type="button"
                    disabled={loadingBookedTimes}
                    onClick={() => setShowTimeDropdown((v) => !v)}
                    className={`w-full flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 rounded-xl sm:rounded-2xl border-2 transition-all text-sm sm:text-md disabled:opacity-50 disabled:cursor-not-allowed ${
                      showTimeDropdown
                        ? "border-primary bg-white"
                        : "border-gray-100 bg-gray-50 hover:border-gray-200"
                    }`}
                  >
                    <span
                      className={
                        selectedTime
                          ? "text-dark font-medium"
                          : "text-dark-gray/40"
                      }
                    >
                      {loadingBookedTimes
                        ? "Loading availability..."
                        : selectedTime
                          ? formatTimeDisplay(selectedTime)
                          : "-- Select a time slot --"}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 ${
                        showTimeDropdown
                          ? "rotate-180 text-primary"
                          : "text-dark-gray/40"
                      }`}
                    />
                  </button>

                  {/* Dropdown panel — always opens downward */}
                  {showTimeDropdown && (
                    <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-white border-2 border-gray-100 rounded-xl sm:rounded-2xl shadow-2xl shadow-black/10 overflow-hidden">
                      <div className="max-h-72 overflow-y-auto">
                        {[
                          {
                            label: "🍽 Lunch (11:00 – 14:30)",
                            slots: TIME_SLOTS.filter(
                              (t) =>
                                parseInt(t.split(":")[0]) < 17 &&
                                !bookedTimes.includes(t),
                            ),
                          },
                          {
                            label: "🌙 Dinner (18:00 – 21:30)",
                            slots: TIME_SLOTS.filter(
                              (t) =>
                                parseInt(t.split(":")[0]) >= 17 &&
                                !bookedTimes.includes(t),
                            ),
                          },
                        ].map(({ label, slots }) => (
                          <div key={label}>
                            <div className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-dark-gray/50 bg-gray-50 border-b border-gray-100 sticky top-0">
                              {label}
                            </div>
                            {slots.length === 0 ? (
                              <div className="px-5 py-3 text-sm text-gray-400 italic">
                                No available slots
                              </div>
                            ) : (
                              slots.map((t) => {
                                const isSelected = selectedTime === t;
                                return (
                                  <button
                                    key={t}
                                    type="button"
                                    onClick={() => {
                                      setSelectedTime(t);
                                      setShowTimeDropdown(false);
                                    }}
                                    className={`w-full text-left px-5 py-3 text-sm transition-colors flex items-center justify-between ${
                                      isSelected
                                        ? "bg-primary/5 text-primary font-bold"
                                        : "text-dark hover:bg-gray-50"
                                    }`}
                                  >
                                    <span>{formatTimeDisplay(t)}</span>
                                    {isSelected && (
                                      <CheckCircle className="w-4 h-4 text-primary" />
                                    )}
                                  </button>
                                );
                              })
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                {selectedTime && (
                  <p className="text-xs font-bold text-primary px-1 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    Selected: {formatTimeDisplay(selectedTime)}
                  </p>
                )}
              </div>

              {/* Party Size */}
              <div className="space-y-3 border-2 border-gray-100 rounded-2xl p-3">
                <label className="block text-dark font-bold text-[10px] sm:text-xs tracking-wide uppercase px-1">
                  <Users className="w-4 h-4 inline mr-2 text-primary" />
                  Group Size
                </label>

                {/* Stepper row */}
                <div className="w-full flex justify-center">
                  <div className="w-full max-w-[280px] flex items-center gap-4 px-1">
                    <button
                      type="button"
                      onClick={() => setPartySize((p) => Math.max(1, p - 1))}
                      disabled={partySize <= 1}
                      className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shadow-md shadow-primary/30 hover:bg-primary-dark disabled:bg-gray-200 disabled:shadow-none disabled:cursor-not-allowed transition-all active:scale-95 flex-shrink-0"
                    >
                      <span className="text-xl font-bold leading-none mb-0.5">
                        −
                      </span>
                    </button>

                    <div className="flex-1 flex flex-col items-center">
                      <span className="text-4xl lg:text-5xl font-bold text-primary tabular-nums leading-none">
                        {partySize}
                      </span>
                      <span className="text-[10px] font-bold text-dark-gray/40 uppercase tracking-[0.18em] mt-1">
                        {partySize === 1 ? "Guest" : "Guests"}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setPartySize((p) => p + 1)}
                      className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shadow-md shadow-primary/30 hover:bg-primary-dark transition-all active:scale-95 flex-shrink-0"
                    >
                      <span className="text-xl font-bold leading-none mb-0.5">
                        +
                      </span>
                    </button>
                  </div>
                </div>

                {/* Quick-pick presets */}
                <div className="flex flex-wrap justify-center gap-2 pt-1 border-t border-gray-50">
                  {[1, 2, 3, 4, 5, 6, 8, 10, 12, 15, 20].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setPartySize(n)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border-2 ${
                        partySize === n
                          ? "bg-primary border-primary text-white shadow-md shadow-primary/20"
                          : "bg-white border-gray-100 text-dark-gray/40 hover:border-primary/30 hover:text-primary"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
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
          <div
            ref={step2Ref}
            className="bg-white rounded-[1.5rem] sm:rounded-[2.5rem] shadow-2xl shadow-black/[0.03] border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-500"
          >
            <div className="bg-primary px-6 sm:px-10 py-6 sm:py-8 border-b border-gray-50 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-full bg-primary/5 -skew-x-12 translate-x-10" />
              <h2 className="text-xl sm:text-2xl lg:text-4xl text-center font-bold text-white relative z-10">
                {tableMode === null
                  ? "How Would You Like to Sit?"
                  : "Choose Your Table"}
              </h2>
              <p className="text-white text-[10px] text-center sm:text-xs font-bold uppercase tracking-widest mt-1 relative z-10">
                {tableMode === null
                  ? "Step 2: Select Your Seating Preference"
                  : tableMode === "stacked"
                    ? "Step 2: Stack Tables for Your Group"
                    : "Step 2: Pick Your Table"}
              </p>
              <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mt-2 sm:mt-3 relative z-10 text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-widest">
                <span className="flex items-center gap-1.5 bg-white text-primary px-3 sm:px-3 py-1 sm:py-1.5 rounded-full border border-gray-100">
                  <Calendar className="w-3 h-3 text-primary" />
                  {reservationsService.formatDate(selectedDate)}
                </span>
                <span className="flex items-center gap-1.5 bg-white text-primary px-3 sm:px-3 py-1 sm:py-1.5 rounded-full border border-gray-100">
                  <Clock className="w-3 h-3 text-primary" />
                  {formatTimeDisplay(selectedTime)}
                </span>
                <span className="flex items-center gap-1.5 bg-white text-primary px-3 sm:px-3 py-1 sm:py-1.5 rounded-full border border-gray-100">
                  <Users className="w-3 h-3 text-primary" />
                  {partySize} Guests
                </span>
              </div>
            </div>

            <div className="p-6 sm:p-10">
              {/* ── Phase A: Mode Picker ── */}
              {tableMode === null && (
                <div className="animate-in fade-in slide-in-from-bottom-3 duration-400">
                  <p className="text-center text-sm font-medium text-dark-gray/60 mb-8">
                    Choose how you'd like to arrange your seating for{" "}
                    <span className="font-bold text-dark">
                      {partySize} guests
                    </span>
                    .
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 mb-10">
                    {/* Custom Selection Card */}
                    <button
                      onClick={() => setTableMode("custom")}
                      className="group text-left p-6 sm:p-8 rounded-2xl sm:rounded-3xl border-2 border-gray-100 bg-gray-50 hover:border-primary/30 hover:bg-white hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:scale-[1.02]"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-white border border-gray-100 flex items-center justify-center mb-5 shadow-sm group-hover:bg-primary group-hover:border-primary transition-all duration-300">
                        <LayoutGrid className="w-7 h-7 text-dark-gray/50 group-hover:text-white transition-colors duration-300" />
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-dark mb-2 group-hover:text-primary transition-colors">
                        Custom Selection
                      </h3>
                      <p className="text-sm text-dark-gray/60 leading-relaxed">
                        Browse available tables and pick the one that suits you
                        best. For large parties, you can select multiple tables.
                      </p>
                      <div className="mt-5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary opacity-0 group-hover:opacity-100 transition-all translate-x-0 group-hover:translate-x-1 duration-300">
                        Choose tables
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </button>

                    {/* Stack Tables Card */}
                    <button
                      onClick={handleSelectStackedMode}
                      className="group text-left p-6 sm:p-8 rounded-2xl sm:rounded-3xl border-2 border-gray-100 bg-gray-50 hover:border-primary/30 hover:bg-white hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:scale-[1.02]"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-white border border-gray-100 flex items-center justify-center mb-5 shadow-sm group-hover:bg-primary group-hover:border-primary transition-all duration-300">
                        <Layers className="w-7 h-7 text-dark-gray/50 group-hover:text-white transition-colors duration-300" />
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-dark mb-2 group-hover:text-primary transition-colors">
                        Stack Tables
                      </h3>
                      <p className="text-sm text-dark-gray/60 leading-relaxed">
                        Combine multiple adjacent tables together to create a
                        larger seating area for your whole group.
                      </p>
                      <div className="mt-5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary opacity-0 group-hover:opacity-100 transition-all translate-x-0 group-hover:translate-x-1 duration-300">
                        Stack tables
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </button>
                  </div>

                  <div className="flex justify-start border-t border-gray-50 pt-6">
                    <button
                      onClick={() => setStep(1)}
                      className="text-[10px] sm:text-xs font-bold text-dark-gray/40 uppercase tracking-widest hover:text-dark transition-colors px-6 py-4"
                    >
                      ← Back to Selection
                    </button>
                  </div>
                </div>
              )}

              {/* ── Phase B: Table Grid ── */}
              {tableMode !== null && (
                <div className="animate-in fade-in slide-in-from-bottom-3 duration-400">
                  {/* Mode indicator + change button */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        {tableMode === "custom" ? (
                          <LayoutGrid className="w-4 h-4 text-primary" />
                        ) : (
                          <Layers className="w-4 h-4 text-primary" />
                        )}
                      </div>
                      <span className="text-sm font-bold text-dark">
                        {tableMode === "custom"
                          ? "Custom Selection"
                          : "Stack Tables"}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setTableMode(null);
                        setSelectedTables([]);
                      }}
                      className="text-[10px] sm:text-xs font-bold text-primary/70 uppercase tracking-widest hover:text-primary transition-colors flex items-center gap-1.5"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      Change Mode
                    </button>
                  </div>

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
                        We're sorry, but no tables are available for your
                        selection. Try adjusting your time or choosing a
                        different date.
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
                      {/* Multi-select banner */}
                      {needsMultiSelect && (
                        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 flex flex-col gap-3">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                              {tableMode === "stacked" ? (
                                <Layers className="w-4 h-4 text-amber-600" />
                              ) : (
                                <Users className="w-4 h-4 text-amber-600" />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-amber-800">
                                {tableMode === "stacked"
                                  ? `Stacking Mode — Combine Tables for ${partySize} Guests`
                                  : `Party of ${partySize} — Multiple Tables Needed`}
                              </p>
                              <p className="text-xs text-amber-700 mt-0.5">
                                {tableMode === "stacked"
                                  ? "Select 2 or more tables to stack together and create a larger seating area for your group."
                                  : "No single table fits your group. Select multiple tables until the combined capacity meets your party size."}
                              </p>
                            </div>
                          </div>
                          {/* Capacity progress bar */}
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                              <span className="text-amber-700">
                                Combined Capacity
                              </span>
                              <span
                                className={
                                  combinedCapacity >= partySize
                                    ? "text-green-600"
                                    : "text-amber-700"
                                }
                              >
                                {combinedCapacity} / {partySize} seats
                              </span>
                            </div>
                            <div className="h-2 bg-amber-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${combinedCapacity >= partySize ? "bg-green-500" : "bg-amber-400"}`}
                                style={{
                                  width: `${Math.min(100, (combinedCapacity / partySize) * 100)}%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Legend */}
                      <div className="flex flex-wrap gap-4 sm:gap-6 mb-8 sm:mb-10 pb-6 border-b border-gray-50 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-dark-gray/40 justify-center">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />{" "}
                          Available Areas
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-primary" />{" "}
                          Your Selection
                        </div>
                        <div className="flex items-center gap-2">
                          <TableIcon className="w-3 h-3 opacity-40" />{" "}
                          {needsMultiSelect
                            ? "Select Multiple"
                            : "Select to Confirm"}
                        </div>
                      </div>

                      {/* Group tables by location */}
                      <div
                        ref={tableGridRef}
                        className="space-y-8 sm:space-y-10"
                      >
                        {["Indoor", "Outdoor", "VIP", "Bar"].map((loc) => {
                          const locationTables = filteredTables.filter(
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
                                  const isSelected = selectedTables.some(
                                    (t) => t._id === table._id,
                                  );
                                  const isDisabled = isTableDisabled(table);
                                  return (
                                    <button
                                      key={table._id}
                                      onClick={() => handleTableClick(table)}
                                      disabled={isDisabled}
                                      className={`group relative text-left rounded-2xl sm:rounded-3xl transition-all duration-300 ${
                                        isDisabled
                                          ? "opacity-40 cursor-not-allowed"
                                          : isSelected
                                            ? "ring-4 ring-primary/10 scale-[1.02]"
                                            : "hover:scale-[1.01]"
                                      }`}
                                    >
                                      <div
                                        className={`h-full p-5 sm:p-6 rounded-2xl sm:rounded-3xl border-2 transition-all duration-300 flex flex-col gap-3 sm:gap-4 ${
                                          isSelected
                                            ? "bg-white border-primary shadow-xl shadow-primary/10"
                                            : isDisabled
                                              ? "bg-gray-50 border-transparent"
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
                      onClick={() => {
                        setTableMode(null);
                        setSelectedTables([]);
                      }}
                      className="w-full sm:w-auto text-[10px] sm:text-xs font-bold text-dark-gray/40 uppercase tracking-widest hover:text-dark transition-colors px-6 py-4"
                    >
                      ← Change Mode
                    </button>
                    <button
                      disabled={
                        tableMode === "stacked"
                          ? selectedTables.length < 2 ||
                            combinedCapacity < partySize
                          : needsMultiSelect
                            ? combinedCapacity < partySize
                            : selectedTables.length === 0
                      }
                      onClick={() => setStep(3)}
                      className={`w-full sm:w-auto flex items-center justify-center gap-3 px-8 sm:px-10 py-4 sm:py-5 rounded-xl sm:rounded-2xl font-bold uppercase tracking-widest text-[10px] sm:text-xs transition-all shadow-xl ${
                        (
                          tableMode === "stacked"
                            ? selectedTables.length >= 2 &&
                              combinedCapacity >= partySize
                            : needsMultiSelect
                              ? combinedCapacity >= partySize
                              : selectedTables.length > 0
                        )
                          ? "bg-primary text-white shadow-xl shadow-primary/20 hover:bg-primary-dark hover:-translate-y-0.5"
                          : "bg-gray-100 text-gray-300 cursor-not-allowed"
                      }`}
                    >
                      {selectedTables.length > 1
                        ? `Book ${selectedTables.length} Tables`
                        : "Book This Table"}
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── STEP 3: Contact Details ─── */}
        {step === 3 && (
          <div className="bg-white rounded-[1.5rem] sm:rounded-[2.5rem] shadow-2xl shadow-black/[0.03] border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-500">
            <div className="bg-primary px-6 sm:px-10 py-6 sm:py-8 border-b border-gray-50 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-full bg-primary/5 -skew-x-12 translate-x-10" />
              <h2 className="text-xl sm:text-2xl lg:text-4xl text-center font-bold text-white relative z-10">
                Contact Details
              </h2>
              <p className="text-white text-[10px] text-center sm:text-xs font-bold uppercase tracking-widest mt-1 relative z-10">
                Step 3: Secure Your Reservation
              </p>
            </div>

            <div className="p-6 sm:p-10">
              <form onSubmit={handleSubmit} className="space-y-8 sm:space-y-10">
                {/* Summary Banner */}
                <div className="bg-gray-50/50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-gray-200 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-dark shadow-sm border border-gray-100 flex-shrink-0">
                      {tableMode === "stacked" ? (
                        <Layers className="w-5 h-5 text-amber-500" />
                      ) : (
                        <TableIcon className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-dark-gray/50 uppercase tracking-widest mb-0.5">
                        {tableMode === "stacked"
                          ? "Seating Mode"
                          : selectedTables.length > 1
                            ? "Selected Tables"
                            : "Selected Table"}
                      </p>
                      {tableMode === "stacked" ? (
                        <p className="text-sm font-bold text-dark">
                          Stacked — Admin Arranged ({partySize} seats)
                        </p>
                      ) : selectedTables.length > 1 ? (
                        <div className="space-y-0.5">
                          {selectedTables.map((t) => (
                            <p
                              key={t._id}
                              className="text-sm font-bold text-dark"
                            >
                              Table #{t.tableNumber} ({t.location})
                            </p>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm font-bold text-dark">
                          Table #{selectedTables[0]?.tableNumber} (
                          {selectedTables[0]?.location})
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="w-full h-px sm:w-px sm:h-10 bg-gray-200" />
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-dark shadow-sm border border-gray-100 flex-shrink-0">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-dark-gray/50 uppercase tracking-widest mb-0.5">
                        Date & Time
                      </p>
                      <p className="text-sm font-bold text-dark">
                        {reservationsService.formatDate(selectedDate)} at{" "}
                        {formatTimeDisplay(selectedTime)}
                      </p>
                    </div>
                  </div>
                </div>

                {!isAuthenticated && (
                  <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm border border-gray-200">
                      <User className="w-6 h-6 text-dark" />
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 border border-gray-200 rounded-2xl p-4">
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
                <div className="overflow-hidden rounded-2xl sm:rounded-3xl border border-gray-200 bg-gray-50/50">
                  <div className="p-5 sm:p-8 bg-white flex flex-col sm:flex-row items-center gap-6 justify-between border-b border-gray-200">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-dark border border-gray-200 shadow-sm">
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
                          className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm relative group/guest transition-all"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-bold text-dark flex items-center gap-2">
                              Guest #{index + 1}
                              {index === 0 && (
                                <span className="text-[8px] px-2 py-0.5 bg-white text-dark border border-gray-200 rounded-full uppercase tracking-tighter">
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
                              className={`w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary focus:outline-none transition-all text-xs font-medium ${
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

                      {guestList.length < (combinedCapacity || partySize) && (
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
                    onClick={() => {
                      if (tableMode === "stacked") {
                        setTableMode(null);
                        setSelectedTables([]);
                      }
                      setStep(2);
                    }}
                    className="w-full sm:w-auto text-[10px] sm:text-xs font-bold text-dark-gray/40 uppercase tracking-widest hover:text-dark transition-colors px-6 py-4"
                  >
                    ← Back
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
            <div className="bg-white rounded-[2rem] sm:rounded-[3rem] p-8 py-6 sm:p-12 sm:py-6 text-center shadow-2xl shadow-black/[0.03] border border-gray-100 mb-8 sm:mb-10 relative overflow-hidden">
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
              <div className="bg-primary px-6 sm:px-10 py-6 sm:py-8 border-b border-gray-50 flex items-center justify-between">
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white">
                    Reservation Details
                  </h3>
                  <p className="text-white text-[10px] sm:text-xs font-bold uppercase tracking-widest mt-1">
                    Booking ID: #
                    {confirmedReservation.reservationId ||
                      confirmedReservation._id?.slice(-8).toUpperCase()}
                  </p>
                </div>
                <div className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-full font-bold text-[11px] uppercase tracking-wider">
                  <CheckCircle className="w-5 h-5" />
                  CONFIRMED
                </div>
              </div>

              <div className="p-4 sm:p-6 sm:py-8 space-y-6">
                {/* Information Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12">
                  {/* Guest Information */}
                  <div className="space-y-6 border border-gray-200 p-4 rounded-2xl">
                    <h4 className="text-xs font-black text-dark uppercase tracking-[0.2em] flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Guest Information
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <p className="text-[10px] font-bold text-dark-gray/40 uppercase tracking-widest mb-1">
                          Full Name
                        </p>
                        <p className="text-sm font-semibold text-dark">
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
                  <div className="space-y-6 border border-gray-200 p-4 rounded-2xl">
                    <h4 className="text-xs font-black text-dark uppercase tracking-[0.2em] flex items-center gap-2">
                      <CalendarCheck className="w-4 h-4" />
                      Visit Details
                    </h4>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[10px] font-bold text-dark-gray/40 uppercase tracking-widest mb-1">
                            Reservation Date
                          </p>
                          <p className="text-sm font-semibold text-dark">
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
                            <Clock className="w-4 h-4 text-dark" />
                            <p className="text-sm font-semibold text-dark">
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
                            {confirmedReservation.tableSelectionMode ===
                            "stacked"
                              ? "Seating Mode"
                              : selectedTables.length > 1
                                ? "Tables"
                                : "Table Number"}
                          </p>
                          <p className="text-sm font-semibold text-dark">
                            {confirmedReservation.tableSelectionMode ===
                            "stacked"
                              ? "Stacked — Admin Arranged"
                              : selectedTables
                                  .map((t) => `#${t.tableNumber}`)
                                  .join(", ")}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-dark-gray/40 uppercase tracking-widest mb-1">
                            Party Size
                          </p>
                          <p className="text-sm font-semibold text-dark">
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
                  <div className="space-y-4 border border-gray-200 p-4 rounded-2xl">
                    <h4 className="text-xs font-black text-dark uppercase tracking-[0.2em] flex items-center gap-2">
                      <TableIcon className="w-4 h-4" />
                      Seating Plan
                    </h4>
                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                      <p className="text-[10px] font-bold text-dark-gray/40 uppercase tracking-widest mb-3">
                        {confirmedReservation.tableSelectionMode === "stacked"
                          ? "Arrangement"
                          : selectedTables.length > 1
                            ? "Tables & Locations"
                            : "Location & View"}
                      </p>
                      {confirmedReservation.tableSelectionMode === "stacked" ? (
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center flex-shrink-0">
                            <Layers className="w-6 h-6 text-amber-500" />
                          </div>
                          <div>
                            <p className="font-bold text-dark text-base">
                              Stacked Tables
                            </p>
                            <p className="text-xs font-medium text-dark-gray">
                              Our team will arrange seating for{" "}
                              {confirmedReservation.partySize} guests
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {selectedTables.map((t) => (
                            <div
                              key={t._id}
                              className="flex items-center gap-3"
                            >
                              <div
                                className={`rounded-xl bg-white flex items-center justify-center text-dark shadow-sm border border-gray-50 flex-shrink-0 ${selectedTables.length > 1 ? "w-10 h-10" : "w-12 h-12"}`}
                              >
                                <TableIcon
                                  className={
                                    selectedTables.length > 1
                                      ? "w-5 h-5"
                                      : "w-6 h-6"
                                  }
                                />
                              </div>
                              <div>
                                <p
                                  className={`font-bold text-dark ${selectedTables.length > 1 ? "text-sm" : "text-base"}`}
                                >
                                  {t.name}
                                </p>
                                <p className="text-xs font-medium text-dark-gray">
                                  {t.location} Seating
                                  {selectedTables.length > 1
                                    ? ` · ${t.capacity} seats`
                                    : ""}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      {confirmedReservation.tableSelectionMode && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <p className="text-[10px] font-bold text-dark-gray/40 uppercase tracking-widest mb-2">
                            Selection Mode
                          </p>
                          <div
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${
                              confirmedReservation.tableSelectionMode ===
                              "stacked"
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-blue-50 text-blue-700 border-blue-200"
                            }`}
                          >
                            {confirmedReservation.tableSelectionMode ===
                            "stacked" ? (
                              <Layers className="w-3.5 h-3.5" />
                            ) : (
                              <LayoutGrid className="w-3.5 h-3.5" />
                            )}
                            {confirmedReservation.tableSelectionMode ===
                            "stacked"
                              ? "Stack Tables"
                              : "Custom Selection"}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Special Requests */}
                  <div className="space-y-4 border border-gray-200 p-4 rounded-2xl">
                    <h4 className="text-xs font-black text-dark uppercase tracking-[0.2em] flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Special Requests
                    </h4>
                    <div
                      className={`rounded-2xl p-6 border ${confirmedReservation.specialRequests ? "bg-gray-50 border-gray-100" : "bg-gray-50 border-gray-100"}`}
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
                    <div className="mt-8 space-y-6 border border-gray-200 p-4 rounded-2xl">
                      <h4 className="text-xs font-black text-dark uppercase tracking-[0.2em] flex items-center gap-2">
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
                    setSelectedTables([]);
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
