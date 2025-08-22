package com.uor.engineering.labreschedulingsystem.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDate;
import java.util.List;

@Document(collection = "instructors")
public class Instructor {
    @Id
    private String id;
    private String name;
    private String email;
    @JsonFormat(pattern = "yyyy-MM-dd")
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