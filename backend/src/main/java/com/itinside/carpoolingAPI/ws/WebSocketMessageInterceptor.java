package com.itinside.carpoolingAPI.ws;

import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.stereotype.Component;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class WebSocketMessageInterceptor implements ChannelInterceptor {

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(message);

        log.info("Outgoing Message:");
        log.info("Message Type: {}", headerAccessor.getMessageType());
        log.info("Destination: {}", headerAccessor.getDestination());
        log.info("Session ID: {}", headerAccessor.getSessionId());
        log.info("User: {}", headerAccessor.getUser());

        if (message.getPayload() instanceof byte[]) {
            log.info("Payload: {}", new String((byte[]) message.getPayload()));
        } else {
            log.info("Payload: {}", message.getPayload());
        }

        return message;
    }
}
