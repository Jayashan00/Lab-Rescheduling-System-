package com.uor.engineering.labreschedulingsystem.controller;

import com.uor.engineering.labreschedulingsystem.model.TeachingAssistant;
import com.uor.engineering.labreschedulingsystem.service.TeachingAssistantService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teaching-assistants")
@PreAuthorize("hasRole('LAB_COORDINATOR') or hasRole('ADMIN')")
public class TeachingAssistantController {

    private final TeachingAssistantService teachingAssistantService;

    @Autowired
    public TeachingAssistantController(TeachingAssistantService teachingAssistantService) {
        this.teachingAssistantService = teachingAssistantService;
    }

    @GetMapping
    public List<TeachingAssistant> getAllTeachingAssistants() {
        return teachingAssistantService.getAllTeachingAssistants();
    }

    @PostMapping
    public TeachingAssistant createTeachingAssistant(@RequestBody TeachingAssistant teachingAssistant) {
        return teachingAssistantService.createTeachingAssistant(teachingAssistant);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TeachingAssistant> getTeachingAssistantById(@PathVariable String id) {
        return teachingAssistantService.getTeachingAssistantById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<TeachingAssistant> updateTeachingAssistant(@PathVariable String id, @RequestBody TeachingAssistant teachingAssistantDetails) {
        return ResponseEntity.ok(teachingAssistantService.updateTeachingAssistant(id, teachingAssistantDetails));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTeachingAssistant(@PathVariable String id) {
        teachingAssistantService.deleteTeachingAssistant(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/available")
    public List<TeachingAssistant> getAvailableTeachingAssistants(@RequestParam String date, @RequestParam String timeSlot) {
        return teachingAssistantService.getAvailableTeachingAssistants(date, timeSlot);
    }
}