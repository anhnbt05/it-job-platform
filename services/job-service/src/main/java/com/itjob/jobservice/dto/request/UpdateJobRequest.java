package com.itjob.jobservice.dto.request;

import com.itjob.jobservice.enums.JobType;
import com.itjob.jobservice.enums.Level;
import lombok.Data;

import java.util.List;

@Data
public class UpdateJobRequest {

    private String title;
    private String description;
    private String address;
    private String salary;
    private Integer vacancies;
    private JobType type;
    private String workingTimes;
    private String expiredDate;
    private Level level;
    private List<String> categories;
    private List<String> descriptions;
    private List<String> benefits;
    private List<String> requirements;
}
