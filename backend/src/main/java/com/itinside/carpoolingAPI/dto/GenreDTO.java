package com.itinside.carpoolingAPI.dto;

import com.itinside.carpoolingAPI.models.Genre;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GenreDTO {
    private Long id;
    private String name;

    public static GenreDTO fromEntity(Genre genre) {
        return GenreDTO.builder()
            .id(genre.getId())
            .name(genre.getName())
            .build();
    }
}