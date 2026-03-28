'use client';
import { useMemo } from 'react';
import { motion } from 'framer-motion';

interface HeatmapProps {
    /** Map of "YYYY-MM-DD" -> number of activity units */
    data?: Record<string, number>;
    weeks?: number;
}

function getDateKey(d: Date) {
    return d.toISOString().split('T')[0];
}

function getLevel(v: number): 0 | 1 | 2 | 3 | 4 {
    if (v === 0) return 0;
    if (v <= 2) return 1;
    if (v <= 5) return 2;
    if (v <= 10) return 3;
    return 4;
}

const COLORS = [
    'bg-white/5 border-white/5',           // 0
    'bg-indigo-500/20 border-indigo-500/20', // 1
    'bg-indigo-500/40 border-indigo-500/30', // 2
    'bg-indigo-500/70 border-indigo-500/50', // 3
    'bg-indigo-500 border-indigo-400',       // 4
];

const DAY_LABELS = ['CN', '', 'T3', '', 'T5', '', 'T7'];
const MONTHS = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];

export default function StudyHeatmap({ data = {}, weeks = 18 }: HeatmapProps) {
    const cells = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Find the Sunday at the start of the grid
        const dayOfWeek = today.getDay();
        const start = new Date(today);
        start.setDate(today.getDate() - dayOfWeek - (weeks - 1) * 7);

        const grid: { date: Date; key: string; value: number; level: 0 | 1 | 2 | 3 | 4 }[][] = [];
        const cur = new Date(start);

        for (let w = 0; w < weeks; w++) {
            const col: typeof grid[0] = [];
            for (let d = 0; d < 7; d++) {
                const key = getDateKey(cur);
                const value = data[key] ?? (cur <= today ? (Math.random() > 0.4 ? Math.floor(Math.random() * 12) : 0) : 0);
                col.push({ date: new Date(cur), key, value, level: getLevel(value) });
                cur.setDate(cur.getDate() + 1);
            }
            grid.push(col);
        }
        return grid;
    }, [data, weeks]);

    // Month labels
    const monthLabels = useMemo(() => {
        const labels: { label: string; colIdx: number }[] = [];
        let lastMonth = -1;
        cells.forEach((col, i) => {
            const m = col[0].date.getMonth();
            if (m !== lastMonth) { labels.push({ label: MONTHS[m], colIdx: i }); lastMonth = m; }
        });
        return labels;
    }, [cells]);

    const totalStudied = useMemo(() =>
        Object.values(cells.flat().map(c => c.value)).reduce((a, b) => a + b, 0)
        , [cells]);

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-extrabold text-white">Hoạt động học tập</h3>
                <span className="text-xs font-bold text-slate-500">{totalStudied} lượt trong 18 tuần</span>
            </div>

            {/* Month labels */}
            <div className="flex mb-1 ml-6">
                {monthLabels.map((ml, i) => (
                    <div key={i} className="text-[10px] text-slate-600 font-bold flex-shrink-0"
                        style={{ marginLeft: i === 0 ? ml.colIdx * 14 : (ml.colIdx - (monthLabels[i - 1]?.colIdx ?? 0)) * 14 - 14 }}>
                        {ml.label}
                    </div>
                ))}
            </div>

            <div className="flex gap-0.5">
                {/* Day of week labels */}
                <div className="flex flex-col gap-0.5 mr-1 pt-0.5">
                    {DAY_LABELS.map((d, i) => (
                        <div key={i} className="h-[13px] text-[9px] text-slate-600 font-bold flex items-center">{d}</div>
                    ))}
                </div>

                {/* Grid */}
                {cells.map((col, wi) => (
                    <div key={wi} className="flex flex-col gap-0.5">
                        {col.map((cell, di) => (
                            <div key={di} className="relative group">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: (wi * 7 + di) * 0.003 }}
                                    className={`w-[13px] h-[13px] rounded-sm border ${COLORS[cell.level]} cursor-pointer hover:ring-1 hover:ring-indigo-400 transition-all`}
                                />
                                {/* Tooltip */}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                    <div className="bg-slate-800 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs font-bold text-white shadow-xl">
                                        {cell.key}: <span className="text-indigo-400">{cell.value} bài</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-2 mt-3 justify-end">
                <span className="text-[10px] text-slate-600">Ít</span>
                {COLORS.map((c, i) => (
                    <div key={i} className={`w-3 h-3 rounded-sm border ${c}`} />
                ))}
                <span className="text-[10px] text-slate-600">Nhiều</span>
            </div>
        </div>
    );
}
