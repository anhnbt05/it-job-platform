package com.itjob.jobservice.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class JobFavoriteResponse {
    private String id;
    private LocalDateTime savedAt;
    private JobDetailResponse job;
}
