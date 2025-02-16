package com.itinside.carpoolingAPI.services;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.storage.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.Base64;
import java.util.Optional;
import java.util.UUID;

@Service
public class StorageService {
    private final Storage storage;
    private final String bucketName;
    private final String coreUrl;

    /**
     * Constructs a new StorageService using GCP credentials from environment variables.
     *
     * @param projectId  The GCP project ID from environment.
     * @param bucketName The name of the bucket where files will be stored.
     * @throws IOException If credentials are invalid.
     */
    public StorageService(
        @Value("${gcp.project.id}") String projectId,
        @Value("${gcp.bucket.name}") String bucketName,
        @Value("${gcp.credentials.base64}") String credentialsBase64
    ) throws IOException {
        this.bucketName = bucketName;
        this.coreUrl = "https://storage.googleapis.com";

        // Decode base64 credentials and create GoogleCredentials
        byte[] credentialsBytes = Base64.getDecoder().decode(credentialsBase64);
        GoogleCredentials credentials = GoogleCredentials.fromStream(
            new ByteArrayInputStream(credentialsBytes)
        );

        // Initialize Storage client
        this.storage = StorageOptions.newBuilder()
            .setProjectId(projectId)
            .setCredentials(credentials)
            .build()
            .getService();
    }

    public String uploadFile(MultipartFile file, String destinationFilename, Optional<String> optionalFolderName) throws IOException {
        // Convert file to bytes
        byte[] bytes = file.getBytes();

        String uniqueIdentifier = UUID.randomUUID().toString();
        String uniqueFilename = uniqueIdentifier + "_" + destinationFilename;
        String folderName = optionalFolderName.map(folder -> folder + "/").orElse("");

        // Build the blob info
        BlobId blobId = BlobId.of(bucketName, folderName + uniqueFilename);
        BlobInfo blobInfo = BlobInfo.newBuilder(blobId)
            .setContentType(file.getContentType())
            .build();

        // Upload to GCS
        storage.create(blobInfo, bytes);

        String publicUrl = String.format("https://storage.googleapis.com/%s/%s%s", bucketName, folderName, uniqueFilename);
        return publicUrl;
    }

    public boolean deleteFile(String objectName) {
        BlobId blobId = BlobId.of(bucketName, objectName);
        return storage.delete(blobId);
    }

    public boolean deleteFileByUrl(String imageUrl) {
        try {
            String bucketUrlPrefix = String.format("https://storage.googleapis.com/%s/", bucketName);
            if (!imageUrl.startsWith(bucketUrlPrefix)) {
                throw new IllegalArgumentException("Invalid URL: does not match the bucket URL prefix");
            }

            String objectName = imageUrl.replace(bucketUrlPrefix, "");
            BlobId blobId = BlobId.of(bucketName, objectName);
            return storage.delete(blobId);
        } catch (StorageException e) {
            System.err.println("Error deleting file from bucket: " + e.getMessage());
            return false;
        } catch (IllegalArgumentException e) {
            System.err.println(e.getMessage());
            return false;
        }
    }
}