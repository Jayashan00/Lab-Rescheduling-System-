package com.uor.engineering.labreschedulingsystem.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.util.List;

@Document(collection = "lab_rooms")
public class LabRoom {
    @Id
    private String id;
    private String roomNumber;
    private int capacity;
    private String equipment;
    private List<LocalDate> unavailableDates;
    private List<String> unavailableTimeSlots;


    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getRoomNumber() { return roomNumber; }
    public void setRoomNumber(String roomNumber) { this.roomNumber = roomNumber; }
    public int getCapacity() { return capacity; }
    public void setCapacity(int capacity) { this.capacity = capacity; }
    public String getEquipment() { return equipment; }
    public void setEquipment(String equipment) { this.equipment = equipment; }
    public List<LocalDate> getUnavailableDates() { return unavailableDates; }
    public void setUnavailableDates(List<LocalDate> unavailableDates) { this.unavailableDates = unavailableDates; }
    public List<String> getUnavailableTimeSlots() { return unavailableTimeSlots; }
    public void setUnavailableTimeSlots(List<String> unavailableTimeSlots) { this.unavailableTimeSlots = unavailableTimeSlots; }
}