package com.uor.engineering.labreschedulingsystem.repository;

import com.uor.engineering.labreschedulingsystem.model.LabRoom;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface LabRoomRepository extends MongoRepository<LabRoom, String> {
    List<LabRoom> findByUnavailableDatesNotContaining(LocalDate date);
    List<LabRoom> findByUnavailableTimeSlotsNotContaining(String timeSlot);
}