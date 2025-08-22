package com.uor.engineering.labreschedulingsystem.repository;

import com.uor.engineering.labreschedulingsystem.model.Appeal;
import com.uor.engineering.labreschedulingsystem.model.AppealStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AppealRepository extends MongoRepository<Appeal, String> {
    List<Appeal> findByStudentId(String studentId);
    List<Appeal> findByStatus(AppealStatus status);
    List<Appeal> findByRequestId(String requestId);
    List<Appeal> findByStatusIn(List<AppealStatus> statuses);

}