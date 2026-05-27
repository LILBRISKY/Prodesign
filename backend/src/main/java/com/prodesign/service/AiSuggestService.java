package com.prodesign.service;

import com.prodesign.model.RoomData;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class AiSuggestService {

    public String generateSuggestions(List<RoomData> rooms) {
        List<String> issues = new ArrayList<>();
        List<String> strengths = new ArrayList<>();
        List<String> recommendations = new ArrayList<>();

        // Check for overlaps
        List<String[]> overlaps = findOverlaps(rooms);
        for (String[] overlap : overlaps) {
            issues.add(String.format("Room overlap detected between: %s and %s", overlap[0], overlap[1]));
        }

        // Check for missing rooms
        Set<String> types = new HashSet<>();
        for (RoomData r : rooms) {
            types.add(r.getType());
        }
        boolean hasLiving = types.contains("living");
        boolean hasKitchen = types.contains("kitchen");
        boolean hasBathroom = types.contains("bathroom") || types.contains("wc");
        boolean hasBedroom = types.contains("bedroom");
        boolean hasHallway = types.contains("hallway");

        if (rooms.size() >= 3 && !hasKitchen) {
            recommendations.add("Consider adding a kitchen - no food preparation area detected");
        }
        if (rooms.size() >= 3 && !hasBathroom) {
            recommendations.add("Consider adding a bathroom or WC - no sanitation facilities detected");
        }
        if (hasBedroom && !hasBathroom) {
            recommendations.add("Bedrooms should have access to bathroom facilities nearby");
        }
        if (rooms.size() >= 4 && !hasHallway) {
            recommendations.add("Consider adding a hallway or circulation space to connect rooms");
        }

        // Check room proportions
        for (RoomData room : rooms) {
            double ratio = (double) room.getWidth() / room.getHeight();
            if (ratio > 4 || ratio < 0.25) {
                issues.add(String.format("%s has an extreme aspect ratio (%dx%d) - consider making it more proportional",
                        room.getName(), room.getWidth(), room.getHeight()));
            }
            int area = room.getWidth() * room.getHeight();
            if ("living".equals(room.getType()) && area < 12000) {
                recommendations.add(String.format("%s may be too small for a living area (current: %d sq px) - consider enlarging to at least 150x120",
                        room.getName(), area));
            }
            if ("bedroom".equals(room.getType()) && area < 8000) {
                recommendations.add(String.format("%s may be too small for a bedroom (current: %d sq px) - minimum recommended 120x100",
                        room.getName(), area));
            }
        }

        // Check adjacency
        List<RoomData> bathroomRooms = rooms.stream()
                .filter(r -> "bathroom".equals(r.getType()) || "wc".equals(r.getType())).toList();
        List<RoomData> bedroomRooms = rooms.stream()
                .filter(r -> "bedroom".equals(r.getType())).toList();

        for (RoomData bed : bedroomRooms) {
            boolean nearBath = bathroomRooms.stream()
                    .anyMatch(b -> Math.abs(bed.getX() - b.getX()) < 200 && Math.abs(bed.getY() - b.getY()) < 200);
            if (!nearBath && !bathroomRooms.isEmpty()) {
                recommendations.add(String.format("%s is far from the nearest bathroom - consider repositioning for convenience",
                        bed.getName()));
            }
        }

        // Kitchen-living adjacency
        List<RoomData> livingRooms = rooms.stream().filter(r -> "living".equals(r.getType())).toList();
        List<RoomData> kitchenRooms = rooms.stream().filter(r -> "kitchen".equals(r.getType())).toList();
        if (!livingRooms.isEmpty() && !kitchenRooms.isEmpty()) {
            boolean nearKitchen = kitchenRooms.stream()
                    .anyMatch(k -> Math.abs(livingRooms.get(0).getX() - k.getX()) < 300
                            && Math.abs(livingRooms.get(0).getY() - k.getY()) < 300);
            if (nearKitchen) {
                strengths.add("Kitchen is well-positioned near the living area for social cooking");
            } else {
                recommendations.add("Consider positioning the kitchen closer to the living area for an open-plan feel");
            }
        }

        // Natural light analysis
        Bounds bounds = getBounds(rooms);
        List<RoomData> interiorRooms = rooms.stream()
                .filter(r -> !(r.getX() < bounds.minX + 30 || r.getY() < bounds.minY + 30
                        || r.getX() + r.getWidth() > bounds.maxX - 30
                        || r.getY() + r.getHeight() > bounds.maxY - 30))
                .toList();

        if (!interiorRooms.isEmpty()) {
            String names = String.join(", ", interiorRooms.stream().map(RoomData::getName).toList());
            recommendations.add(String.format("Interior rooms (%s) may lack natural light - consider repositioning near exterior walls or adding light wells", names));
        }

        // Strengths
        if (overlaps.isEmpty()) {
            strengths.add("No room overlaps detected - layout is spatially clean");
        }
        if (hasLiving && hasKitchen) {
            strengths.add("Essential living and kitchen spaces are present");
        }

        // General tips
        recommendations.add("Ensure clear circulation paths of at least 900mm between rooms");
        recommendations.add("Position high-traffic rooms (kitchen, bathroom) near plumbing stacks to reduce pipe runs");
        recommendations.add("Consider the path from entrance to all rooms - avoid dead-end layouts where possible");

        // Build output
        StringBuilder sb = new StringBuilder();
        sb.append("DESIGN IMPROVEMENT SUGGESTIONS\n");
        sb.append("==================================================\n\n");

        if (!strengths.isEmpty()) {
            sb.append("STRENGTHS\n------------------------------\n");
            for (String s : strengths) {
                sb.append(String.format("  + %s%n", s));
            }
            sb.append("\n");
        }

        if (!issues.isEmpty()) {
            sb.append("ISSUES FOUND\n------------------------------\n");
            for (String i : issues) {
                sb.append(String.format("  ! %s%n", i));
            }
            sb.append("\n");
        }

        sb.append("RECOMMENDATIONS\n------------------------------\n");
        for (int idx = 0; idx < recommendations.size(); idx++) {
            sb.append(String.format("  %d. %s%n", idx + 1, recommendations.get(idx)));
        }

        sb.append("\nLAYOUT SUMMARY\n------------------------------\n");
        int totalArea = rooms.stream().mapToInt(r -> r.getWidth() * r.getHeight()).sum();
        sb.append(String.format("  Rooms: %d%n", rooms.size()));
        sb.append(String.format("  Total area: %s sq px%n", String.format("%,d", totalArea)));
        sb.append(String.format("  Overlaps: %d%n", overlaps.size()));
        sb.append(String.format("  Canvas used: %d x %d px%n", bounds.maxX - bounds.minX, bounds.maxY - bounds.minY));

        return sb.toString();
    }

    private List<String[]> findOverlaps(List<RoomData> rooms) {
        List<String[]> overlaps = new ArrayList<>();
        for (int i = 0; i < rooms.size(); i++) {
            for (int j = i + 1; j < rooms.size(); j++) {
                RoomData a = rooms.get(i);
                RoomData b = rooms.get(j);
                if (a.getX() < b.getX() + b.getWidth() && a.getX() + a.getWidth() > b.getX()
                        && a.getY() < b.getY() + b.getHeight() && a.getY() + a.getHeight() > b.getY()) {
                    overlaps.add(new String[]{a.getName(), b.getName()});
                }
            }
        }
        return overlaps;
    }

    private Bounds getBounds(List<RoomData> rooms) {
        int minX = Integer.MAX_VALUE, minY = Integer.MAX_VALUE;
        int maxX = Integer.MIN_VALUE, maxY = Integer.MIN_VALUE;
        for (RoomData r : rooms) {
            minX = Math.min(minX, r.getX());
            minY = Math.min(minY, r.getY());
            maxX = Math.max(maxX, r.getX() + r.getWidth());
            maxY = Math.max(maxY, r.getY() + r.getHeight());
        }
        return new Bounds(minX, minY, maxX, maxY);
    }

    private record Bounds(int minX, int minY, int maxX, int maxY) {}
}
