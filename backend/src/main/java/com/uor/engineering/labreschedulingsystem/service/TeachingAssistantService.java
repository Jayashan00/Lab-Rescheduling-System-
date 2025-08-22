package com.uor.engineering.labreschedulingsystem.service;

import com.uor.engineering.labreschedulingsystem.model.TeachingAssistant;
import com.uor.engineering.labreschedulingsystem.repository.TeachingAssistantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@Service
public class TeachingAssistantService {

    private final TeachingAssistantRepository teachingAssistantRepository;

    @Autowired
    public TeachingAssistantService(TeachingAssistantRepository teachingAssistantRepository) {
        this.teachingAssistantRepository = teachingAssistantRepository;
    }

    public List<TeachingAssistant> getAllTeachingAssistants() {
        return teachingAssistantRepository.findAll();
    }

    public TeachingAssistant createTeachingAssistant(TeachingAssistant teachingAssistant) {
        return teachingAssistantRepository.save(teachingAssistant);
    }

    public Optional<TeachingAssistant> getTeachingAssistantById(String id) {
        return teachingAssistantRepository.findById(id);
    }

    public TeachingAssistant updateTeachingAssistant(String id, TeachingAssistant teachingAssistantDetails) {
        TeachingAssistant teachingAssistant = teachingAssistantRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Teaching assistant not found with id: " + id));
        teachingAssistant.setName(teachingAssistantDetails.getName());
        teachingAssistant.setEmail(teachingAssistantDetails.getEmail());
        teachingAssistant.setUnavailableDates(teachingAssistantDetails.getUnavailableDates());
        teachingAssistant.setUnavailableTimeSlots(teachingAssistantDetails.getUnavailableTimeSlots());
        return teachingAssistantRepository.save(teachingAssistant);
    }

    public void deleteTeachingAssistant(String id) {
        teachingAssistantRepository.deleteById(id);
    }

    public List<TeachingAssistant> getAvailableTeachingAssistants(String date, String timeSlot) {
        LocalDate localDate = LocalDate.parse(date, DateTimeFormatter.ISO_DATE);
        return teachingAssistantRepository.findByUnavailableDatesNotContaining(localDate).stream()
                .filter(ta -> !ta.getUnavailableTimeSlots().contains(timeSlot))
                .toList();
    }
}