package com.uor.engineering.labreschedulingsystem.repository;

import com.uor.engineering.labreschedulingsystem.model.Module;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ModuleRepository extends MongoRepository<Module, String> {
    Optional<Module> findByModuleCode(String moduleCode);
    List<Module> findByDepartmentAndSemester(String department, int semester);
    List<Module> findByActive(boolean active);
}