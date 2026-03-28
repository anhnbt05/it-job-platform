package com.itjob.jobservice.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class JobSummaryResponse {
    private long total;
    private long open;
    private long pending;
    private long closed;
    private long rejected;
    private long expired;
}
