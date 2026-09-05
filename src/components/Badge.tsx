import { STATUS_COLOR_CLASSES, STATUS_DOT_CLASSES, type StatusColor } from "@/lib/constants";
import clsx from "clsx";

export function Badge({ label, color, dot = true }: { label: string; color: StatusColor; className?: string; dot?: boolean }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium",
        STATUS_COLOR_CLASSES[color]
      )}
    >
      {dot && <span className={clsx("h-1.5 w-1.5 rounded-full", STATUS_DOT_CLASSES[color])} />}
      {label}
    </span>
  );
}
