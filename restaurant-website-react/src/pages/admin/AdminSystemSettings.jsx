import React, { useEffect, useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import useSettings from "../../hooks/useSettings";
import settingsService from "../../services/settingsService";
import { applySettings } from "../../store/slices/settingsSlice";
import {
  Settings,
  Store,
  DollarSign,
  ShoppingBag,
  CalendarCheck,
  Save,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

// ─── Section wrapper ─────────────────────────────────────────────────────────
const Section = ({ icon: Icon, title, children }) => (
  <div className="bg-white max-w-4xl rounded-2xl shadow-lg border border-gray-100">
    <div className="flex items-center gap-3 px-6 py-6 border-b border-gray-100">
      <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <h2 className="text-base font-bold text-dark font-sans">{title}</h2>
    </div>
    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
  </div>
);

// ─── Field helpers ────────────────────────────────────────────────────────────
const Field = ({ label, children, span }) => (
  <div className={span === 2 ? "sm:col-span-2" : ""}>
    <label className="block text-sm font-semibold text-dark mb-2">
      {label}
    </label>
    {children}
  </div>
);

const TextInput = ({ value, onChange, placeholder, type = "text" }) => (
  <input
    type={type}
    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
  />
);

const NumberInput = ({ value, onChange, min = 0 }) => (
  <input
    type="number"
    min={min}
    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
    value={value}
    onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
  />
);

const Toggle = ({ value, onChange, label }) => (
  <button
    type="button"
    onClick={() => onChange(!value)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${value ? "bg-primary" : "bg-gray-300"}`}
  >
    <span
      className={`inline-block w-4 h-4 bg-white rounded-full shadow transition-transform ${value ? "translate-x-6" : "translate-x-1"}`}
    />
  </button>
);

const ToggleField = ({ label, description, value, onChange }) => (
  <div className="sm:col-span-2 flex items-center justify-between p-4 bg-cream-light rounded-xl">
    <div>
      <p className="text-sm font-semibold text-dark">{label}</p>
      {description && (
        <p className="text-xs text-dark-gray mt-0.5">{description}</p>
      )}
    </div>
    <Toggle value={value} onChange={onChange} />
  </div>
);

// ─── Deep-set helper ─────────────────────────────────────────────────────────
const set = (obj, section, key, val) => ({
  ...obj,
  [section]: { ...obj[section], [key]: val },
});

// ─── Main Page ────────────────────────────────────────────────────────────────
const AdminSystemSettings = () => {
  const dispatch = useDispatch();
  const [form, setForm] = useState(null);
  const { currencySymbol } = useSettings();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null); // { type: 'success'|'error', msg }

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await settingsService.getSettings();
      setForm(res.settings);
    } catch (err) {
      console.error("Settings load error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const upd = (section, key, val) => setForm((f) => set(f, section, key, val));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await settingsService.updateSettings(form);
      dispatch(applySettings(res.settings || form));
      showToast("success", "Settings saved successfully.");
    } catch (err) {
      showToast(
        "error",
        err?.response?.data?.message || "Failed to save settings.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading || !form) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2" />
          <div className="h-4 bg-gray-100 rounded w-1/2" />
        </div>
        {Array(3)
          .fill(0)
          .map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-6 animate-pulse h-40"
            />
          ))}
      </div>
    );
  }

  const r = form.restaurant || {};
  const c = form.currency || {};
  const o = form.ordering || {};
  const rv = form.reservations || {};

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="bg-white max-w-4xl rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-dark rounded-2xl flex items-center justify-center">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold font-sans text-primary mb-0.5">
                System Settings
              </h1>
              <p className="text-dark-gray text-sm">
                Configure restaurant-wide settings
              </p>
            </div>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary-dark disabled:opacity-50 transition-all shadow-sm"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving…" : "Save Settings"}
          </button>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-lg text-sm font-semibold ${
            toast.type === "success"
              ? "bg-green-50 border border-green-200 text-green-700"
              : "bg-red-50 border border-red-200 text-red-700"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle className="w-5 h-5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0" />
          )}
          {toast.msg}
        </div>
      )}

      {/* Restaurant Info */}
      <Section icon={Store} title="Restaurant Info">
        <Field label="Restaurant Name">
          <TextInput
            value={r.name || ""}
            onChange={(v) => upd("restaurant", "name", v)}
            placeholder="My Restaurant"
          />
        </Field>
        <Field label="Tagline">
          <TextInput
            value={r.tagline || ""}
            onChange={(v) => upd("restaurant", "tagline", v)}
            placeholder="Taste the difference"
          />
        </Field>
        <Field label="Phone">
          <TextInput
            value={r.phone || ""}
            onChange={(v) => upd("restaurant", "phone", v)}
            placeholder="+92 300 0000000"
          />
        </Field>
        <Field label="Email">
          <TextInput
            type="email"
            value={r.email || ""}
            onChange={(v) => upd("restaurant", "email", v)}
            placeholder="info@restaurant.com"
          />
        </Field>
        <Field label="Address" span={2}>
          <TextInput
            value={r.address || ""}
            onChange={(v) => upd("restaurant", "address", v)}
            placeholder="123 Main Street"
          />
        </Field>
        <Field label="City">
          <TextInput
            value={r.city || ""}
            onChange={(v) => upd("restaurant", "city", v)}
            placeholder="Karachi"
          />
        </Field>
        <Field label="Country">
          <TextInput
            value={r.country || ""}
            onChange={(v) => upd("restaurant", "country", v)}
            placeholder="Pakistan"
          />
        </Field>
        <Field label="Opening Time">
          <TextInput
            type="time"
            value={r.openingTime || "09:00"}
            onChange={(v) => upd("restaurant", "openingTime", v)}
          />
        </Field>
        <Field label="Closing Time">
          <TextInput
            type="time"
            value={r.closingTime || "23:00"}
            onChange={(v) => upd("restaurant", "closingTime", v)}
          />
        </Field>
      </Section>

      {/* Currency */}
      <Section icon={DollarSign} title="Currency">
        <Field label="Currency Code">
          <TextInput
            value={c.code || ""}
            onChange={(v) => upd("currency", "code", v)}
            placeholder="PKR"
          />
        </Field>
        <Field label="Currency Symbol">
          <TextInput
            value={c.symbol || ""}
            onChange={(v) => upd("currency", "symbol", v)}
            placeholder="Rs"
          />
        </Field>
      </Section>

      {/* Ordering */}
      <Section icon={ShoppingBag} title="Online Ordering">
        <ToggleField
          label="Accept Orders"
          description="Turn off to pause online ordering temporarily"
          value={o.acceptingOrders !== false}
          onChange={(v) => upd("ordering", "acceptingOrders", v)}
        />
        <Field label={`Delivery Fee (${currencySymbol})`}>
          <NumberInput
            value={o.deliveryFee ?? 50}
            onChange={(v) => upd("ordering", "deliveryFee", v)}
          />
        </Field>
        <Field label={`Minimum Order Amount (${currencySymbol})`}>
          <NumberInput
            value={o.minOrderAmount ?? 0}
            onChange={(v) => upd("ordering", "minOrderAmount", v)}
          />
        </Field>
        <Field label="Estimated Delivery Time">
          <TextInput
            value={o.estimatedDelivery || ""}
            onChange={(v) => upd("ordering", "estimatedDelivery", v)}
            placeholder="30-45 mins"
          />
        </Field>
      </Section>

      {/* Reservations */}
      <Section icon={CalendarCheck} title="Table Reservations">
        <ToggleField
          label="Accept Reservations"
          description="Turn off to pause new reservation bookings"
          value={rv.acceptingReservations !== false}
          onChange={(v) => upd("reservations", "acceptingReservations", v)}
        />
        <Field label="Max Party Size">
          <NumberInput
            value={rv.maxPartySize ?? 10}
            min={1}
            onChange={(v) => upd("reservations", "maxPartySize", v)}
          />
        </Field>
        <Field label="Advance Booking (days)">
          <NumberInput
            value={rv.advanceBookingDays ?? 30}
            min={1}
            onChange={(v) => upd("reservations", "advanceBookingDays", v)}
          />
        </Field>
        <Field label="Time Slot Duration (mins)">
          <NumberInput
            value={rv.slotDurationMins ?? 60}
            min={15}
            onChange={(v) => upd("reservations", "slotDurationMins", v)}
          />
        </Field>
      </Section>

      {/* Bottom save button for convenience */}
      <div className="max-w-4xl flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white text-xs sm:text-base rounded-xl font-semibold hover:bg-primary-dark disabled:opacity-50 transition-all shadow-sm"
        >
          <Save className="w-4 h-4" />
          {saving ? "Saving…" : "Save All Settings"}
        </button>
      </div>
    </form>
  );
};

export default AdminSystemSettings;
