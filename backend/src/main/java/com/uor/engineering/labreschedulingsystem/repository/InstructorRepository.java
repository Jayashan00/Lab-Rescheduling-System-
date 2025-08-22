package com.uor.engineering.labreschedulingsystem.repository;

import com.uor.engineering.labreschedulingsystem.model.Instructor;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface InstructorRepository extends MongoRepository<Instructor, String> {
    List<Instructor> findByUnavailableDatesNotContaining(LocalDate date);
    List<Instructor> findByUnavailableTimeSlotsNotContaining(String timeSlot);
}