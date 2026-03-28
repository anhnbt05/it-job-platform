package com.itjob.applicationservice.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateApplicationRequest {

    @NotBlank(message = "ID công việc không được để trống.")
    private String jobId;

    private String resumeUrl;
}
