package com.itjob.jobservice.dto.request;

import com.itjob.jobservice.enums.JobType;
import com.itjob.jobservice.enums.Level;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.util.List;

@Data
public class CreateJobRequest {

    @NotBlank(message = "Tiêu đề công việc không được để trống.")
    private String title;

    private String description;

    @NotBlank(message = "Địa chỉ làm việc không được để trống.")
    private String address;

    @NotBlank(message = "Mức lương không được để trống.")
    private String salary;

    @Positive(message = "Số lượng tuyển phải là số dương.")
    private int vacancies;

    @NotNull(message = "Loại hình làm việc không được để trống.")
    private JobType type;

    @NotBlank(message = "Thời gian làm việc không được để trống.")
    private String workingTimes;

    @NotBlank(message = "Ngày hết hạn không được để trống.")
    private String expiredDate;

    @NotNull(message = "Cấp độ không được để trống.")
    private Level level;

    @NotEmpty(message = "Danh sách danh mục không được rỗng.")
    private List<@NotBlank(message = "Tên danh mục không được rỗng.") String> categories;

    @NotEmpty(message = "Danh sách mô tả không được rỗng.")
    private List<@NotBlank(message = "Mô tả không được rỗng.") String> descriptions;

    @NotEmpty(message = "Danh sách lợi ích không được rỗng.")
    private List<@NotBlank(message = "Lợi ích không được rỗng.") String> benefits;

    @NotEmpty(message = "Danh sách yêu cầu không được rỗng.")
    private List<@NotBlank(message = "Yêu cầu không được rỗng.") String> requirements;
}
