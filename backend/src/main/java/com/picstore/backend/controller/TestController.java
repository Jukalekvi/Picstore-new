package com.picstore.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/* This is a simple test endpoint to check if the server is running. */
@RestController
public class TestController {
    
    /* This endpoint returns a message to confirm the connection works. */
    @GetMapping("api/test")
    public String sayHello() {
        return "Connection to backend is working!";
    }
}
