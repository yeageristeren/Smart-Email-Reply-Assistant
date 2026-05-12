package com.email.writer.app.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {
    @Value("${gemini.api.key}")
    private String geminiApiKey;
    @Value("${gemini.api.url}")
    private String geminiUrl;
    @Bean
    public WebClient getGeminiWebClient(){
        return WebClient.builder()
                .baseUrl(geminiUrl+"?key="+geminiApiKey)
                .defaultHeader("Content-Type","application/json")
                .build();

    }
}
