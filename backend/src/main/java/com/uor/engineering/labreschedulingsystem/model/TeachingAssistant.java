package com.uor.engineering.labreschedulingsystem.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.util.List;

@Document(collection = "teaching_assistants")
public class TeachingAssistant {
    @Id
    private String id;
    private String name;
    private String email;
    private List<LocalDate> unavailableDates;
    private List<String> unavailableTimeSlots;


    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public List<LocalDate> getUnavailableDates() { return unavailableDates; }
    public void setUnavailableDates(List<LocalDate> unavailableDates) { this.unavailableDates = unavailableDates; }
    public List<String> getUnavailableTimeSlots() { return unavailableTimeSlots; }
    public void setUnavailableTimeSlots(List<String> unavailableTimeSlots) { this.unavailableTimeSlots = unavailableTimeSlots; }
}