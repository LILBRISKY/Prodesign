package com.prodesign.service;

import com.prodesign.model.RoomData;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class AiSpecService {

    private static final Map<String, String> TYPE_LABELS = Map.ofEntries(
            Map.entry("living", "Living Space"), Map.entry("bedroom", "Bedroom"),
            Map.entry("kitchen", "Kitchen"), Map.entry("bathroom", "Bathroom"),
            Map.entry("dining", "Dining"), Map.entry("study", "Study"),
            Map.entry("garage", "Garage"), Map.entry("hallway", "Circulation"),
            Map.entry("storage", "Storage"), Map.entry("garden", "Outdoor"),
            Map.entry("pool", "Leisure"), Map.entry("balcony", "Outdoor"),
            Map.entry("utility", "Utility"), Map.entry("wc", "WC"),
            Map.entry("office", "Office"), Map.entry("reception", "Reception"),
            Map.entry("meeting", "Meeting Room")
    );

    private static final Map<String, String> MATERIALS = Map.ofEntries(
            Map.entry("living",
                    "    - Flooring: Engineered hardwood or laminate\n    - Walls: Plasterboard with emulsion paint\n    - Ceiling: Plasterboard skim coat\n"),
            Map.entry("bedroom",
                    "    - Flooring: Carpet or engineered hardwood\n    - Walls: Plasterboard with emulsion paint\n    - Ceiling: Plasterboard skim coat\n"),
            Map.entry("kitchen",
                    "    - Flooring: Ceramic tile or vinyl\n    - Walls: Ceramic tile splashback, plasterboard elsewhere\n    - Countertop: Granite or quartz composite\n    - Ceiling: Moisture-resistant plasterboard\n"),
            Map.entry("bathroom",
                    "    - Flooring: Non-slip ceramic tile\n    - Walls: Ceramic tile to full height\n    - Ceiling: Moisture-resistant plasterboard\n    - Fixtures: White sanitaryware, chrome fittings\n"),
            Map.entry("dining",
                    "    - Flooring: Engineered hardwood\n    - Walls: Plasterboard with emulsion paint\n    - Ceiling: Plasterboard with feature lighting\n"),
            Map.entry("study",
                    "    - Flooring: Engineered hardwood or carpet\n    - Walls: Plasterboard with emulsion paint\n    - Built-in: Desk and shelving options\n"),
            Map.entry("garage",
                    "    - Flooring: Concrete with epoxy sealant\n    - Walls: Blockwork with render\n    - Door: Insulated roller or sectional\n"),
            Map.entry("hallway",
                    "    - Flooring: Ceramic tile or engineered hardwood\n    - Walls: Plasterboard with emulsion paint\n    - Ceiling: Plasterboard skim coat\n"),
            Map.entry("storage",
                    "    - Flooring: Concrete or vinyl\n    - Walls: Plasterboard\n    - Shelving: Adjustable rack system\n"),
            Map.entry("garden",
                    "    - Surface: Lawn, paving, or decking\n    - Boundary: Fencing or wall per local regulations\n    - Drainage: Soakaway system required\n"),
            Map.entry("pool",
                    "    - Shell: Reinforced concrete with waterproof membrane\n    - Finish: Ceramic mosaic tiles\n    - Surround: Non-slip paving\n    - Filtration: Sand filter and pump system\n"),
            Map.entry("balcony",
                    "    - Flooring: Non-slip ceramic tile or composite decking\n    - Railing: Toughened glass or metal balustrade\n    - Waterproofing: Liquid membrane system\n"),
            Map.entry("utility",
                    "    - Flooring: Vinyl or ceramic tile\n    - Walls: Plasterboard with washable paint\n    - Plumbing: Hot and cold water supply\n"),
            Map.entry("wc",
                    "    - Flooring: Non-slip ceramic tile\n    - Walls: Ceramic tile to 1.2m, plasterboard above\n    - Fixtures: White WC and basin, chrome fittings\n"),
            Map.entry("office",
                    "    - Flooring: Carpet tile or vinyl\n    - Walls: Plasterboard with emulsion paint\n    - Ceiling: Suspended ceiling with integrated lighting\n"),
            Map.entry("reception",
                    "    - Flooring: Porcelain tile or polished concrete\n    - Walls: Plasterboard with feature finish\n    - Ceiling: Suspended ceiling with feature lighting\n"),
            Map.entry("meeting",
                    "    - Flooring: Carpet tile\n    - Walls: Plasterboard with acoustic treatment\n    - Ceiling: Acoustic ceiling tiles\n")
    );

    private static final Map<String, String> CONSTRUCTION_NOTES = Map.ofEntries(
            Map.entry("living",
                    "    - Ensure minimum 10% glazing to floor area ratio for natural light\n    - Provide minimum 2 power outlets per wall\n    - Consider underfloor heating for open-plan areas\n"),
            Map.entry("bedroom",
                    "    - Minimum room size per building regulations\n    - Provide window for natural light and emergency egress\n    - Include built-in wardrobe space allocation\n"),
            Map.entry("kitchen",
                    "    - Provide extraction ventilation (minimum 60 l/s)\n    - Minimum 1.2m clearance between opposing counters\n    - Include dedicated circuits for appliances\n    - Water-resistant electrical outlets required\n"),
            Map.entry("bathroom",
                    "    - Provide mechanical extraction (minimum 15 l/s)\n    - Waterproof tanking to shower area\n    - All electrical fittings must be IP44 rated minimum\n    - Include shaver point with isolation transformer\n"),
            Map.entry("dining",
                    "    - Consider acoustic separation from kitchen\n    - Provide dimmable lighting circuit\n    - Ensure adequate circulation space around table\n"),
            Map.entry("study",
                    "    - Provide minimum 4 double power outlets for equipment\n    - Include data/network outlet\n    - Consider acoustic insulation for concentration\n"),
            Map.entry("garage",
                    "    - Provide vehicle-rated floor loading\n    - Include fire separation from habitable rooms\n    - Ensure adequate ventilation for vehicle exhaust\n    - Provide automatic fire detection\n"),
            Map.entry("hallway",
                    "    - Minimum width: 900mm for circulation\n    - Provide smoke detection per building regulations\n    - Ensure clear access to all rooms and exits\n"),
            Map.entry("storage",
                    "    - Provide secure locking mechanism\n    - Ensure adequate ventilation to prevent condensation\n    - Floor loading: minimum 2.0 kN/sq m\n"),
            Map.entry("garden",
                    "    - Provide suitable drainage gradient (1:60 minimum)\n    - Include external water tap\n    - Consider automatic irrigation system\n"),
            Map.entry("pool",
                    "    - Comply with local pool safety fencing regulations\n    - Provide pool cover system for safety and insulation\n    - Include pool plant room allocation\n    - Ensure compliant depth markings\n"),
            Map.entry("balcony",
                    "    - Minimum 1.1m balustrade height per regulations\n    - Provide drainage with minimum 1:50 fall\n    - Structural design for imposed load of 2.0 kN/sq m\n"),
            Map.entry("utility",
                    "    - Provide floor drainage\n    - Include space for washing machine and dryer\n    - Ensure adequate ventilation\n"),
            Map.entry("wc",
                    "    - Provide mechanical extraction\n    - Minimum clear space 750mm x 750mm in front of WC\n    - Include washbasin with hot and cold water\n"),
            Map.entry("office",
                    "    - Provide minimum 11 cu m volume per occupant\n    - Include adequate task and ambient lighting\n    - Ensure fire escape route compliance\n"),
            Map.entry("reception",
                    "    - Create welcoming arrival space with clear wayfinding\n    - Provide secure access control point\n    - Include waiting area seating allocation\n"),
            Map.entry("meeting",
                    "    - Provide acoustic rating minimum STC 45\n    - Include presentation screen/projection allocation\n    - Ensure adequate ventilation for occupancy\n")
    );

    public String generateSpecification(List<RoomData> rooms) {
        int totalArea = rooms.stream().mapToInt(r -> r.getWidth() * r.getHeight()).sum();

        StringBuilder sb = new StringBuilder();
        sb.append("ARCHITECTURAL SPECIFICATION\n");
        sb.append("==================================================\n\n");
        sb.append(String.format("Total floor area: %s sq px (approx %d sq m equivalent)%n",
                String.format("%,d", totalArea), Math.round(totalArea / 100.0)));
        sb.append(String.format("Number of rooms: %d%n%n", rooms.size()));

        sb.append("ROOM SCHEDULE\n--------------------------------------------------\n\n");

        for (RoomData room : rooms) {
            int area = room.getWidth() * room.getHeight();
            String typeLabel = TYPE_LABELS.getOrDefault(room.getType(), room.getType());

            sb.append(String.format("%s (%s)%n", room.getName(), typeLabel));
            sb.append(String.format("  Dimensions: %d x %d px (~%dm x %dm)%n",
                    room.getWidth(), room.getHeight(),
                    Math.round(room.getWidth() / 10.0), Math.round(room.getHeight() / 10.0)));
            sb.append(String.format("  Area: %s sq px (~%d sq m)%n",
                    String.format("%,d", area), Math.round(area / 100.0)));
            sb.append(String.format("  Position: (%d, %d)%n", room.getX(), room.getY()));
            sb.append("  Suggested materials:\n");
            sb.append(MATERIALS.getOrDefault(room.getType(),
                    "    - Standard construction materials per building code\n"));
            sb.append("  Construction notes:\n");
            sb.append(CONSTRUCTION_NOTES.getOrDefault(room.getType(),
                    "    - Comply with local building regulations\n    - Ensure structural adequacy\n"));
            sb.append("\n");
        }

        sb.append("GENERAL NOTES\n--------------------------------------------------\n");
        sb.append("- All dimensions are approximate and should be verified on site\n");
        sb.append("- Minimum ceiling height: 2.4m for habitable rooms, 2.1m for utility\n");
        sb.append("- Ensure adequate natural light in living areas and bedrooms\n");
        sb.append("- Fire safety: maintain clear egress paths from all rooms\n");
        sb.append("- Ventilation required for all wet rooms (bathrooms, kitchen, WC)\n");

        return sb.toString();
    }
}
