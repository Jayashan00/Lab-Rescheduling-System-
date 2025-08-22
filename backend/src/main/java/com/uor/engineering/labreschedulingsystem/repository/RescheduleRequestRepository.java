package com.uor.engineering.labreschedulingsystem.repository;

import com.uor.engineering.labreschedulingsystem.model.RescheduleRequest;
import com.uor.engineering.labreschedulingsystem.model.RequestStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.mongodb.repository.Query;
import java.util.List;

@Repository
public interface RescheduleRequestRepository extends MongoRepository<RescheduleRequest, String> {
    List<RescheduleRequest> findByStudentId(String studentId);
    List<RescheduleRequest> findByStatus(RequestStatus status);
    List<RescheduleRequest> findByModuleCode(String moduleCode);
    @Query("{ 'moduleCode': ?0, 'requestedDate': ?1, 'status': { $nin: ['REJECTED', 'APPEAL_REJECTED'] } }")
    List<RescheduleRequest> findConflictingRequests(String moduleCode, String date);
    List<RescheduleRequest> findByModuleCodeAndRequestedDateAndRequestedTimeSlot(String moduleCode, String date, String timeSlot);
}