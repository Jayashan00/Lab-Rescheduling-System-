package com.uor.engineering.labreschedulingsystem.controller;

import com.uor.engineering.labreschedulingsystem.dto.MessageResponse;
import com.uor.engineering.labreschedulingsystem.model.Module;
import com.uor.engineering.labreschedulingsystem.repository.ModuleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.uor.engineering.labreschedulingsystem.model.RescheduleRequest;
import com.uor.engineering.labreschedulingsystem.repository.RescheduleRequestRepository;

import jakarta.validation.Valid;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import com.uor.engineering.labreschedulingsystem.dto.ResourceAvailabilityDto;
@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/modules")
public class ModuleController {

    @Autowired
    private ModuleRepository moduleRepository;
    @Autowired
    private RescheduleRequestRepository requestRepository;
    @GetMapping("/availability")
    @PreAuthorize("hasRole('LAB_COORDINATOR') or hasRole('ADMIN')")
    public ResponseEntity<?> checkLabAvailability(
            @RequestParam String moduleCode,
            @RequestParam String date) {

        Optional<Module> module = moduleRepository.findByModuleCode(moduleCode);
        if (!module.isPresent()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Module not found"));
        }

        List<RescheduleRequest> conflicts = requestRepository.findConflictingRequests(
                moduleCode, date);

        if (!conflicts.isEmpty()) {
            return ResponseEntity.ok().body(new ResourceAvailabilityDto(
                    moduleCode, date, "", false, "Conflict with existing requests"));
        }

        return ResponseEntity.ok().body(new ResourceAvailabilityDto(
                moduleCode, date, "", true, "Resources available"));
    }


    @GetMapping
    public List<Module> getAllModules() {
        return moduleRepository.findAll();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createModule(@Valid @RequestBody Module module) {
        Module savedModule = moduleRepository.save(module);
        return ResponseEntity.ok(savedModule);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Module> getModuleById(@PathVariable String id) {
        Optional<Module> module = moduleRepository.findById(id);
        return module.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODULE_COORDINATOR')")
    public ResponseEntity<?> updateModule(@PathVariable String id, @Valid @RequestBody Module moduleDetails) {
        Optional<Module> optionalModule = moduleRepository.findById(id);
        
        if (!optionalModule.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        Module module = optionalModule.get();
        module.setModuleName(moduleDetails.getModuleName());
        module.setDepartment(moduleDetails.getDepartment());
        module.setSemester(moduleDetails.getSemester());
        module.setCoordinator(moduleDetails.getCoordinator());
        module.setLabSessions(moduleDetails.getLabSessions());
        module.setActive(moduleDetails.isActive());
        module.setUpdatedAt(LocalDateTime.now());

        Module updatedModule = moduleRepository.save(module);
        return ResponseEntity.ok(updatedModule);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteModule(@PathVariable String id) {
        if (!moduleRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        moduleRepository.deleteById(id);
        return ResponseEntity.ok(new MessageResponse("Module deleted successfully!"));
    }

    @GetMapping("/department/{department}/semester/{semester}")
    public List<Module> getModulesByDepartmentAndSemester(@PathVariable String department, 
                                                         @PathVariable int semester) {
        return moduleRepository.findByDepartmentAndSemester(department, semester);
    }
}