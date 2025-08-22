package com.uor.engineering.labreschedulingsystem.controller;

import com.uor.engineering.labreschedulingsystem.model.LabRoom;
import com.uor.engineering.labreschedulingsystem.service.LabRoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lab-rooms")
@PreAuthorize("hasRole('LAB_COORDINATOR') or hasRole('ADMIN')")
public class LabRoomController {

    private final LabRoomService labRoomService;

    @Autowired
    public LabRoomController(LabRoomService labRoomService) {
        this.labRoomService = labRoomService;
    }

    @GetMapping
    public List<LabRoom> getAllLabRooms() {
        return labRoomService.getAllLabRooms();
    }

    @PostMapping
    public LabRoom createLabRoom(@RequestBody LabRoom labRoom) {
        return labRoomService.createLabRoom(labRoom);
    }

    @GetMapping("/{id}")
    public ResponseEntity<LabRoom> getLabRoomById(@PathVariable String id) {
        return labRoomService.getLabRoomById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<LabRoom> updateLabRoom(@PathVariable String id, @RequestBody LabRoom labRoomDetails) {
        return ResponseEntity.ok(labRoomService.updateLabRoom(id, labRoomDetails));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteLabRoom(@PathVariable String id) {
        labRoomService.deleteLabRoom(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/available")
    public List<LabRoom> getAvailableLabRooms(@RequestParam String date, @RequestParam String timeSlot) {
        return labRoomService.getAvailableLabRooms(date, timeSlot);
    }
}