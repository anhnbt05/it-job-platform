package com.itjob.jobservice.dto.request;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class CreateJobFavoritesRequest {
    @NotEmpty(message = "Danh sách ID công việc không được rỗng.")
    private List<String> jobIds;
}
