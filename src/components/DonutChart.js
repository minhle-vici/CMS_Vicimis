"use client";
import React from 'react';

/**
 * Simple reusable SVG donut chart.
 * Props:
 *   data: Array<{ label: string, value: number }>
 *   size: number – diameter in pixels (default 200)
 *   thickness: number – donut thickness (default 40)
 */
export default function DonutChart({ data = [], size = 200, thickness = 40 }) {
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1;
  const radius = size / 2;
  const innerRadius = radius - thickness;
  const cx = radius;
  const cy = radius;

  // Convert polar coordinates to cartesian for arc end points
  const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  let cumulative = 0;
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
  const segments = data.map((segment, index) => {
    const value = segment.value;
    const startAngle = (cumulative / total) * 360;
    const endAngle = ((cumulative + value) / total) * 360;
    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
    const start = polarToCartesian(cx, cy, radius, endAngle);
    const end = polarToCartesian(cx, cy, radius, startAngle);
    const pathData = [
      `M ${start.x} ${start.y}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`,
      `L ${cx} ${cy}`,
      `Z`,
    ].join(' ');
    cumulative += value;
    return (
      <path key={index} d={pathData} fill={colors[index % colors.length]} />
    );
  });

  return (
    <div style={{ width: size, height: size, position: 'relative' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background circle for missing portion */}
        <circle cx={cx} cy={cy} r={radius} fill="transparent" stroke="#e5e7eb" strokeWidth={thickness} />
        {segments}
        {/* Inner circle to create hole */}
        <circle cx={cx} cy={cy} r={innerRadius} fill="white" />
      </svg>
      {/* Center label showing total */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
        fontSize: '1rem',
        fontWeight: '600',
        color: '#374151',
      }}>
        <div>{total}</div>
        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Tổng</div>
      </div>
    </div>
  );
}
