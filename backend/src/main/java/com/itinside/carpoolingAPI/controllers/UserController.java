package com.itinside.carpoolingAPI.controllers;

import com.itinside.carpoolingAPI.dto.UserDTO;
import com.itinside.carpoolingAPI.dto.UserUpdateDTO;
import com.itinside.carpoolingAPI.models.User;
import com.itinside.carpoolingAPI.repositories.UserRepository;
import com.itinside.carpoolingAPI.services.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/user")
public class UserController {
    private final UserService userService;

    @PutMapping("/{id}")
    public ResponseEntity<UserDTO> updateUser(@PathVariable Long id, @RequestBody UserUpdateDTO updatedUser) {
        UserDTO user = userService.updateUser(id, updatedUser);
        return ResponseEntity.ok(user);
    }
}