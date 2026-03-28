package com.itjob.jobservice.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class ProcessJobStatusRequest {

    private List<String> openJobIds;

    @Valid
    private List<RejectedJob> rejectedJobs;

    @Data
    public static class RejectedJob {
        @NotBlank(message = "ID công việc không được để trống.")
        private String jobId;
        private String reason;
    }
}
