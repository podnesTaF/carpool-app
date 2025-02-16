package com.itinside.carpoolingAPI.controllers;

import com.itinside.carpoolingAPI.services.StorageService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Optional;

@RestController
@RequestMapping("/images")
public class ImageController {


    private final StorageService storageService;

    public ImageController(StorageService storageService) {
        this.storageService = storageService;
    }

    @PostMapping("/upload")
    public ResponseEntity<String> uploadImage(@RequestParam("file") MultipartFile file) {
        try {
            // you might generate a unique destinationFilename, e.g. a UUID or slug
            String fileUrl = storageService.uploadFile(file, file.getOriginalFilename(), Optional.of("images"));
            return ResponseEntity.ok(fileUrl);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Upload error: " + e.getMessage());
        }
    }

    @DeleteMapping
    public ResponseEntity<String> deleteImage(@RequestParam String imageUrl) {
        boolean deleted = storageService.deleteFileByUrl(imageUrl);
        if (deleted) {
            return ResponseEntity.ok("Image removed successfully");
        }
        return ResponseEntity.notFound().build();
    }
}