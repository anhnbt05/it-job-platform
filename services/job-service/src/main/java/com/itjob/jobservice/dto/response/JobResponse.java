package com.itjob.jobservice.dto.response;

import com.itjob.jobservice.enums.JobStatus;
import com.itjob.jobservice.enums.JobType;
import com.itjob.jobservice.enums.Level;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class JobResponse {
    private String id;
    private String title;
    private String description;
    private String address;
    private String salary;
    private int vacancies;
    private JobType type;
    private String workingTimes;
    private JobStatus status;
    private LocalDateTime postedAt;
    private LocalDateTime expiredAt;
    private Level level;
    private String recruiterId;
    private List<String> categories;
}
