import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { countBy } from '../utils/aggregate';
import type { Asset } from '../types/asset';

const COLORS = ['#4F46E5', '#059669', '#D97706', '#DC2626', '#7C3AED', '#0891B2', '#DB2777'];

interface AssetChartsProps {
    assets: Asset[];
    onSliceClick: (field: 'commodity_type' | 'location', value: string) => void;
}

export default function AssetCharts({ assets, onSliceClick }: AssetChartsProps) {
    const byType = countBy(assets, (a) => a.commodity_type);
    const byLocation = countBy(assets, (a) => a.location).slice(0, 8);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">By commodity type</p>
                <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                        <Pie
                            data={byType}
                            dataKey="count"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={70}
                            onClick={(entry) => {
                                if (entry.name) onSliceClick('commodity_type', String(entry.name));
                            }}
                            className="cursor-pointer"
                        >
                            {byType.map((_, index) => (
                                <Cell key={index} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">By location</p>
                <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={byLocation}>
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-20} textAnchor="end" height={50} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Bar
                            dataKey="count"
                            fill="#4F46E5"
                            onClick={(entry) => {
                                if (entry.name) onSliceClick('location', String(entry.name));
                            }}
                            className="cursor-pointer"
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}