package com.prodesign.model;

import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public class AiRequest {

    @NotEmpty
    private List<RoomData> rooms;

    public List<RoomData> getRooms() { return rooms; }
    public void setRooms(List<RoomData> rooms) { this.rooms = rooms; }
}
