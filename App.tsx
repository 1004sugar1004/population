
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { PRELOADED_DATA } from './constants';
import type { PopulationData, SavedChart } from './types';
import PieChart from './components/PieChart';
import SavedChartsArea from './components/SavedChartsArea';

const App: React.FC = () => {
    const [populationData, setPopulationData] = useState<PopulationData>({});
    const [selectedYear, setSelectedYear] = useState<number>(1960);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [savedCharts, setSavedCharts] = useState<SavedChart[]>([]);
    const [feedback, setFeedback] = useState<string>('');

    useEffect(() => {
        const processedData: PopulationData = {};
        PRELOADED_DATA.forEach(item => {
            const year = item.PRD_DE;
            const categoryRaw = item.C1_NM;
            const value = parseFloat(item.DT);

            if (!processedData[year]) {
                processedData[year] = {};
            }
            
            let category: string;
            if (categoryRaw.includes("0~14")) category = "0-14세";
            else if (categoryRaw.includes("15~64")) category = "15-64세";
            else category = "65세 이상";

            processedData[year][category] = value;
        });
        setPopulationData(processedData);
    }, []);

    useEffect(() => {
        // FIX: Changed NodeJS.Timeout to number, which is the correct type for setInterval in a browser environment.
        let interval: number | null = null;
        if (isPlaying) {
            interval = setInterval(() => {
                setSelectedYear(prevYear => {
                    if (prevYear < 2072) {
                        return prevYear + 1;
                    } else {
                        setIsPlaying(false);
                        return prevYear;
                    }
                });
            }, 200);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isPlaying]);

    const handleTogglePlay = () => {
        setIsPlaying(prev => !prev);
    };

    const handleSaveYear = useCallback(() => {
        const yearStr = String(selectedYear);
        if (savedCharts.some(c => c.year === yearStr)) {
            setFeedback(`${yearStr}년은 이미 저장되어 있습니다.`);
        } else if (savedCharts.length >= 3) {
            setFeedback('최대 3개까지 저장할 수 있습니다.');
        } else {
            const newData = { year: yearStr, data: populationData[yearStr] };
            const newSavedCharts = [...savedCharts, newData].sort((a, b) => parseInt(a.year) - parseInt(b.year));
            setSavedCharts(newSavedCharts);
            setFeedback(`${yearStr}년 그래프가 저장되었습니다.`);
        }

        setTimeout(() => setFeedback(''), 2000);
    }, [selectedYear, savedCharts, populationData]);

    const handleReset = useCallback(() => {
        setSavedCharts([]);
    }, []);

    const yearColor = useMemo(() => {
        if (selectedYear < 2000) return 'text-sky-600';
        if (selectedYear < 2040) return 'text-green-600';
        return 'text-orange-600';
    }, [selectedYear]);

    const currentYearData = populationData[selectedYear];

    return (
        <div className="bg-gray-100 flex items-center justify-center min-h-screen p-2 sm:p-4">
            <div className="w-full max-w-6xl bg-white rounded-2xl shadow-lg p-4 sm:p-6 md:p-8">
                <div className="md:flex md:space-x-8">
                    <div className="md:w-2/3 text-center">
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-1">대한민국 인구 구성비 변화</h1>
                        <p className="text-gray-500 text-sm sm:text-base mb-2 md:mb-4">슬라이더를 움직여 연도별 인구 구조를 확인해보세요!</p>
                        <div className={`text-5xl md:text-7xl font-bold my-2 md:my-4 transition-colors duration-300 ${yearColor}`}>
                            {selectedYear}
                        </div>
                        <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md mx-auto aspect-square">
                           {currentYearData && <PieChart data={currentYearData} isMainChart={true} />}
                        </div>
                        <div className="flex justify-center items-center space-x-4 md:space-x-6 mt-2 md:mt-4 text-xs sm:text-sm">
                            <div className="flex items-center"><span className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-blue-500 mr-2"></span><span>0-14세</span></div>
                            <div className="flex items-center"><span className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-green-500 mr-2"></span><span>15-64세</span></div>
                            <div className="flex items-center"><span className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-orange-500 mr-2"></span><span>65세 이상</span></div>
                        </div>
                        <div className="mt-4 md:mt-6 px-4">
                            <input
                                type="range"
                                min="1960"
                                max="2072"
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                className="w-full"
                            />
                        </div>
                        <div className="mt-4 md:mt-6 flex justify-center space-x-4">
                            <button onClick={handleTogglePlay} className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-5 sm:py-3 sm:px-6 rounded-full transition-transform transform hover:scale-105 text-base sm:text-lg w-40">
                                {isPlaying ? <><i className="fas fa-pause mr-2"></i>일시 정지</> : <><i className="fas fa-play mr-2"></i>자동 재생</>}
                            </button>
                            <button onClick={handleSaveYear} className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-5 sm:py-3 sm:px-6 rounded-full transition-transform transform hover:scale-105 text-base sm:text-lg">
                                <i className="fas fa-save mr-2"></i>현재 연도 저장
                            </button>
                        </div>
                        <p className="text-red-500 h-6 mt-2 text-sm font-bold">{feedback}</p>
                    </div>
                    <SavedChartsArea savedCharts={savedCharts} onReset={handleReset} />
                </div>
            </div>
        </div>
    );
}

export default App;
