package com.itjob.applicationservice.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

@Data
public class ProcessApplicationsRequest {

    private List<String> acceptedApplicationIds;

    @Valid
    private List<RejectedApplication> rejectedApplications;

    @Data
    public static class RejectedApplication {
        @NotBlank(message = "ID đơn ứng tuyển không được để trống.")
        private String applicationId;
        private String reason;
    }
}
