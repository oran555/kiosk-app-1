"use client";

type NotificationType = "success" | "error" | "warning" | "info";

type Props = {
  message: string;
  type: NotificationType;
  onClose: () => void;
};

export default function Notification({
  message,
  type,
  onClose,
}: Props) {
  const colors = {
    success: "bg-slate-600",
    error: "bg-slate-600",
    warning: "bg-slate-600",
    info: "bg-slate-600",
  };

  const icons = {
    success: "✅",
    error: "❌",
    warning: "⚠️",
    info: "ℹ️",
  };

  return (
    <div
      className={`
        fixed top-5 right-5 z-50
        flex items-center gap-3
        rounded-xl
        px-5 py-4
        text-white
        shadow-2xl
        ${colors[type]}
        animate-in fade-in slide-in-from-top-5
      `}
    >
      <span className="text-xl">
        {icons[type]}
      </span>

      <p className="font-semibold">
        {message}
      </p>

      <button
        onClick={onClose}
        className="ml-3 text-white/80 hover:text-white"
      >
        ✕
      </button>
    </div>
  );
}