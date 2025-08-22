package com.uor.engineering.labreschedulingsystem.repository;

import com.uor.engineering.labreschedulingsystem.model.TeachingAssistant;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TeachingAssistantRepository extends MongoRepository<TeachingAssistant, String> {
    List<TeachingAssistant> findByUnavailableDatesNotContaining(LocalDate date);
    List<TeachingAssistant> findByUnavailableTimeSlotsNotContaining(String timeSlot);
}