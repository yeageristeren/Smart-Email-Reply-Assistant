package com.email.writer.app;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class EmailGeneratorService {
    private final WebClient webClient;

    public String generateEmailReply(EmailRequest emailRequest){
        //build prompt
        String prompt = generatePrompt(emailRequest);
        //craft request
        Map<String,Object> requestBody = Map.of(
                "contents",new Object[]{
                        Map.of("parts",new Object[]{
                                Map.of("text",prompt)
                                }
                        )
                }
        );
        //Do request and response
        String response = webClient.post()
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(String.class)
                .block();
        //retrieve response
        return extractResponse(response);
    }

    private String extractResponse(String response) {
        JsonNode rootNode;
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            rootNode = objectMapper.readTree(response);
        } catch (Exception e) {
            return "Error processing request :" + e.getMessage();
        }
        return rootNode.path("candidates")
                .get(0)
                .path("content").path("parts")
                .get(0)
                .path("text")
                .asString();
    }

    private String generatePrompt(EmailRequest emailRequest) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("Create a professional reply for an email with the provided content.\n");
        prompt.append("Do not include subject line.\n");
        if(!emailRequest.getTone().isEmpty()&&emailRequest.getTone()!=null){
            prompt.append("Use a "+emailRequest.getTone()+" tone.\n");
        }
        prompt.append("Original email :\n"+emailRequest.getContent());
        return prompt.toString();
    }
}
