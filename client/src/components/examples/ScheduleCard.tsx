import ScheduleCard from '../ScheduleCard';

//TODO: remove mock functionality
const mockSchedule = [
  { period: 1, subject: "Mathematics", time: "8:00 - 8:45", teacher: "Mr. Rahman", room: "101", isActive: false },
  { period: 2, subject: "English", time: "8:50 - 9:35", teacher: "Ms. Sultana", room: "102", isActive: true },
  { period: 3, subject: "Physics", time: "9:40 - 10:25", teacher: "Mr. Khan", room: "Lab-1", isActive: false },
  { period: 4, subject: "Chemistry", time: "10:30 - 11:15", teacher: "Dr. Ahmed", room: "Lab-2", isActive: false },
];

export default function ScheduleCardExample() {
  return (
    <div className="p-6">
      <ScheduleCard title="Today's Schedule" schedule={mockSchedule} />
    </div>
  );
}
