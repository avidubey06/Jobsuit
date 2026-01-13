import React from 'react';
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts';

interface ScoreChartProps {
  score: number;
}

const ScoreChart: React.FC<ScoreChartProps> = ({ score }) => {
  const data = [
    {
      name: 'Score',
      value: score,
      fill: score > 80 ? '#22c55e' : score > 50 ? '#eab308' : '#ef4444',
    },
  ];

  return (
    <div className="relative flex items-center justify-center w-48 h-48">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart 
          innerRadius="70%" 
          outerRadius="100%" 
          barSize={15} 
          data={data} 
          startAngle={90} 
          endAngle={-270}
        >
          <PolarAngleAxis
            type="number"
            domain={[0, 100]}
            angleAxisId={0}
            tick={false}
          />
          <RadialBar
            background
            clockWise
            dataKey="value"
            cornerRadius={10}
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className={`text-4xl font-bold ${score > 80 ? 'text-green-600' : score > 50 ? 'text-yellow-600' : 'text-red-600'}`}>
          {score}
        </span>
        <span className="text-xs text-gray-500 uppercase font-medium mt-1">ATS Score</span>
      </div>
    </div>
  );
};

export default ScoreChart;
