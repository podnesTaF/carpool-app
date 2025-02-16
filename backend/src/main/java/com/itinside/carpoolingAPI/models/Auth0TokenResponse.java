package com.itinside.carpoolingAPI.models;

public record Auth0TokenResponse(
    String access_token,
    String token_type,
    long expires_in
) {}
