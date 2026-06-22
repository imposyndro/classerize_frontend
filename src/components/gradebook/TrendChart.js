"use client";

// Inline SVG line chart — no external charting library required.
// Props: points = [{ label, value, date }], color = hex string
export default function TrendChart({ points = [], color = "#4F46E5" }) {
    if (points.length < 2) {
        return (
            <p className="text-xs text-gray-400 italic py-2">
                Not enough graded assignments to show a trend yet.
            </p>
        );
    }

    const W = 480, H = 120, PAD = { top: 12, right: 16, bottom: 28, left: 36 };
    const innerW = W - PAD.left - PAD.right;
    const innerH = H - PAD.top - PAD.bottom;

    const values = points.map((p) => Number(p.value));
    const minV   = Math.max(0,   Math.min(...values) - 10);
    const maxV   = Math.min(100, Math.max(...values) + 10);

    const xScale = (i) => PAD.left + (i / (points.length - 1)) * innerW;
    const yScale = (v) => PAD.top + innerH - ((v - minV) / (maxV - minV)) * innerH;

    const pathD = points
        .map((p, i) => `${i === 0 ? "M" : "L"} ${xScale(i).toFixed(1)} ${yScale(Number(p.value)).toFixed(1)}`)
        .join(" ");

    // Grade-band backgrounds
    const bands = [
        { y: 90, label: "A", fill: "#dcfce7" },
        { y: 80, label: "B", fill: "#dbeafe" },
        { y: 70, label: "C", fill: "#fef9c3" },
        { y: 0,  label: "D", fill: "#fee2e2" },
    ];

    return (
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 140 }}>
            {/* Grade band stripes */}
            {bands.map((band, bi) => {
                const nextY = bands[bi - 1]?.y ?? 100;
                const top    = yScale(Math.min(nextY, maxV));
                const bottom = yScale(Math.max(band.y, minV));
                if (bottom <= top) return null;
                return (
                    <rect key={band.label} x={PAD.left} y={top}
                          width={innerW} height={bottom - top} fill={band.fill} opacity={0.4} />
                );
            })}

            {/* Reference lines at 90, 80, 70 */}
            {[90, 80, 70].map((v) => {
                if (v < minV || v > maxV) return null;
                return (
                    <line key={v} x1={PAD.left} x2={PAD.left + innerW}
                          y1={yScale(v)} y2={yScale(v)}
                          stroke="#e5e7eb" strokeDasharray="4 3" strokeWidth={1} />
                );
            })}

            {/* Trend line */}
            <path d={pathD} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

            {/* Data points */}
            {points.map((p, i) => (
                <g key={i}>
                    <circle cx={xScale(i)} cy={yScale(Number(p.value))} r={4}
                            fill="white" stroke={color} strokeWidth={2} />
                    {/* Tooltip on hover via title */}
                    <title>{p.label}: {Number(p.value).toFixed(1)}%</title>
                </g>
            ))}

            {/* X labels — show first, middle, last */}
            {[0, Math.floor((points.length - 1) / 2), points.length - 1]
                .filter((v, i, arr) => arr.indexOf(v) === i)
                .map((i) => (
                    <text key={i} x={xScale(i)} y={H - 6} textAnchor="middle"
                          fontSize={9} fill="#9ca3af">
                        {points[i].label?.slice(0, 12)}
                    </text>
                ))}

            {/* Y labels */}
            {[minV, maxV].map((v) => (
                <text key={v} x={PAD.left - 4} y={yScale(v) + 3.5} textAnchor="end"
                      fontSize={9} fill="#9ca3af">
                    {Math.round(v)}%
                </text>
            ))}
        </svg>
    );
}
