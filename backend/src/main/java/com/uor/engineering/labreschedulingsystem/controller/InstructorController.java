package com.uor.engineering.labreschedulingsystem.controller;

import com.uor.engineering.labreschedulingsystem.model.Instructor;
import com.uor.engineering.labreschedulingsystem.service.InstructorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/instructors")
@PreAuthorize("hasRole('LAB_COORDINATOR') or hasRole('ADMIN')")
public class InstructorController {


    private final InstructorService instructorService;

    @Autowired
    public InstructorController(InstructorService instructorService) {
        this.instructorService = instructorService;
    }

    @GetMapping
    public List<Instructor> getAllInstructors() {
        return instructorService.getAllInstructors();
    }

    @PostMapping
    public Instructor createInstructor(@RequestBody Instructor instructor) {
        return instructorService.createInstructor(instructor);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Instructor> getInstructorById(@PathVariable String id) {
        return instructorService.getInstructorById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Instructor> updateInstructor(@PathVariable String id, @RequestBody Instructor instructorDetails) {
        return ResponseEntity.ok(instructorService.updateInstructor(id, instructorDetails));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteInstructor(@PathVariable String id) {
        instructorService.deleteInstructor(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/available")
    public List<Instructor> getAvailableInstructors(@RequestParam String date, @RequestParam String timeSlot) {
        return instructorService.getAvailableInstructors(date, timeSlot);
    }
}