package com.parsable.samples;

import lombok.Builder;
import lombok.Value;
import org.apache.kafka.common.security.oauthbearer.OAuthBearerToken;

import java.time.Instant;
import java.util.Set;

@Value
@Builder
public class OAuthBearerTokenImpl implements OAuthBearerToken {
    String token;
    Instant expiresOn;

    @Override
    public String value() {
        return this.token;
    }

    @Override
    public Set<String> scope() {
        return null;
    }

    @Override
    public long lifetimeMs() {
        return expiresOn.toEpochMilli();
    }

    @Override
    public String principalName() {
        return null;
    }

    @Override
    public Long startTimeMs() {
        return null;
    }
}
