package com.uor.engineering.labreschedulingsystem.service;

import com.uor.engineering.labreschedulingsystem.dto.ResourceAvailabilityDto;
import com.uor.engineering.labreschedulingsystem.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Service
public class ResourceService {

    private final InstructorRepository instructorRepository;
    private final LabRoomRepository labRoomRepository;
    private final TeachingAssistantRepository taRepository;
    private final RescheduleRequestRepository requestRepository;

    @Autowired
    public ResourceService(InstructorRepository instructorRepository,
                           LabRoomRepository labRoomRepository,
                           TeachingAssistantRepository taRepository,
                           RescheduleRequestRepository requestRepository) {
        this.instructorRepository = instructorRepository;
        this.labRoomRepository = labRoomRepository;
        this.taRepository = taRepository;
        this.requestRepository = requestRepository;
    }

    public ResourceAvailabilityDto checkResourceAvailability(String moduleCode, String date, String timeSlot) {
        LocalDate localDate = LocalDate.parse(date, DateTimeFormatter.ISO_DATE);

        boolean instructorAvailable = checkInstructorAvailability(date, timeSlot);
        boolean labRoomAvailable = checkRoomAvailability(date, timeSlot);
        boolean taAvailable = checkTAAvailability(date, timeSlot);

        boolean noConflicts = requestRepository.findByModuleCodeAndRequestedDateAndRequestedTimeSlot(moduleCode, date, timeSlot)
                .isEmpty();

        boolean allAvailable = instructorAvailable && labRoomAvailable && taAvailable && noConflicts;

        String message = allAvailable ? "All resources available" :
                (!instructorAvailable ? "Instructor not available. " : "") +
                        (!labRoomAvailable ? "Lab room not available. " : "") +
                        (!taAvailable ? "TA not available. " : "") +
                        (!noConflicts ? "Conflict with existing requests" : "");

        return new ResourceAvailabilityDto(moduleCode, date, timeSlot, allAvailable, message);
    }

    public boolean checkInstructorAvailability(String date, String timeSlot) {
        LocalDate localDate = LocalDate.parse(date, DateTimeFormatter.ISO_DATE);
        return instructorRepository.findByUnavailableDatesNotContaining(localDate).stream()
                .anyMatch(instructor -> !instructor.getUnavailableTimeSlots().contains(timeSlot));
    }

    public boolean checkRoomAvailability(String date, String timeSlot) {
        LocalDate localDate = LocalDate.parse(date, DateTimeFormatter.ISO_DATE);
        return labRoomRepository.findByUnavailableDatesNotContaining(localDate).stream()
                .anyMatch(room -> !room.getUnavailableTimeSlots().contains(timeSlot));
    }

    public boolean checkTAAvailability(String date, String timeSlot) {
        LocalDate localDate = LocalDate.parse(date, DateTimeFormatter.ISO_DATE);
        return taRepository.findByUnavailableDatesNotContaining(localDate).stream()
                .anyMatch(ta -> !ta.getUnavailableTimeSlots().contains(timeSlot));
    }
}