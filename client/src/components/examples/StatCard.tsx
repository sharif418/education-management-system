import StatCard from '../StatCard';
import { Users } from 'lucide-react';

export default function StatCardExample() {
  return (
    <div className="p-6 space-y-4">
      <StatCard 
        title="Total Students" 
        value="1,234" 
        icon={Users}
        trend={{ value: "12% from last month", isPositive: true }}
      />
    </div>
  );
}
