package com.uor.engineering.labreschedulingsystem.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AppealReviewDto {
    private boolean decision;
    private String comments;
}
