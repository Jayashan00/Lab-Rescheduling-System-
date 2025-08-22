package com.uor.engineering.labreschedulingsystem.controller;

import com.uor.engineering.labreschedulingsystem.dto.MessageResponse;
import com.uor.engineering.labreschedulingsystem.model.RescheduleRequest;
import com.uor.engineering.labreschedulingsystem.model.RequestStatus;
import com.uor.engineering.labreschedulingsystem.repository.RescheduleRequestRepository;
import com.uor.engineering.labreschedulingsystem.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.Valid;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/requests")
public class RescheduleRequestController {

    @Autowired
    private RescheduleRequestRepository requestRepository;

    @Value("${app.upload.dir}")
    private String uploadDir;

    private Path getRootLocation() {
        return Paths.get(uploadDir).toAbsolutePath().normalize();
    }

    @GetMapping
    @PreAuthorize("hasRole('STUDENT') or hasRole('LAB_ADVISOR') or hasRole('MODULE_COORDINATOR') or hasRole('LAB_COORDINATOR') or hasRole('ADMIN')")
    public List<RescheduleRequest> getAllRequests(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        if (userPrincipal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_STUDENT"))) {
            return requestRepository.findByStudentId(userPrincipal.getId());
        }
        return requestRepository.findAll();
    }

    @PostMapping
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> createRequest(@Valid @RequestBody RescheduleRequest request,
                                           @AuthenticationPrincipal UserPrincipal userPrincipal) {
        request.setStudentId(userPrincipal.getId());
        request.setStudentName(userPrincipal.getUsername());
        request.setStatus(RequestStatus.PENDING);
        request.setCreatedAt(LocalDateTime.now());
        request.setUpdatedAt(LocalDateTime.now());

        // Validate attachments exist if provided
        if (request.getAttachments() != null) {
            for (String filename : request.getAttachments()) {
                Path filePath = getRootLocation().resolve(filename).normalize();
                if (!Files.exists(filePath)) {
                    return ResponseEntity.badRequest()
                            .body(new MessageResponse("Attachment not found: " + filename));
                }
            }
        }

        RescheduleRequest savedRequest = requestRepository.save(request);
        return ResponseEntity.ok(savedRequest);
    }

    @PostMapping("/upload")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(new MessageResponse("Failed to store empty file"));
            }

            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            String filename = UUID.randomUUID().toString() + extension;

            Path rootLocation = getRootLocation();
            if (!Files.exists(rootLocation)) {
                Files.createDirectories(rootLocation);
            }

            Path destinationFile = rootLocation.resolve(filename).normalize();
            Files.copy(file.getInputStream(), destinationFile);

            return ResponseEntity.ok(filename);
        } catch (IOException e) {
            return ResponseEntity.internalServerError()
                    .body(new MessageResponse("Failed to store file: " + e.getMessage()));
        }
    }

    @GetMapping("/files/{filename:.+}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String filename) {
        try {
            Path rootLocation = getRootLocation();
            Path file = rootLocation.resolve(filename).normalize();
            Resource resource = new UrlResource(file.toUri());

            if (resource.exists() || resource.isReadable()) {
                return ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<RescheduleRequest> getRequestById(@PathVariable String id) {
        Optional<RescheduleRequest> request = requestRepository.findById(id);
        return request.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('LAB_ADVISOR') or hasRole('MODULE_COORDINATOR') or hasRole('LAB_COORDINATOR') or hasRole('ADMIN')")
    public ResponseEntity<?> updateRequest(@PathVariable String id, 
                                         @Valid @RequestBody RescheduleRequest requestDetails) {
        Optional<RescheduleRequest> optionalRequest = requestRepository.findById(id);
        
        if (!optionalRequest.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        RescheduleRequest request = optionalRequest.get();
        request.setLabAdvisorRecommendation(requestDetails.getLabAdvisorRecommendation());
        request.setModuleCoordinatorApproval(requestDetails.getModuleCoordinatorApproval());
        request.setLabCoordinatorApproval(requestDetails.getLabCoordinatorApproval());
        request.setStatus(requestDetails.getStatus());
        request.setApprovedDate(requestDetails.getApprovedDate());
        request.setRejectionReason(requestDetails.getRejectionReason());
        request.setUpdatedAt(LocalDateTime.now());

        RescheduleRequest updatedRequest = requestRepository.save(request);
        return ResponseEntity.ok(updatedRequest);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteRequest(@PathVariable String id) {
        if (!requestRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        requestRepository.deleteById(id);
        return ResponseEntity.ok(new MessageResponse("Request deleted successfully!"));
    }


    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('LAB_COORDINATOR')")
    public List<RescheduleRequest> getRequestsByStudent(@PathVariable String studentId) {
        return requestRepository.findByStudentId(studentId);
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("hasRole('LAB_ADVISOR') or hasRole('MODULE_COORDINATOR') or hasRole('LAB_COORDINATOR') or hasRole('ADMIN')")
    public List<RescheduleRequest> getRequestsByStatus(@PathVariable RequestStatus status) {
        return requestRepository.findByStatus(status);
    }


}