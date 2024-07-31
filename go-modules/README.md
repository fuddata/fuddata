# GO Modules
This folder contains our open source modules for Golang and Hello World application to test them.

## Licensing
This module supports company wide licensing based on:
* EntraID Tenant ID
* Active Directory SID
* Google Credential Provider domain
And single computer licensing based on "Manufacturer" + "Model" + "Serial Number" combination.

It is designed to be used with licensing API defined in `website/functions/api/license.js`


### Preparation
Generating keys (bash):
```shell
openssl ecparam -name prime256v1 -genkey -noout -out priv_key.pem
openssl pkey -in priv_key.pem -pubout -out pub_key.pem
```

Converting keys to proper format (powershell):
```powershell
[convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($(Get-Content .\pub_key.pem -Raw)))
[convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($(Get-Content .\priv_key.pem -Raw)))
```

Update `licPubKey` value inside of `main.go` and `LICENSE_PRIVATE_KEY` inside of `website/.dev.vars`
