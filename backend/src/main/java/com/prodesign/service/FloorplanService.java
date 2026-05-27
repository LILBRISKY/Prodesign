package com.prodesign.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.prodesign.model.Floorplan;
import com.prodesign.model.RoomData;
import com.prodesign.repository.FloorplanRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class FloorplanService {

    private final FloorplanRepository repository;
    private final ObjectMapper objectMapper;

    public FloorplanService(FloorplanRepository repository, ObjectMapper objectMapper) {
        this.repository = repository;
        this.objectMapper = objectMapper;
    }

    public List<Floorplan> findAll() {
        return repository.findAll();
    }

    public Optional<Floorplan> findById(String id) {
        return repository.findById(id);
    }

    public Floorplan save(Floorplan floorplan) {
        return repository.save(floorplan);
    }

    public Floorplan update(String id, Floorplan updates) {
        return repository.findById(id).map(existing -> {
            if (updates.getName() != null) existing.setName(updates.getName());
            if (updates.getRoomsJson() != null) existing.setRoomsJson(updates.getRoomsJson());
            if (updates.getCanvasWidth() != null) existing.setCanvasWidth(updates.getCanvasWidth());
            if (updates.getCanvasHeight() != null) existing.setCanvasHeight(updates.getCanvasHeight());
            return repository.save(existing);
        }).orElseThrow(() -> new RuntimeException("Floorplan not found: " + id));
    }

    public void deleteById(String id) {
        repository.deleteById(id);
    }

    public Floorplan createFromRooms(String name, List<RoomData> rooms, int canvasWidth, int canvasHeight) {
        Floorplan fp = new Floorplan();
        fp.setName(name);
        fp.setCanvasWidth(canvasWidth);
        fp.setCanvasHeight(canvasHeight);
        try {
            fp.setRoomsJson(objectMapper.writeValueAsString(rooms));
        } catch (JsonProcessingException e) {
            fp.setRoomsJson("[]");
        }
        return repository.save(fp);
    }
}
