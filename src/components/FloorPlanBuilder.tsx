"use client";

import * as React from 'react';
import * as d3 from 'd3';
import { useEffect, useRef, useState } from 'react';
import { drag } from 'd3-drag';

// Define a type for the points
type Point = { id: number; coords: [number, number] };

export const FloorPlanBuilder = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [polygons, setPolygons] = useState<Point[][]>([]);
  const [drawing, setDrawing] = useState(false);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);

    function handleMouseDown(event: MouseEvent) {
      if (event.button !== 0) return;

      setDrawing(true);
      const newPoint = { id: Date.now(), coords: d3.pointer(event, svgRef.current) as [number, number] };
      setPolygons((prevPolygons) => [...prevPolygons, [newPoint]]);
    }

    function handleMouseMove(event: MouseEvent) {
      if (!drawing) return;

      const updatedPolygons = [...polygons];
      const currentPolygon = updatedPolygons[updatedPolygons.length - 1];
      currentPolygon.push({ id: Date.now(), coords: d3.pointer(event, svgRef.current) as [number, number] });
      setPolygons(updatedPolygons);
    }

    function handleMouseUp() {
      if (drawing) {
        setDrawing(false);
      }
    }

    function drawPolygons() {
      const polygonGroup = svg.select('.polygon-group');

      polygonGroup
        .selectAll('polygon')
        .data(polygons)
        .join('polygon')
        .attr('points', (pts) => pts.map((p) => p.coords.join(',')).join(' '))
        .style('fill', 'lightblue')
        .style('stroke', 'blue')
        .style('stroke-width', 2);

      const circleDrag = drag<SVGCircleElement, Point>()
        .on('drag', handleDrag);

      const pointsGroup = svg.select('.points-group');

      polygons.forEach((pts) => {
        pointsGroup
          .selectAll<SVGCircleElement, Point>('circle')
          .data(pts, (d: Point) => d.id)
          .join('circle')
          .attr('cx', (d) => d.coords[0])
          .attr('cy', (d) => d.coords[1])
          .attr('r', 5)
          .style('fill', 'red')
          .attr(
            'class',
            'hover:cursor-pointer fill-red-500 hover:fill-yellow-300 hover:stroke-orange-500 stroke-2'
          )
          .call(circleDrag as any);
      });
    }

    drawPolygons();

    svg.on('mousedown', handleMouseDown).on('mouseup', handleMouseUp).on('mousemove', handleMouseMove);

    return () => {
      svg.on('mousedown', null);
      svg.on('mouseup', null);
      svg.on('mousemove', null);
    };
  }, [drawing, polygons]);

  function handleDrag(event: MouseEvent, d: Point) {
    const updatedPolygons = polygons.map((pts) =>
      pts.map((p) => (p.id === d.id ? { ...p, coords: [event.x, event.y] as [number, number] } : p))
    );
    setPolygons(updatedPolygons);
  }

  return (
    <svg className="border-2 border-amber-300" width="800" height="600" ref={svgRef}>
      <g className="polygon-group"></g>
      <g className="points-group"></g>
    </svg>
  );
};
