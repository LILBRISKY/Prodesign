package com.prodesign.controller;

import com.prodesign.model.AiRequest;
import com.prodesign.model.AiResponse;
import com.prodesign.model.RoomData;
import com.prodesign.service.AiSpecService;
import com.prodesign.service.AiSuggestService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final AiSpecService specService;
    private final AiSuggestService suggestService;

    public AiController(AiSpecService specService, AiSuggestService suggestService) {
        this.specService = specService;
        this.suggestService = suggestService;
    }

    @PostMapping("/spec")
    public ResponseEntity<AiResponse> generateSpec(@Valid @RequestBody AiRequest request) {
        List<RoomData> rooms = request.getRooms();
        if (rooms == null || rooms.isEmpty()) {
            return ResponseEntity.ok(new AiResponse("No rooms provided. Add rooms to your floor plan first."));
        }
        String result = specService.generateSpecification(rooms);
        return ResponseEntity.ok(new AiResponse(result));
    }

    @PostMapping("/suggest")
    public ResponseEntity<AiResponse> generateSuggestions(@Valid @RequestBody AiRequest request) {
        List<RoomData> rooms = request.getRooms();
        if (rooms == null || rooms.isEmpty()) {
            return ResponseEntity.ok(new AiResponse("No rooms provided. Add rooms to your floor plan first."));
        }
        String result = suggestService.generateSuggestions(rooms);
        return ResponseEntity.ok(new AiResponse(result));
    }
}
