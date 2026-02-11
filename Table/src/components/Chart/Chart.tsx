import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';

type ChartProps = {} & { todCount: number; openTod: number };

export default function ChartComponent({ todCount, openTod }: ChartProps) {
  // openTod from backend counts closed items (status: true)
  const closedCount = openTod;

  // Calculate open count: total - closed
  const openCount = Math.max(0, todCount - closedCount);

  const chartData = [
    { name: 'Closed', value: closedCount },
    { name: 'Open', value: openCount },
  ];

  //  gradient colors
  const COLORS = {
    closed: '#10b981', // emerald-500
    open: '#ef4444', // red-500
  };

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: {
    cx: number;
    cy: number;
    midAngle: number;
    innerRadius: number;
    outerRadius: number;
    percent: number;
  }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-sm font-bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-6 py-8">
      <div className="relative rounded-2xl border border-white/40 bg-white/70 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.08)] overflow-hidden p-8">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-800 mb-6">
          Project TODs Status Overview
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Pie Chart */}
          <div className="flex flex-col items-center">
            <h3 className="text-lg font-medium text-slate-700 mb-4">
              Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.name === 'Closed' ? COLORS.closed : COLORS.open
                      }
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '8px 12px',
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => (
                    <span className="text-sm font-medium text-slate-700">
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Statistics Cards */}
          <div className="flex flex-col justify-center gap-6">
            <div className="bg-linear-to-br from-emerald-50 to-emerald-100 rounded-xl p-6 border border-emerald-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-700 mb-1">
                    Closed Items
                  </p>
                  <p className="text-3xl font-bold text-emerald-900">
                    {closedCount}
                  </p>
                </div>
                <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center">
                  <span className="text-2xl">✓</span>
                </div>
              </div>
            </div>

            <div className="bg-linear-to-br from-red-50 to-red-100 rounded-xl p-6 border border-red-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-700 mb-1">
                    Open Items
                  </p>
                  <p className="text-3xl font-bold text-red-900">{openCount}</p>
                </div>
                <div className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center">
                  <span className="text-2xl">!</span>
                </div>
              </div>
            </div>

            <div className="bg-linear-to-br from-blue-50 to-indigo-100 rounded-xl p-6 border border-blue-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700 mb-1">
                    Total Items
                  </p>
                  <p className="text-3xl font-bold text-blue-900">{todCount}</p>
                </div>
                <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="text-2xl">#</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
