# Event Hubs samples for Kafka API

These samples demostrate how to consume messages from Azure Event Hubs using Kafka API. Authorization is handled using SSL_SASL with OAuth Bearer tokens. 

* [Java](java/README.md)  
* [Node.js](js/README.md)  
* [.NET](dotnet/README.md)  
* [Python](python/README.md)  

## Firewall configuration

Make sure that you can access the following addresses:

```
<namespace>.servicebus.windows.net 9093
<namespace>.servicebus.windows.net 443
login.microsoftonline.com 443
```

`<namespace>` should be changed to a value of the namespace that you received from customer support. For example, if the namespace is `analyticsdata-default-xadt6cnbiw`, you should check connectivity to:

```
analyticsdata-default-xadt6cnbiw.servicebus.windows.net 9093
analyticsdata-default-xadt6cnbiw.servicebus.windows.net 443
login.microsoftonline.com 443
```

If you don't have access, you will **NOT** be able to consume the messages.

### How to check connectivity

You can use `telnet`:

```
telnet login.microsoftonline.com 443
```

If you have access to the host and port, you will get the following response:

```
telnet login.microsoftonline.com 443
Trying 40.126.32.135...
Connected to www.tm.ak.prd.aadg.akadns.net.
Escape character is '^]'.
```

If you don't have access, it will probably hang for some time, and then you will get:

```
telnet login.microsoftonline.com 443
Trying 40.126.32.135...
telnet: connect to address 40.126.32.135: Operation timed out
telnet: Unable to connect to remote host
```

or some other error.

### What am I to do if I don't have access to any of the hosts

You need to ask your system administrator to add the host port pairs mentioned above to your firewall allowlist.