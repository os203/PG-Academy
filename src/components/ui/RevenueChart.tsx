"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";

const data = [
  { date: "Oct 01", revenue: 120, enrollments: 12 },
  { date: "Oct 05", revenue: 210, enrollments: 20 },
  { date: "Oct 10", revenue: 180, enrollments: 18 },
  { date: "Oct 15", revenue: 350, enrollments: 35 },
  { date: "Oct 20", revenue: 290, enrollments: 28 },
  { date: "Oct 25", revenue: 480, enrollments: 45 },
  { date: "Oct 30", revenue: 520, enrollments: 50 },
];

export function RevenueChart() {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="currentColor" stopOpacity={0.3} className="text-brand-primary" />
              <stop offset="95%" stopColor="currentColor" stopOpacity={0} className="text-brand-primary" />
            </linearGradient>
            <linearGradient id="colorEnrollments" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="currentColor" stopOpacity={0.3} className="text-brand-accent" />
              <stop offset="95%" stopColor="currentColor" stopOpacity={0} className="text-brand-accent" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-muted/20" />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12 }} 
            className="text-muted-foreground"
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12 }}
            className="text-muted-foreground"
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
            itemStyle={{ color: 'hsl(var(--foreground))' }}
          />
          <Area 
            type="monotone" 
            dataKey="revenue" 
            stroke="currentColor" 
            className="text-brand-primary"
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorRevenue)" 
          />
          <Area 
            type="monotone" 
            dataKey="enrollments" 
            stroke="currentColor" 
            className="text-brand-accent"
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorEnrollments)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
