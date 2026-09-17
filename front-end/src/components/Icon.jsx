const PATHS = {
  dashboard: <><path d="M3 12 12 4l9 8" /><path d="M5 10v10h5v-6h4v6h5V10" /></>,
  book: <><path d="M4 5.5C4 4.7 4.7 4 5.5 4H14v16H5.5A1.5 1.5 0 0 1 4 18.5v-13Z" /><path d="M14 4h4.5A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5H14" /></>,
  users: <><circle cx="9" cy="8" r="3.2" /><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" /><path d="M16 4.2a3.2 3.2 0 0 1 0 6.2" /><path d="M21 20c0-2.7-1.8-5-4.3-5.7" /></>,
  exchange: <><path d="M4 8h13l-3-3" /><path d="M20 16H7l3 3" /></>,
  bookmark: <path d="M6 4h12v16l-6-4-6 4V4Z" />,
  sparkles: <><path d="M11 3v3M11 15v3M4 9h3M15 9h3M6 6l1.5 1.5M14.5 6 16 4.5M6 12l1.5-1.5M16 12l-1.5-1.5" /><circle cx="11" cy="9" r="1.6" /></>,
  bell: <><path d="M6 10a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 14 6 10Z" /><path d="M9.5 18a2.5 2.5 0 0 0 5 0" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 13a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V19a2 2 0 1 1-4 0v-.2a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H4a2 2 0 1 1 0-4h.2a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H10a1.7 1.7 0 0 0 1-1.6V4a2 2 0 1 1 4 0v.2a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V10a1.7 1.7 0 0 0 1.6 1H20a2 2 0 1 1 0 4h-.2a1.7 1.7 0 0 0-1.6 1Z" /></>,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" /></>,
  moon: <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z" />,
  plus: <path d="M12 5v14M5 12h14" />,
  x: <path d="M6 6l12 12M18 6 6 18" />,
  search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="M20 20l-4.3-4.3" /></>,
  trash: <><path d="M5 7h14" /><path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /><path d="M7 7l1 13h8l1-13" /></>,
  edit: <path d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-3-3L5.5 16 4 20Z" />,
  star: <path d="M12 3.5l2.5 5.2 5.7.6-4.3 4 1.1 5.7-5-3-5 3 1.1-5.7-4.3-4 5.7-.6L12 3.5Z" />,
  starOutline: <path d="M12 3.5l2.5 5.2 5.7.6-4.3 4 1.1 5.7-5-3-5 3 1.1-5.7-4.3-4 5.7-.6L12 3.5Z" fill="none" />,
  check: <path d="M4 12l5 5L20 6" />,
  wifi: <><path d="M2 8.5a15 15 0 0 1 20 0" /><path d="M5.5 12a10 10 0 0 1 13 0" /><path d="M9 15.5a5 5 0 0 1 6 0" /><circle cx="12" cy="19" r="1" /></>,
  server: <><rect x="3" y="4" width="18" height="6" rx="1" /><rect x="3" y="14" width="18" height="6" rx="1" /><path d="M7 7h.01M7 17h.01" /></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="1.5" /><path d="M4 6l8 7 8-7" /></>,
};

export default function Icon({ name, size = 17 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {PATHS[name] || null}
    </svg>
  );
}
