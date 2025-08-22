package com.uor.engineering.labreschedulingsystem.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "reschedule_requests")
public class RescheduleRequest {
    @Id
    private String id;
    private String studentId;
    private String studentName;
    private String moduleCode;
    private String originalLabDate;
    private String requestedDate;
    private String reason;
    private List<String> attachments;
    private RequestStatus status;
    private String labAdvisorRecommendation;
    private String moduleCoordinatorApproval;
    private String labCoordinatorApproval;
    private String approvedDate;
    private String rejectionReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String requestedTimeSlot;

    public RescheduleRequest() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.status = RequestStatus.PENDING;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public String getModuleCode() { return moduleCode; }
    public void setModuleCode(String moduleCode) { this.moduleCode = moduleCode; }

    public String getOriginalLabDate() { return originalLabDate; }
    public void setOriginalLabDate(String originalLabDate) { this.originalLabDate = originalLabDate; }

    public String getRequestedDate() { return requestedDate; }
    public void setRequestedDate(String requestedDate) { this.requestedDate = requestedDate; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public List<String> getAttachments() { return attachments; }
    public void setAttachments(List<String> attachments) { this.attachments = attachments; }

    public RequestStatus getStatus() { return status; }
    public void setStatus(RequestStatus status) { this.status = status; }

    public String getLabAdvisorRecommendation() { return labAdvisorRecommendation; }
    public void setLabAdvisorRecommendation(String labAdvisorRecommendation) { 
        this.labAdvisorRecommendation = labAdvisorRecommendation; 
    }

    public String getModuleCoordinatorApproval() { return moduleCoordinatorApproval; }
    public void setModuleCoordinatorApproval(String moduleCoordinatorApproval) { 
        this.moduleCoordinatorApproval = moduleCoordinatorApproval; 
    }

    public String getLabCoordinatorApproval() { return labCoordinatorApproval; }
    public void setLabCoordinatorApproval(String labCoordinatorApproval) { 
        this.labCoordinatorApproval = labCoordinatorApproval; 
    }

    public String getApprovedDate() { return approvedDate; }
    public void setApprovedDate(String approvedDate) { this.approvedDate = approvedDate; }

    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public String getRequestedTimeSlot() { return requestedTimeSlot; }
    public void setRequestedTimeSlot(String requestedTimeSlot) { this.requestedTimeSlot = requestedTimeSlot; }
}