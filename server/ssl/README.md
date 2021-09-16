# Generating a self-signed SSL certificate using `openssl`

To generate a self-signed SSL certificate using `openssl`, issue the following commands in your shell:

```bash
openssl genrsa -out key.pem
openssl req -new -key key.pem -out csr.pem
openssl x509 -req -days 9999 -in csr.pem -signkey key.pem -out cert.pem
rm csr.pem
```

This will leave you with two files: `cert.pem` and `key.pem`. That is all you need to do. The server file will utilize these files.