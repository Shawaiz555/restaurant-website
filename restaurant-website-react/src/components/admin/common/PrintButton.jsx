import React, { useState, useRef, useEffect } from "react";
import { Printer, FileDown, ChevronDown } from "lucide-react";

/**
 * PrintButton — split button with Print and Save as PDF options.
 *
 * @param {object}   props
 * @param {number}   props.selectedCount  - Number of currently selected rows (0 = print all)
 * @param {number}   props.totalCount     - Total filtered rows available
 * @param {function} props.onPrint        - Callback(mode) where mode is 'print' or 'pdf'
 * @param {boolean}  [props.disabled]     - Disable when no data exists
 * @param {string}   [props.className]    - Extra Tailwind classes
 */
const PrintButton = ({
  selectedCount = 0,
  totalCount = 0,
  onPrint,
  disabled = false,
  className = "",
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const isDisabled = disabled || totalCount === 0;
  const label = selectedCount > 0 ? `Print (${selectedCount})` : "Print All";
  const countLabel = selectedCount > 0
    ? `${selectedCount} selected row${selectedCount !== 1 ? "s" : ""}`
    : `all ${totalCount} row${totalCount !== 1 ? "s" : ""}`;

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleOption = (mode) => {
    setOpen(false);
    onPrint(mode);
  };

  const baseBtn =
    "flex items-center gap-2 px-4 py-2.5 border-2 border-gray-200 text-dark-gray hover:border-primary hover:text-primary hover:bg-primary/5 transition-all text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed";

  return (
    <div ref={ref} className={`relative flex ${className}`}>
      {/* Main print button */}
      <button
        onClick={() => handleOption("print")}
        disabled={isDisabled}
        title={`Print ${countLabel}`}
        className={`${baseBtn} rounded-l-xl border-r-0`}
      >
        <Printer className="w-4 h-4" />
        {label}
      </button>

      {/* Chevron toggle */}
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={isDisabled}
        title="More options"
        className={`${baseBtn} rounded-r-xl px-2.5 border-l border-gray-200`}
      >
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
          <button
            onClick={() => handleOption("print")}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
          <button
            onClick={() => handleOption("pdf")}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors"
          >
            <FileDown className="w-4 h-4" />
            Save as PDF
          </button>
        </div>
      )}
    </div>
  );
};

export default PrintButton;
