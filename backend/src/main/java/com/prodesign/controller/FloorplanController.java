package com.prodesign.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.prodesign.model.Floorplan;
import com.prodesign.model.RoomData;
import com.prodesign.service.FloorplanService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/floorplans")
public class FloorplanController {

    private final FloorplanService service;
    private final ObjectMapper objectMapper;

    public FloorplanController(FloorplanService service, ObjectMapper objectMapper) {
        this.service = service;
        this.objectMapper = objectMapper;
    }

    @GetMapping
    public ResponseEntity<List<Floorplan>> listAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Floorplan> getById(@PathVariable String id) {
        return service.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Floorplan> create(@RequestBody Map<String, Object> body) {
        String name = (String) body.getOrDefault("name", "Untitled Floor Plan");
        Integer canvasWidth = (Integer) body.getOrDefault("canvasWidth", 700);
        Integer canvasHeight = (Integer) body.getOrDefault("canvasHeight", 500);

        @SuppressWarnings("unchecked")
        List<RoomData> rooms = objectMapper.convertValue(body.get("rooms"),
                objectMapper.getTypeFactory().constructCollectionType(List.class, RoomData.class));

        Floorplan fp = service.createFromRooms(name, rooms, canvasWidth, canvasHeight);
        return ResponseEntity.ok(fp);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Floorplan> update(@PathVariable String id, @RequestBody Map<String, Object> body) {
        return service.findById(id).map(existing -> {
            if (body.containsKey("name")) {
                existing.setName((String) body.get("name"));
            }
            if (body.containsKey("canvasWidth")) {
                existing.setCanvasWidth((Integer) body.get("canvasWidth"));
            }
            if (body.containsKey("canvasHeight")) {
                existing.setCanvasHeight((Integer) body.get("canvasHeight"));
            }
            if (body.containsKey("rooms")) {
                try {
                    existing.setRoomsJson(objectMapper.writeValueAsString(body.get("rooms")));
                } catch (JsonProcessingException e) {
                    existing.setRoomsJson("[]");
                }
            }
            return ResponseEntity.ok(service.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        if (service.findById(id).isPresent()) {
            service.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
