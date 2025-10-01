import AttendanceCalendar from '../AttendanceCalendar';

//TODO: remove mock functionality
const mockDays = [
  ...Array(5).fill({ date: null, status: null }),
  { date: 1, status: "present" },
  { date: 2, status: "present" },
  { date: 3, status: "absent" },
  { date: 4, status: "present" },
  { date: 5, status: "late" },
  { date: 6, status: "holiday" },
  { date: 7, status: "holiday" },
  ...Array(23).fill(null).map((_, i) => ({ 
    date: i + 8, 
    status: ["present", "present", "present", "absent", "late"][Math.floor(Math.random() * 5)] 
  })),
];

export default function AttendanceCalendarExample() {
  return (
    <div className="p-6">
      <AttendanceCalendar month="January" year={2025} days={mockDays as any} />
    </div>
  );
}
