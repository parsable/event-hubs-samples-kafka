package com.parsable.samples;

import com.microsoft.aad.msal4j.*;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.common.KafkaException;
import org.apache.kafka.common.security.auth.AuthenticateCallbackHandler;
import org.apache.kafka.common.security.oauthbearer.OAuthBearerToken;
import org.apache.kafka.common.security.oauthbearer.OAuthBearerTokenCallback;

import javax.security.auth.callback.Callback;
import javax.security.auth.callback.UnsupportedCallbackException;
import javax.security.auth.login.AppConfigurationEntry;
import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URI;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeoutException;

/**
 * see https://docs.microsoft.com/en-us/azure/event-hubs/event-hubs-for-kafka-ecosystem-overview#security-and-authentication
 * <br>
 * see https://github.com/Azure/azure-event-hubs-for-kafka/tree/master/tutorials/oauth/java/appsecret
 */
@Slf4j
public class AzureAuthCallbackHandler implements AuthenticateCallbackHandler {

    public static final String AUTHORITY_CONFIG = "event.hubs.authority";
    public static final String APPID_CONFIG = "event.hubs.appid";
    public static final String APPSECRET_CONFIG = "event.hubs.appsecret";

    private volatile String authority;
    private volatile String appId;
    private volatile String appSecret;

    private volatile ConfidentialClientApplication aadClient;
    private volatile ClientCredentialParameters aadParameters;

    @Override
    public void configure(Map<String, ?> configs, String mechanism, List<AppConfigurationEntry> jaasConfigEntries) {
        String bootstrapServer = Collections.singletonList(configs.get(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG)).get(0).toString();
        bootstrapServer = bootstrapServer.replaceAll("\\[|]", "");

        URI uri = URI.create("https://" + bootstrapServer);
        String sbUri = uri.getScheme() + "://" + uri.getHost();
        this.aadParameters = ClientCredentialParameters.builder(Collections.singleton(sbUri + "/.default"))
                .build();

        this.authority = (String) configs.get(AUTHORITY_CONFIG);
        this.appId = (String) configs.get(APPID_CONFIG);
        this.appSecret = (String) configs.get(APPSECRET_CONFIG);
    }

    @Override
    public void handle(Callback[] callbacks) throws IOException, UnsupportedCallbackException {
        for (Callback callback : callbacks) {
            if (callback instanceof OAuthBearerTokenCallback) {
                try {
                    OAuthBearerToken token = getOAuthBearerToken();
                    OAuthBearerTokenCallback oauthCallback = (OAuthBearerTokenCallback) callback;
                    oauthCallback.token(token);
                } catch (InterruptedException | ExecutionException | TimeoutException e) {
                    log.error("Unexpected failure", e);
                }
            } else {
                throw new UnsupportedCallbackException(callback);
            }
        }
    }

    private OAuthBearerToken getOAuthBearerToken() throws MalformedURLException, InterruptedException, ExecutionException, TimeoutException {
        initAadClient();

        IAuthenticationResult authResult = this.aadClient.acquireToken(this.aadParameters).get();
        log.info("Azure token acquired");

        return OAuthBearerTokenImpl.builder()
                .token(authResult.accessToken())
                .expiresOn(authResult.expiresOnDate().toInstant())
                .build();
    }

    private void initAadClient() throws MalformedURLException {
        if (this.aadClient == null) {
            synchronized (this) {
                if (this.aadClient == null) {
                    IClientCredential credential = ClientCredentialFactory.createFromSecret(this.appSecret);
                    this.aadClient = ConfidentialClientApplication.builder(this.appId, credential)
                            .authority(this.authority)
                            .build();
                }
            }
        }
    }

    public void close() throws KafkaException {
        // NOOP
    }
}
