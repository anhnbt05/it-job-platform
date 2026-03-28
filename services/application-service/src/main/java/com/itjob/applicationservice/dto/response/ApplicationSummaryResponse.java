package com.itjob.applicationservice.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ApplicationSummaryResponse {
    private long total;
    private long pending;
    private long accepted;
    private long rejected;
}
