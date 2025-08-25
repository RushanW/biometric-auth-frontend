// components/Logo.tsx
import Link from "next/link";

export default function Logo({
  iconColor = "text-primary",   // e.g., rose-500
  textColor = "text-foreground", // e.g., slate-900
  withText = true,
  label = "Biometric Face Auth",
}: {
  iconColor?: string;
  textColor?: string;
  withText?: boolean;
  label?: string;
}) {
  return (
    <Link href="/" aria-label="Go home" className="flex items-center gap-3">
      <svg
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        className={`h-8 w-8 ${iconColor}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="11" r="8" fill="currentColor" opacity="0.2" />
        <path d="M16,11a15.93,15.93,0,0,1-3,10" />
        <path d="M6.17,17.17C7,16.32,8,12.71,8,11a4,4,0,0,1,4-4,3.89,3.89,0,0,1,2,.54" />
        <path d="M9,3.58A8.09,8.09,0,0,1,12,3a8,8,0,0,1,8,8c0,1.12,0,5-2,8" />
        <path d="M3.34,14A9.45,9.45,0,0,0,4,11,8,8,0,0,1,6,5.71" />
        <path d="M12,11c0,2-1,8-4,10" />
      </svg>

      {withText && (
        <span
          className={`select-none font-semibold tracking-tight text-base sm:text-lg ${textColor}`}
        >
          Biometric <span className="font-bold">Face</span> Auth
        </span>
      )}
    </Link>
  );
}
