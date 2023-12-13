"use client";

import * as d3 from "d3";
import {useEffect, useRef, useState} from "react";
import {drag} from 'd3-drag';


// Define a type for the points
type Point = { id: number; coords: [number, number] };

export const FloorPlanBuilder = () => {
  const ref = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [points, setPoints] = useState<Point[]>([]);

  useEffect(() => {
    if (!ref.current) return; // Ensure ref is current before proceeding

    const svg = d3.select(ref.current);

    if (svg.select('.polygon-group').empty()) {
      svg.append('g').attr('class', 'polygon-group');
    }
    if (svg.select('.points-group').empty()) {
      svg.append('g').attr('class', 'points-group');
    }

    function handleMouseDown(event: MouseEvent) {
      // Add new point on left click
      if (!drawing) {
        if (event.button === 2) {
          // Right-click, so don't add a new point
          return;
        }
        setDrawing(true);
        const newPoint = {id: Date.now(), coords: d3.pointer(event, ref.current) as [number, number]};
        setPoints([...points, newPoint]);
      }
    }

    function handleRightClick(event: any) {
      event.preventDefault();
      const pointToRemove = d3.select(event.target).datum() as Point;
      setPoints(points.filter(p => p.id !== pointToRemove.id));
    }

    function handleMouseUp() {
      // Stop drawing
      setDrawing(false);
    }

    function handleDrag(event: MouseEvent, d: Point) {
      const updatedPoints = points.map(p =>
        p.id === d.id ? {...p, coords: [event.x, event.y] as [number, number]} : p
      );
      setPoints(updatedPoints);
    }

    function drawPolygon(pts: Point[]) {
      const polygonGroup = svg.select('.polygon-group');
      const pointsGroup = svg.select('.points-group');

      polygonGroup.selectAll('polygon').data([null])
        .join('polygon')
        .attr('points', pts.map(p => p.coords.join(",")).join(" "))
        .style('fill', 'lightblue')
        .style('stroke', 'blue')
        .style('stroke-width', 2);

      const circleDrag = drag<SVGCircleElement, Point>()
        .on("drag", handleDrag)

      // Draw circles for each point
      pointsGroup.selectAll<SVGCircleElement, Point>('circle')
        .data(pts, (d: Point) => d.id) // Specify the type for 'd'
        .join("circle")
        .attr("cx", d => d.coords[0])
        .attr("cy", d => d.coords[1])
        .attr("r", 5)
        .style("fill", "red")
        .attr("class", "hover:cursor-pointer fill-red-500 hover:fill-yellow-300 hover:stroke-orange-500 stroke-2")
        .on("contextmenu", handleRightClick)
        .call(circleDrag as any);
    }

    drawPolygon(points);

    svg.on('mousedown', handleMouseDown).on('mouseup', handleMouseUp);
  }, [points, drawing]);

  return (
    <svg className="border-2 border-amber-300" width="800" height="600" ref={ref}></svg>
  );
};