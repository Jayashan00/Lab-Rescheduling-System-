package com.uor.engineering.labreschedulingsystem.model;

public enum RequestStatus {
    PENDING,
    LAB_ADVISOR_REVIEWED,
    MODULE_COORDINATOR_REVIEWED,
    LAB_COORDINATOR_REVIEWED,
    APPROVED,
    REJECTED,
    APPEALED
}