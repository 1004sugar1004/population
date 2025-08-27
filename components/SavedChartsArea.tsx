
import React, { useRef } from 'react';
import type { SavedChart } from '../types';
import PieChart from './PieChart';

interface SavedChartsAreaProps {
  savedCharts: SavedChart[];
  onReset: () => void;
}

const SavedChartsArea: React.FC<SavedChartsAreaProps> = ({ savedCharts, onReset }) => {
  const savedAreaRef = useRef<HTMLDivElement>(null);

  const handleExport = () => {
    if (savedAreaRef.current && (window as any).html2canvas) {
      (window as any).html2canvas(savedAreaRef.current, {
        backgroundColor: '#f8fafc',
        onclone: (document: Document) => {
            const clonedElement = document.getElementById('saved-charts-area-clone');
            if (clonedElement) {
                clonedElement.style.padding = '20px';
            }
        }
      }).then((canvas: HTMLCanvasElement) => {
        const link = document.createElement('a');
        link.download = 'population-composition-comparison.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
      });
    }
  };

  const hasSavedCharts = savedCharts.length > 0;

  return (
    <div className="md:w-1/3 mt-8 md:mt-0 border-t md:border-t-0 md:border-l border-gray-200 p-4 rounded-lg">
      <div id="saved-charts-area-clone" ref={savedAreaRef} className="bg-slate-50">
        <h2 className="text-xl font-bold text-gray-700 mb-4 text-center">저장된 그래프</h2>
        <div className="min-h-[200px]">
          {hasSavedCharts ? (
            <div className="grid grid-cols-1 gap-4">
              {savedCharts.map((chart) => (
                <div key={chart.year} className="border p-2 rounded-lg bg-white">
                  <h3 className="font-bold text-lg text-center">{chart.year}년</h3>
                  <div className="w-full aspect-square relative">
                    <PieChart data={chart.data} isMainChart={false} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 mt-16 text-center">저장된 그래프가 없습니다.</p>
          )}
        </div>
      </div>
      <div className="mt-4 flex justify-center space-x-4">
        <button
          onClick={handleExport}
          disabled={!hasSavedCharts}
          className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded-full disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          <i className="fas fa-camera mr-2"></i>이미지로 내보내기
        </button>
        <button
          onClick={onReset}
          disabled={!hasSavedCharts}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-full disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          <i className="fas fa-trash mr-2"></i>초기화
        </button>
      </div>
    </div>
  );
};

export default SavedChartsArea;
