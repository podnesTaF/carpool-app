package com.itinside.carpoolingAPI.services;


import com.itinside.carpoolingAPI.models.Genre;
import com.itinside.carpoolingAPI.repositories.GenreRepository;
import jakarta.annotation.PostConstruct;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class GenreService {
    private final GenreRepository genreRepository;

    @PostConstruct
    public void loadData() {
        if (genreRepository.count() <= 0) {
            List<Genre> genres = new ArrayList<>();

            // Create Genres
            genres.add(Genre.builder().name("Rock").build());
            genres.add(Genre.builder().name("Pop").build());
            genres.add(Genre.builder().name("Metal").build());
            genres.add(Genre.builder().name("Classical").build());
            genres.add(Genre.builder().name("Electronic").build());


            genreRepository.saveAll(genres);
        }
    }
}
