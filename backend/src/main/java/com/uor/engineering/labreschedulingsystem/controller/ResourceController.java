package com.uor.engineering.labreschedulingsystem.controller;

import com.uor.engineering.labreschedulingsystem.dto.ResourceAvailabilityDto;
import com.uor.engineering.labreschedulingsystem.service.ResourceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/resources")
@PreAuthorize("hasRole('LAB_COORDINATOR') or hasRole('ADMIN')")
public class ResourceController {

    private final ResourceService resourceService;

    @Autowired
    public ResourceController(ResourceService resourceService) {
        this.resourceService = resourceService;
    }

    @GetMapping("/availability")
    @PreAuthorize("hasAnyRole('STUDENT', 'LAB_ADVISOR', 'MODULE_COORDINATOR', 'LAB_COORDINATOR', 'ADMIN')")
    public ResponseEntity<ResourceAvailabilityDto> checkAvailability(
            @RequestParam String moduleCode,
            @RequestParam String date,
            @RequestParam String timeSlot) {
        ResourceAvailabilityDto availability = resourceService.checkResourceAvailability(moduleCode, date, timeSlot);
        return ResponseEntity.ok(availability);
    }

    @GetMapping("/instructors/availability")
    @PreAuthorize("hasAnyRole('STUDENT', 'LAB_ADVISOR', 'MODULE_COORDINATOR', 'LAB_COORDINATOR', 'ADMIN')")
    public ResponseEntity<Boolean> checkInstructorAvailability(
            @RequestParam String date,
            @RequestParam String timeSlot) {
        boolean available = resourceService.checkInstructorAvailability(date, timeSlot);
        return ResponseEntity.ok(available);
    }

    @GetMapping("/rooms/availability")
    @PreAuthorize("hasAnyRole('STUDENT', 'LAB_ADVISOR', 'MODULE_COORDINATOR', 'LAB_COORDINATOR', 'ADMIN')")
    public ResponseEntity<Boolean> checkRoomAvailability(
            @RequestParam String date,
            @RequestParam String timeSlot) {
        boolean available = resourceService.checkRoomAvailability(date, timeSlot);
        return ResponseEntity.ok(available);
    }

    @GetMapping("/tas/availability")
    @PreAuthorize("hasAnyRole('STUDENT', 'LAB_ADVISOR', 'MODULE_COORDINATOR', 'LAB_COORDINATOR', 'ADMIN')")
    public ResponseEntity<Boolean> checkTAAvailability(
            @RequestParam String date,
            @RequestParam String timeSlot) {
        boolean available = resourceService.checkTAAvailability(date, timeSlot);
        return ResponseEntity.ok(available);
    }
}