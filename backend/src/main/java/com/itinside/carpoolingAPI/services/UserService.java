package com.itinside.carpoolingAPI.services;

import com.itinside.carpoolingAPI.dto.UserDTO;
import com.itinside.carpoolingAPI.dto.UserUpdateDTO;
import com.itinside.carpoolingAPI.models.Genre;
import com.itinside.carpoolingAPI.models.User;
import com.itinside.carpoolingAPI.repositories.GenreRepository;
import com.itinside.carpoolingAPI.repositories.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final GenreRepository genreRepository;


    public UserDTO updateUser(Long id, UserUpdateDTO updatedUser) {
        Optional<User> optionalUser = userRepository.findById(id);
        if (optionalUser.isEmpty()) {
            throw new RuntimeException("User not found with id: " + id);
        }
        User user = optionalUser.get();


        user.setUsername(updatedUser.getUsername());
        user.setEmail(updatedUser.getEmail());
        user.setPhone(updatedUser.getPhone());
        user.setAuth0Sub(updatedUser.getAuth0Sub());
        user.setAddress(updatedUser.getAddress());
        user.setAvatarUrl(updatedUser.getAvatarUrl());
        user.setSeatingPreference(updatedUser.isSeatingPreference());
        user.setSmoking(updatedUser.isSmoking());
        user.setTalkative(updatedUser.isTalkative());

        if (updatedUser.getPreferredGenreIds() != null) {
            // Remove duplicates (if any) by converting to a set.
            List<Long> distinctGenreIds = updatedUser.getPreferredGenreIds()
                .stream()
                .distinct()
                .toList();
            List<Genre> genres = new ArrayList<>();
            for (Long genreId : distinctGenreIds) {
                Genre existingGenre = genreRepository.findById(genreId)
                    .orElseThrow(() -> new RuntimeException("Genre not found with id: " + genreId));
                genres.add(existingGenre);
            }
            user.setPreferredGenres(genres);
        } else {
            user.setPreferredGenres(new ArrayList<>());
        }

        User savedUser = userRepository.save(user);

        return UserDTO.fromEntity(savedUser);
    }
}