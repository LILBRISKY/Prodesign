package com.prodesign.model;

public class RoomData {

    private Integer id;
    private String name;
    private String type;
    private Integer width;
    private Integer height;
    private Integer x;
    private Integer y;
    private String color;

    public RoomData() {}

    public RoomData(String name, String type, Integer width, Integer height, Integer x, Integer y, String color) {
        this.name = name;
        this.type = type;
        this.width = width;
        this.height = height;
        this.x = x;
        this.y = y;
        this.color = color;
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public Integer getWidth() { return width; }
    public void setWidth(Integer width) { this.width = width; }

    public Integer getHeight() { return height; }
    public void setHeight(Integer height) { this.height = height; }

    public Integer getX() { return x; }
    public void setX(Integer x) { this.x = x; }

    public Integer getY() { return y; }
    public void setY(Integer y) { this.y = y; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }
}
