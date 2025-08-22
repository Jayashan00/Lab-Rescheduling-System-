package com.uor.engineering.labreschedulingsystem.service;

import com.uor.engineering.labreschedulingsystem.model.Instructor;
import com.uor.engineering.labreschedulingsystem.repository.InstructorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@Service
public class InstructorService {

    private final InstructorRepository instructorRepository;

    @Autowired
    public InstructorService(InstructorRepository instructorRepository) {
        this.instructorRepository = instructorRepository;
    }

    public List<Instructor> getAllInstructors() {
        return instructorRepository.findAll();
    }

    public Instructor createInstructor(Instructor instructor) {
        return instructorRepository.save(instructor);
    }

    public Optional<Instructor> getInstructorById(String id) {
        return instructorRepository.findById(id);
    }

    public Instructor updateInstructor(String id, Instructor instructorDetails) {
        Instructor instructor = instructorRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Instructor not found with id: " + id));
        instructor.setName(instructorDetails.getName());
        instructor.setEmail(instructorDetails.getEmail());
        instructor.setUnavailableDates(instructorDetails.getUnavailableDates());
        instructor.setUnavailableTimeSlots(instructorDetails.getUnavailableTimeSlots());
        return instructorRepository.save(instructor);
    }

    public void deleteInstructor(String id) {
        instructorRepository.deleteById(id);
    }

    public List<Instructor> getAvailableInstructors(String date, String timeSlot) {
        LocalDate localDate = LocalDate.parse(date, DateTimeFormatter.ISO_DATE);
        return instructorRepository.findByUnavailableDatesNotContaining(localDate).stream()
                .filter(instructor -> !instructor.getUnavailableTimeSlots().contains(timeSlot))
                .toList();
    }
}