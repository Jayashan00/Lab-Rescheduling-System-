package com.uor.engineering.labreschedulingsystem.service;

import com.uor.engineering.labreschedulingsystem.model.LabRoom;
import com.uor.engineering.labreschedulingsystem.repository.LabRoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@Service
public class LabRoomService {

    private final LabRoomRepository labRoomRepository;

    @Autowired
    public LabRoomService(LabRoomRepository labRoomRepository) {
        this.labRoomRepository = labRoomRepository;
    }

    public List<LabRoom> getAllLabRooms() {
        return labRoomRepository.findAll();
    }

    public LabRoom createLabRoom(LabRoom labRoom) {
        return labRoomRepository.save(labRoom);
    }

    public Optional<LabRoom> getLabRoomById(String id) {
        return labRoomRepository.findById(id);
    }

    public LabRoom updateLabRoom(String id, LabRoom labRoomDetails) {
        LabRoom labRoom = labRoomRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Lab room not found with id: " + id));
        labRoom.setRoomNumber(labRoomDetails.getRoomNumber());
        labRoom.setCapacity(labRoomDetails.getCapacity());
        labRoom.setEquipment(labRoomDetails.getEquipment());
        labRoom.setUnavailableDates(labRoomDetails.getUnavailableDates());
        labRoom.setUnavailableTimeSlots(labRoomDetails.getUnavailableTimeSlots());
        return labRoomRepository.save(labRoom);
    }

    public void deleteLabRoom(String id) {
        labRoomRepository.deleteById(id);
    }

    public List<LabRoom> getAvailableLabRooms(String date, String timeSlot) {
        LocalDate localDate = LocalDate.parse(date, DateTimeFormatter.ISO_DATE);
        return labRoomRepository.findByUnavailableDatesNotContaining(localDate).stream()
                .filter(room -> !room.getUnavailableTimeSlots().contains(timeSlot))
                .toList();
    }
}