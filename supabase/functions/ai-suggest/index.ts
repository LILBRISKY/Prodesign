import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface RoomInput {
  id: number;
  name: string;
  type: string;
  width: number;
  height: number;
  x: number;
  y: number;
  color: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { rooms } = (await req.json()) as { rooms: RoomInput[] };

    if (!rooms || rooms.length === 0) {
      return new Response(
        JSON.stringify({ result: "No rooms provided. Add rooms to your floor plan first." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const suggestions = generateSuggestions(rooms);

    return new Response(
      JSON.stringify({ result: suggestions }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(
      JSON.stringify({ result: `Error generating suggestions: ${message}` }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function generateSuggestions(rooms: RoomInput[]): string {
  let output = `DESIGN IMPROVEMENT SUGGESTIONS\n`;
  output += `${"=".repeat(50)}\n\n`;

  // Analyze layout
  const issues: string[] = [];
  const strengths: string[] = [];
  const recommendations: string[] = [];

  // Check for overlap
  const overlaps = findOverlaps(rooms);
  if (overlaps.length > 0) {
    issues.push(`Room overlap detected between: ${overlaps.map(o => `${o[0]} and ${o[1]}`).join(", ")}`);
  }

  // Check for missing rooms by building type
  const types = new Set(rooms.map(r => r.type));
  const hasLiving = types.has("living");
  const hasKitchen = types.has("kitchen");
  const hasBathroom = types.has("bathroom") || types.has("wc");
  const hasBedroom = types.has("bedroom");
  const hasHallway = types.has("hallway");

  if (rooms.length >= 3 && !hasKitchen) {
    recommendations.push("Consider adding a kitchen - no food preparation area detected");
  }
  if (rooms.length >= 3 && !hasBathroom) {
    recommendations.push("Consider adding a bathroom or WC - no sanitation facilities detected");
  }
  if (hasBedroom && !hasBathroom) {
    recommendations.push("Bedrooms should have access to bathroom facilities nearby");
  }
  if (rooms.length >= 4 && !hasHallway) {
    recommendations.push("Consider adding a hallway or circulation space to connect rooms");
  }

  // Check room proportions
  for (const room of rooms) {
    const ratio = room.width / room.height;
    if (ratio > 4 || ratio < 0.25) {
      issues.push(`${room.name} has an extreme aspect ratio (${room.width}x${room.height}) - consider making it more proportional`);
    }
    const area = room.width * room.height;
    if (room.type === "living" && area < 12000) {
      recommendations.push(`${room.name} may be too small for a living area (current: ${area} sq px) - consider enlarging to at least 150x120`);
    }
    if (room.type === "bedroom" && area < 8000) {
      recommendations.push(`${room.name} may be too small for a bedroom (current: ${area} sq px) - minimum recommended 120x100`);
    }
  }

  // Check adjacency
  const bathroomRooms = rooms.filter(r => r.type === "bathroom" || r.type === "wc");
  const bedroomRooms = rooms.filter(r => r.type === "bedroom");
  for (const bed of bedroomRooms) {
    const nearBath = bathroomRooms.some(b =>
      Math.abs(bed.x - b.x) < 200 && Math.abs(bed.y - b.y) < 200
    );
    if (!nearBath && bathroomRooms.length > 0) {
      recommendations.push(`${bed.name} is far from the nearest bathroom - consider repositioning for convenience`);
    }
  }

  // Check kitchen-living adjacency
  const livingRooms = rooms.filter(r => r.type === "living");
  const kitchenRooms = rooms.filter(r => r.type === "kitchen");
  if (livingRooms.length > 0 && kitchenRooms.length > 0) {
    const nearKitchen = kitchenRooms.some(k =>
      Math.abs(livingRooms[0].x - k.x) < 300 && Math.abs(livingRooms[0].y - k.y) < 300
    );
    if (nearKitchen) {
      strengths.push("Kitchen is well-positioned near the living area for social cooking");
    } else {
      recommendations.push("Consider positioning the kitchen closer to the living area for an open-plan feel");
    }
  }

  // Natural light analysis
  const exteriorRooms = rooms.filter(r => {
    const bounds = getBounds(rooms);
    return r.x < bounds.minX + 30 || r.y < bounds.minY + 30 ||
           r.x + r.width > bounds.maxX - 30 || r.y + r.height > bounds.maxY - 30;
  });
  const interiorRooms = rooms.filter(r => !exteriorRooms.includes(r));

  if (interiorRooms.length > 0) {
    recommendations.push(`Interior rooms (${interiorRooms.map(r => r.name).join(", ")}) may lack natural light - consider repositioning near exterior walls or adding light wells`);
  }

  // Strengths
  if (overlaps.length === 0) {
    strengths.push("No room overlaps detected - layout is spatially clean");
  }
  if (hasLiving && hasKitchen) {
    strengths.push("Essential living and kitchen spaces are present");
  }

  // General design tips
  recommendations.push("Ensure clear circulation paths of at least 900mm between rooms");
  recommendations.push("Position high-traffic rooms (kitchen, bathroom) near plumbing stacks to reduce pipe runs");
  recommendations.push("Consider the path from entrance to all rooms - avoid dead-end layouts where possible");

  // Output
  if (strengths.length > 0) {
    output += `STRENGTHS\n${"-".repeat(30)}\n`;
    for (const s of strengths) {
      output += `  + ${s}\n`;
    }
    output += `\n`;
  }

  if (issues.length > 0) {
    output += `ISSUES FOUND\n${"-".repeat(30)}\n`;
    for (const i of issues) {
      output += `  ! ${i}\n`;
    }
    output += `\n`;
  }

  output += `RECOMMENDATIONS\n${"-".repeat(30)}\n`;
  for (let idx = 0; idx < recommendations.length; idx++) {
    output += `  ${idx + 1}. ${recommendations[idx]}\n`;
  }

  output += `\nLAYOUT SUMMARY\n${"-".repeat(30)}\n`;
  const totalArea = rooms.reduce((sum, r) => sum + r.width * r.height, 0);
  output += `  Rooms: ${rooms.length}\n`;
  output += `  Total area: ${totalArea.toLocaleString()} sq px\n`;
  output += `  Overlaps: ${overlaps.length}\n`;
  const bounds = getBounds(rooms);
  output += `  Canvas used: ${bounds.maxX - bounds.minX} x ${bounds.maxY - bounds.minY} px\n`;

  return output;
}

function findOverlaps(rooms: RoomInput[]): [string, string][] {
  const overlaps: [string, string][] = [];
  for (let i = 0; i < rooms.length; i++) {
    for (let j = i + 1; j < rooms.length; j++) {
      const a = rooms[i];
      const b = rooms[j];
      if (a.x < b.x + b.width && a.x + a.width > b.x &&
          a.y < b.y + b.height && a.y + a.height > b.y) {
        overlaps.push([a.name, b.name]);
      }
    }
  }
  return overlaps;
}

function getBounds(rooms: RoomInput[]) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const r of rooms) {
    minX = Math.min(minX, r.x);
    minY = Math.min(minY, r.y);
    maxX = Math.max(maxX, r.x + r.width);
    maxY = Math.max(maxY, r.y + r.height);
  }
  return { minX, minY, maxX, maxY };
}
