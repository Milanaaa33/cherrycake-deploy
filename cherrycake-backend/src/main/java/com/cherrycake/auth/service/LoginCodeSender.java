package com.cherrycake.auth.service;

/**
 * Delivers a one-time sign-in code to the customer.
 */
public interface LoginCodeSender {

    void send(String email, String code);
}
