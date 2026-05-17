package com.picstore.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/* This is the main starting point for the backend server. It initializes and runs the application. */
@SpringBootApplication
public class BackendApplication {

	/* The main method that starts the server when the application runs. */
	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);
	}

}
