// Design tokens for the mobile app — matches web app color palette
export const Colors = {
  primary: '#2563eb',       // blue-600
  primaryLight: '#eff6ff',  // blue-50
  danger: '#dc2626',        // red-600
  dangerLight: '#fef2f2',   // red-50
  success: '#16a34a',       // green-600
  successLight: '#f0fdf4',  // green-50
  warning: '#d97706',       // amber-600
  warningLight: '#fffbeb',  // amber-50
  orange: '#ea580c',        // orange-600

  // Backgrounds
  bg: '#f8fafc',            // slate-50
  bgDark: '#020617',        // slate-950
  card: '#ffffff',
  cardDark: '#0f172a',      // slate-900
  border: '#e2e8f0',        // slate-200
  borderDark: '#1e293b',    // slate-800

  // Text
  text: '#1e293b',          // slate-800
  textMuted: '#64748b',     // slate-500
  textDark: '#ffffff',
  textMutedDark: '#94a3b8', // slate-400
};

export const Fonts = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  black: 900,
};

// Status badge colours
export const StatusColors = {
  Pending:     { bg: '#fef9c3', text: '#854d0e' },
  Assigned:    { bg: '#dbeafe', text: '#1e40af' },
  'In Progress':{ bg: '#ffedd5', text: '#9a3412' },
  Accepted:    { bg: '#ffedd5', text: '#9a3412' },
  Resolved:    { bg: '#dcfce7', text: '#166534' },
  Rejected:    { bg: '#fee2e2', text: '#991b1b' },
};
