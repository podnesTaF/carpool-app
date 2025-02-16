package com.itinside.carpoolingAPI.repositories;

import com.itinside.carpoolingAPI.models.User;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

import java.util.Optional;

@RepositoryRestResource(collectionResourceRel = "users", path = "users")
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByAuth0Sub(@Param("auth0Sub") String auth0Sub);

    Optional<User> findByEmail(String mail);

    @Query("SELECT u.id FROM User u WHERE u.auth0Sub = :auth0Sub")
    Optional<Long> findIdByAuth0Sub(@Param("auth0Sub") String auth0Sub);
}
