package com.itjob.jobservice.dto.request;

import lombok.Data;

import java.util.List;

@Data
public class SearchJobQuery {
    private String locationId;
    private List<String> categoryNames;
}
