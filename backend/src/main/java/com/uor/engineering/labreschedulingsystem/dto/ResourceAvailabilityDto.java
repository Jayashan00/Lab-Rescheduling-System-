package com.uor.engineering.labreschedulingsystem.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResourceAvailabilityDto {
    private String moduleCode;
    private String date;
    private String timeSlot;
    private boolean available;
    private String message;
}