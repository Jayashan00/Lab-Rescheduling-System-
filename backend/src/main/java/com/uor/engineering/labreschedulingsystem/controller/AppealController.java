package com.uor.engineering.labreschedulingsystem.controller;

import com.uor.engineering.labreschedulingsystem.dto.MessageResponse;
import com.uor.engineering.labreschedulingsystem.model.Appeal;
import com.uor.engineering.labreschedulingsystem.model.AppealStatus;
import com.uor.engineering.labreschedulingsystem.model.User;
import com.uor.engineering.labreschedulingsystem.repository.AppealRepository;
import com.uor.engineering.labreschedulingsystem.repository.UserRepository;
import com.uor.engineering.labreschedulingsystem.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import com.uor.engineering.labreschedulingsystem.dto.AppealReviewDto;
import jakarta.validation.Valid;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Arrays;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import org.springframework.beans.factory.annotation.Value;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/appeals")
public class AppealController {
    @Value("${app.upload.dir}")
    private String uploadDir;

    @Autowired
    private AppealRepository appealRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    @PreAuthorize("hasRole('STUDENT') or hasRole('ADMIN')")
    public List<Appeal> getAllAppeals(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        if (userPrincipal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_STUDENT"))) {
            return appealRepository.findByStudentId(userPrincipal.getId());
        }
        return appealRepository.findAll();
    }

    private String formatRequestId(String requestId) {
        if (requestId == null || requestId.isEmpty()) {
            return "N/A";
        }

        if (requestId.length() > 6) {
            return "REQ-" + requestId.substring(requestId.length() - 6);
        }
        return requestId;
    }

    @PostMapping
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> createAppeal(@Valid @RequestBody Appeal appeal,
                                          @AuthenticationPrincipal UserPrincipal userPrincipal) {
        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        appeal.setStudentId(userPrincipal.getId());
        appeal.setStudentName(user.getFirstName() + " " + user.getLastName());
        appeal.setStatus(AppealStatus.PENDING);

        if (appeal.getAttachments() != null) {
            Path rootLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
            for (String filename : appeal.getAttachments()) {
                Path filePath = rootLocation.resolve(filename).normalize();
                if (!Files.exists(filePath)) {
                    return ResponseEntity.badRequest()
                            .body(new MessageResponse("Attachment not found: " + filename));
                }
            }
        }

        Appeal savedAppeal = appealRepository.save(appeal);
        return ResponseEntity.ok(savedAppeal);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Appeal> getAppealById(@PathVariable String id) {
        Optional<Appeal> appeal = appealRepository.findById(id);
        return appeal.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateAppeal(@PathVariable String id,
                                          @Valid @RequestBody Appeal appealDetails) {
        Optional<Appeal> optionalAppeal = appealRepository.findById(id);

        if (!optionalAppeal.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        Appeal appeal = optionalAppeal.get();
        appeal.setStatus(appealDetails.getStatus());
        appeal.setPanelDecision(appealDetails.getPanelDecision());
        appeal.setUpdatedAt(LocalDateTime.now());

        Appeal updatedAppeal = appealRepository.save(appeal);
        return ResponseEntity.ok(updatedAppeal);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteAppeal(@PathVariable String id) {
        if (!appealRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        appealRepository.deleteById(id);
        return ResponseEntity.ok(new MessageResponse("Appeal deleted successfully!"));
    }

    @PostMapping("/{id}/review")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> reviewAppeal(
            @PathVariable String id,
            @Valid @RequestBody AppealReviewDto reviewDto,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        Optional<Appeal> optionalAppeal = appealRepository.findById(id);
        if (optionalAppeal.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Appeal not found for ID: " + id));
        }

        Appeal appeal = optionalAppeal.get();
        appeal.setStatus(reviewDto.isDecision() ? AppealStatus.APPROVED : AppealStatus.REJECTED);
        appeal.setPanelDecision(reviewDto.getComments());
        appeal.setUpdatedAt(LocalDateTime.now());
        appeal.setReviewedBy(userPrincipal.getUsername());

        Appeal updatedAppeal = appealRepository.save(appeal);
        return ResponseEntity.ok(updatedAppeal);
    }

    // Modify your getReviewedAppeals method like this:
    @GetMapping("/reviewed")
    @PreAuthorize("hasRole('ADMIN')")
    public List<Appeal> getReviewedAppeals() {
        List<Appeal> appeals = appealRepository.findByStatusIn(
                Arrays.asList(AppealStatus.APPROVED, AppealStatus.REJECTED)
        );

        // Format the request IDs before returning
        appeals.forEach(appeal -> {
            if (appeal.getRequestId() != null) {
                appeal.setRequestId(formatRequestId(appeal.getRequestId()));
            }
            // Ensure student name is properly set
            if (appeal.getStudentName() == null || appeal.getStudentName().isEmpty()) {
                appeal.setStudentName("Student-" +
                        (appeal.getStudentId() != null ?
                                appeal.getStudentId().substring(0, Math.min(6, appeal.getStudentId().length())) :
                                "UNKNOWN"));
            }
        });

        return appeals;
    }

    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public List<Appeal> getPendingAppeals() {
        return appealRepository.findByStatus(AppealStatus.PENDING);
    }
}