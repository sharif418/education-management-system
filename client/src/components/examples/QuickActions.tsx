import QuickActions from '../QuickActions';
import { Calendar, FileText, Users, CreditCard } from 'lucide-react';

//TODO: remove mock functionality
const mockActions = [
  { label: "Take Attendance", icon: Users, onClick: () => console.log("Take Attendance") },
  { label: "View Schedule", icon: Calendar, onClick: () => console.log("View Schedule") },
  { label: "Submit Report", icon: FileText, onClick: () => console.log("Submit Report") },
  { label: "Fee Collection", icon: CreditCard, onClick: () => console.log("Fee Collection") },
];

export default function QuickActionsExample() {
  return (
    <div className="p-6">
      <QuickActions actions={mockActions} />
    </div>
  );
}
