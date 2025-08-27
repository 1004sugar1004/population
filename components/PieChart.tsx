import React, { useRef, useEffect, useState } from 'react';
// FIX: Replaced 'import * as d3' with specific imports to resolve type errors.
import { select } from 'd3-selection';
import { scaleOrdinal } from 'd3-scale';
import { pie, arc, PieArcDatum } from 'd3-shape';
import { interpolate } from 'd3-interpolate';
import 'd3-transition';
import { PopulationDataItem } from '../types';

interface PieChartProps {
  data: PopulationDataItem;
  isMainChart?: boolean;
}

const PieChart: React.FC<PieChartProps> = ({ data, isMainChart = false }) => {
  const ref = useRef<HTMLDivElement>(null);
  // FIX: Explicitly initialize useRef with undefined to resolve a potential TypeScript compiler error with complex generic types.
  const dataRef = useRef<PieArcDatum<{ name: string; value: number }>[] | undefined>(undefined);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);

  // Setup ResizeObserver to make chart responsive
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const resizeObserver = new ResizeObserver(entries => {
      if (!entries || entries.length === 0) return;
      const { width, height } = entries[0].contentRect;
      if(width > 0 && height > 0) {
        setDimensions({ width, height });
      }
    });

    resizeObserver.observe(element);
    
    // Set initial dimensions
    const rect = element.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
        setDimensions({ width: rect.width, height: rect.height });
    }

    return () => resizeObserver.unobserve(element);
  }, []);

  // D3 rendering logic
  useEffect(() => {
    if (!data || !ref.current || !dimensions) return;

    // FIX: Used select from d3-selection.
    const container = select(ref.current);
    container.select('svg').remove(); // Clear previous render

    const margin = { top: 10, right: 10, bottom: 10, left: 10 };
    const width = dimensions.width - margin.left - margin.right;
    const height = dimensions.height - margin.top - margin.bottom;
    
    if (width <= 0 || height <= 0) return;

    const radius = Math.min(width, height) / 2 * (isMainChart ? 1 : 0.9);

    const svg = container
      .append('svg')
      .attr('width', dimensions.width)
      .attr('height', dimensions.height)
      .append('g')
      .attr('transform', `translate(${dimensions.width / 2}, ${dimensions.height / 2})`);

    // FIX: Used scaleOrdinal from d3-scale.
    const color = scaleOrdinal<string>()
      .domain(['0-14세', '15-64세', '65세 이상'])
      .range(['#3b82f6', '#22c55e', '#f97316']);

    // FIX: Used pie from d3-shape and renamed variable to avoid conflict.
    const pieGenerator = pie<{ name: string; value: number }>().value(d => d.value).sort(null);
    const data_ready = pieGenerator(Object.keys(data).map(key => ({ name: key, value: data[key] })));

    // FIX: Used arc from d3-shape, used PieArcDatum type, and renamed variable.
    const arcGenerator = arc<PieArcDatum<{ name: string; value: number }>>().innerRadius(0).outerRadius(radius);

    // Draw paths
    // FIX: Used PieArcDatum type from d3-shape.
    const path = svg.selectAll<SVGPathElement, PieArcDatum<{ name: string; value: number }>>('path').data(data_ready);
    
    const pathEnter = path.enter().append('path')
        .attr('fill', d => color(d.data.name))
        .attr('stroke', 'white')
        .style('stroke-width', isMainChart ? '2px' : '1px');
    
    if (isMainChart) {
        pathEnter.merge(path)
            .transition().duration(1000)
            .attrTween('d', function (d) {
                const previous = dataRef.current ? (dataRef.current[d.index] || d) : d;
                // FIX: Used interpolate from d3-interpolate.
                const i = interpolate(previous, d);
                // FIX: Used renamed arcGenerator.
                return (t) => arcGenerator(i(t))!;
            });
    } else {
        // FIX: Used renamed arcGenerator.
        pathEnter.merge(path).attr('d', arcGenerator);
    }
    path.exit().remove();

    // Draw labels
    // FIX: Used PieArcDatum type from d3-shape.
    const text = svg.selectAll<SVGTextElement, PieArcDatum<{ name: string; value: number }>>('text').data(data_ready);
    const labelClass = isMainChart ? "text-sm fill-white font-bold" : "text-[11px] fill-white font-bold";
    const hideThreshold = isMainChart ? 4 : 5;

    const textEnter = text.enter().append('text')
      .attr('class', labelClass)
      .style('text-anchor', 'middle')
      .style('pointer-events', 'none')
      .style('text-shadow', '0 0 3px rgba(0,0,0,0.5)');
    
    textEnter.append('tspan').attr('class', 'name-label');
    textEnter.append('tspan').attr('class', 'value-label').attr('x', 0).attr('dy', '1.2em');

    const textUpdate = textEnter.merge(text)
        .style('opacity', d => (d.data.value < hideThreshold ? 0 : 1));
      
    if (isMainChart) {
        textUpdate.transition().duration(1000)
            .attrTween('transform', function(d) {
                const previous = dataRef.current ? (dataRef.current[d.index] || d) : d;
                // FIX: Used interpolate from d3-interpolate.
                const i = interpolate(previous, d);
                // FIX: Used renamed arcGenerator.
                return t => `translate(${arcGenerator.centroid(i(t))})`;
            });
    } else {
        // FIX: Used renamed arcGenerator.
        textUpdate.attr('transform', d => `translate(${arcGenerator.centroid(d)})`);
    }
    
    textUpdate.select('.name-label').text(d => d.data.name.replace('세', ''));
    textUpdate.select('.value-label').text(d => `${d.data.value.toFixed(1)}%`);
    text.exit().remove();
    
    // Store current data for next transition
    dataRef.current = data_ready;

  }, [data, isMainChart, dimensions]);

  return <div ref={ref} className="w-full h-full" />;
};

export default PieChart;