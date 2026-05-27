import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface RoomInput {
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

    // Generate architectural specification from room data
    const spec = generateSpecification(rooms);

    return new Response(
      JSON.stringify({ result: spec }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(
      JSON.stringify({ result: `Error generating specification: ${message}` }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function generateSpecification(rooms: RoomInput[]): string {
  const totalArea = rooms.reduce((sum, r) => sum + r.width * r.height, 0);

  let output = `ARCHITECTURAL SPECIFICATION\n`;
  output += `${"=".repeat(50)}\n\n`;
  output += `Total floor area: ${totalArea.toLocaleString()} sq px (approx ${Math.round(totalArea / 100)} sq m equivalent)\n`;
  output += `Number of rooms: ${rooms.length}\n\n`;

  output += `ROOM SCHEDULE\n${"-".repeat(50)}\n\n`;

  for (const room of rooms) {
    const area = room.width * room.height;
    const typeLabel = getTypeLabel(room.type);

    output += `${room.name} (${typeLabel})\n`;
    output += `  Dimensions: ${room.width} x ${room.height} px (~${Math.round(room.width / 10)}m x ${Math.round(room.height / 10)}m)\n`;
    output += `  Area: ${area.toLocaleString()} sq px (~${Math.round(area / 100)} sq m)\n`;
    output += `  Position: (${room.x}, ${room.y})\n`;
    output += `  Suggested materials:\n`;
    output += getMaterials(room.type);
    output += `  Construction notes:\n`;
    output += getConstructionNotes(room.type);
    output += `\n`;
  }

  output += `GENERAL NOTES\n${"-".repeat(50)}\n`;
  output += `- All dimensions are approximate and should be verified on site\n`;
  output += `- Minimum ceiling height: 2.4m for habitable rooms, 2.1m for utility\n`;
  output += `- Ensure adequate natural light in living areas and bedrooms\n`;
  output += `- Fire safety: maintain clear egress paths from all rooms\n`;
  output += `- Ventilation required for all wet rooms (bathrooms, kitchen, WC)\n`;

  return output;
}

function getTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    living: "Living Space", bedroom: "Bedroom", kitchen: "Kitchen",
    bathroom: "Bathroom", dining: "Dining", study: "Study",
    garage: "Garage", hallway: "Circulation", storage: "Storage",
    garden: "Outdoor", pool: "Leisure", balcony: "Outdoor",
    utility: "Utility", wc: "WC", office: "Office", reception: "Reception",
    meeting: "Meeting Room",
  };
  return labels[type] || type;
}

function getMaterials(type: string): string {
  const materials: Record<string, string> = {
    living: "    - Flooring: Engineered hardwood or laminate\n    - Walls: Plasterboard with emulsion paint\n    - Ceiling: Plasterboard skim coat\n",
    bedroom: "    - Flooring: Carpet or engineered hardwood\n    - Walls: Plasterboard with emulsion paint\n    - Ceiling: Plasterboard skim coat\n",
    kitchen: "    - Flooring: Ceramic tile or vinyl\n    - Walls: Ceramic tile splashback, plasterboard elsewhere\n    - Countertop: Granite or quartz composite\n    - Ceiling: Moisture-resistant plasterboard\n",
    bathroom: "    - Flooring: Non-slip ceramic tile\n    - Walls: Ceramic tile to full height\n    - Ceiling: Moisture-resistant plasterboard\n    - Fixtures: White sanitaryware, chrome fittings\n",
    dining: "    - Flooring: Engineered hardwood\n    - Walls: Plasterboard with emulsion paint\n    - Ceiling: Plasterboard with feature lighting\n",
    study: "    - Flooring: Engineered hardwood or carpet\n    - Walls: Plasterboard with emulsion paint\n    - Built-in: Desk and shelving options\n",
    garage: "    - Flooring: Concrete with epoxy sealant\n    - Walls: Blockwork with render\n    - Door: Insulated roller or sectional\n",
    hallway: "    - Flooring: Ceramic tile or engineered hardwood\n    - Walls: Plasterboard with emulsion paint\n    - Ceiling: Plasterboard skim coat\n",
    storage: "    - Flooring: Concrete or vinyl\n    - Walls: Plasterboard\n    - Shelving: Adjustable rack system\n",
    garden: "    - Surface: Lawn, paving, or decking\n    - Boundary: Fencing or wall per local regulations\n    - Drainage: Soakaway system required\n",
    pool: "    - Shell: Reinforced concrete with waterproof membrane\n    - Finish: Ceramic mosaic tiles\n    - Surround: Non-slip paving\n    - Filtration: Sand filter and pump system\n",
    balcony: "    - Flooring: Non-slip ceramic tile or composite decking\n    - Railing: Toughened glass or metal balustrade\n    - Waterproofing: Liquid membrane system\n",
    utility: "    - Flooring: Vinyl or ceramic tile\n    - Walls: Plasterboard with washable paint\n    - Plumbing: Hot and cold water supply\n",
    wc: "    - Flooring: Non-slip ceramic tile\n    - Walls: Ceramic tile to 1.2m, plasterboard above\n    - Fixtures: White WC and basin, chrome fittings\n",
    office: "    - Flooring: Carpet tile or vinyl\n    - Walls: Plasterboard with emulsion paint\n    - Ceiling: Suspended ceiling with integrated lighting\n",
    reception: "    - Flooring: Porcelain tile or polished concrete\n    - Walls: Plasterboard with feature finish\n    - Ceiling: Suspended ceiling with feature lighting\n",
    meeting: "    - Flooring: Carpet tile\n    - Walls: Plasterboard with acoustic treatment\n    - Ceiling: Acoustic ceiling tiles\n",
  };
  return materials[type] || "    - Standard construction materials per building code\n";
}

function getConstructionNotes(type: string): string {
  const notes: Record<string, string> = {
    living: "    - Ensure minimum 10% glazing to floor area ratio for natural light\n    - Provide minimum 2 power outlets per wall\n    - Consider underfloor heating for open-plan areas\n",
    bedroom: "    - Minimum room size per building regulations\n    - Provide window for natural light and emergency egress\n    - Include built-in wardrobe space allocation\n",
    kitchen: "    - Provide extraction ventilation (minimum 60 l/s)\n    - Minimum 1.2m clearance between opposing counters\n    - Include dedicated circuits for appliances\n    - Water-resistant electrical outlets required\n",
    bathroom: "    - Provide mechanical extraction (minimum 15 l/s)\n    - Waterproof tanking to shower area\n    - All electrical fittings must be IP44 rated minimum\n    - Include shaver point with isolation transformer\n",
    dining: "    - Consider acoustic separation from kitchen\n    - Provide dimmable lighting circuit\n    - Ensure adequate circulation space around table\n",
    study: "    - Provide minimum 4 double power outlets for equipment\n    - Include data/network outlet\n    - Consider acoustic insulation for concentration\n",
    garage: "    - Provide vehicle-rated floor loading\n    - Include fire separation from habitable rooms\n    - Ensure adequate ventilation for vehicle exhaust\n    - Provide automatic fire detection\n",
    hallway: "    - Minimum width: 900mm for circulation\n    - Provide smoke detection per building regulations\n    - Ensure clear access to all rooms and exits\n",
    storage: "    - Provide secure locking mechanism\n    - Ensure adequate ventilation to prevent condensation\n    - Floor loading: minimum 2.0 kN/sq m\n",
    garden: "    - Provide suitable drainage gradient (1:60 minimum)\n    - Include external water tap\n    - Consider automatic irrigation system\n",
    pool: "    - Comply with local pool safety fencing regulations\n    - Provide pool cover system for safety and insulation\n    - Include pool plant room allocation\n    - Ensure compliant depth markings\n",
    balcony: "    - Minimum 1.1m balustrade height per regulations\n    - Provide drainage with minimum 1:50 fall\n    - Structural design for imposed load of 2.0 kN/sq m\n",
    utility: "    - Provide floor drainage\n    - Include space for washing machine and dryer\n    - Ensure adequate ventilation\n",
    wc: "    - Provide mechanical extraction\n    - Minimum clear space 750mm x 750mm in front of WC\n    - Include washbasin with hot and cold water\n",
    office: "    - Provide minimum 11 cu m volume per occupant\n    - Include adequate task and ambient lighting\n    - Ensure fire escape route compliance\n",
    reception: "    - Create welcoming arrival space with clear wayfinding\n    - Provide secure access control point\n    - Include waiting area seating allocation\n",
    meeting: "    - Provide acoustic rating minimum STC 45\n    - Include presentation screen/projection allocation\n    - Ensure adequate ventilation for occupancy\n",
  };
  return notes[type] || "    - Comply with local building regulations\n    - Ensure structural adequacy\n";
}
