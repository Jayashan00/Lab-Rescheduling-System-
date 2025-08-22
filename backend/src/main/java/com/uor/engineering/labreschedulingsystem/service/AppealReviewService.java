package com.uor.engineering.labreschedulingsystem.service;

import com.uor.engineering.labreschedulingsystem.dto.AppealReviewDto;
import com.uor.engineering.labreschedulingsystem.model.Appeal;
import com.uor.engineering.labreschedulingsystem.model.AppealStatus;
import com.uor.engineering.labreschedulingsystem.repository.AppealRepository;
import com.uor.engineering.labreschedulingsystem.security.UserPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AppealReviewService {

    private final AppealRepository appealRepository;

    public AppealReviewService(AppealRepository appealRepository) {
        this.appealRepository = appealRepository;
    }

    @Transactional
    public Appeal reviewAppeal(String appealId, AppealReviewDto reviewDto, UserPrincipal reviewer) {
        Appeal appeal = appealRepository.findById(appealId)
                .orElseThrow(() -> new RuntimeException("Appeal not found"));

        appeal.setStatus(reviewDto.isDecision() ? AppealStatus.APPROVED : AppealStatus.REJECTED);
        appeal.setPanelDecision(reviewDto.getComments());
        appeal.setReviewedBy(reviewer.getId());
        appeal.setUpdatedAt(LocalDateTime.now());

        return appealRepository.save(appeal);
    }

    public List<Appeal> getPendingAppeals() {
        return appealRepository.findByStatus(AppealStatus.PENDING);
    }

    public List<Appeal> getReviewedAppeals() {
        return appealRepository.findByStatusIn(List.of(AppealStatus.APPROVED, AppealStatus.REJECTED));
    }
}