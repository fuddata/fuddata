package license

import (
	"bytes"
	"crypto/ecdsa"
	"crypto/sha256"
	"crypto/x509"
	"encoding/base64"
	"encoding/json"
	"encoding/pem"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"time"
)

type Request struct {
	App  string `json:"app"`
	Type int    `json:"type"`
	Guid string `json:"guid"`
}

type Response struct {
	Status  int    `json:"status"`
	Message string `json:"message,omitempty"`
}

func GetLicenseStatus(company, app, apiUrl, pubKey string) (int, bool, int, string, error) {
	var err error
	firstLaunchDate := ""
	license := ""
	validLicense := false
	clientID := ""
	licenseType := 1
	trialPeriod := 30

	clientID = getEntraIdTenantId()
	if clientID != "" {
		log.Printf("GetLicenseStatus: Using EntraID based license. TenantID: %v\r\n", clientID)
		licenseType = 2
	} else {
		clientID = getDomainSID()
		if clientID != "" {
			log.Printf("GetLicenseStatus: Using Active Directory based license. Domain SID: %v\r\n", clientID)
			licenseType = 3
		} else {
			clientID = getGcpDomain()
			if clientID != "" {
				log.Printf("GetLicenseStatus: Using Google Credential Provider based license. Domain SHA256 hash: %v\r\n", clientID)
				licenseType = 4
			} else {
				clientID, err = getMachineId()
				if err != nil {
					log.Printf("GetLicenseStatus: getMachineId() failed: %v\r\n", err)
					return -1, false, 0, "", err
				}
				log.Printf("GetLicenseStatus: Using computer based license. MachineID: %v\r\n", clientID)
				trialPeriod = 7
			}
		}
	}

	// Read license key from registry
	license, err = getLicenseKey(company, app)
	if err != nil {
		return 0, false, licenseType, clientID, errors.New("cannot open " + app + " registry key")
	}

	// Validate license key if defined
	if license != "" {
		validLicense, err = verifyLicKey(clientID, pubKey, license)
		if err != nil || !validLicense {
			log.Printf("GetLicenseStatus: Local license key is invalid. Requesting new key.\r\n")
		}
		if validLicense {
			log.Printf("GetLicenseStatus: Local license key is valid\r\n")
			return -1, false, licenseType, clientID, nil
		}
	}

	licStatus, licDetail, err := getRemote(apiUrl, app, clientID, licenseType)
	if err != nil {
		log.Printf("GetLicenseStatus: getRemote() failed: %v\r\n", err)
	}
	licenseOrdered := false
	switch licStatus {
	case 11, 21, 31, 41:
		firstLaunchDate = licDetail
	case 12, 22, 32, 42:
		licenseOrdered = true
		firstLaunchDate = licDetail
	case 13, 23, 33, 43:
		validLicense, err = verifyLicKey(clientID, pubKey, licDetail)
		if err != nil {
			log.Printf("GetLicenseStatus: verifyLicKey() failed: %v\r\n", err)
		}
		if validLicense {
			log.Printf("GetLicenseStatus: Received valid license key from licensing API. Saving it for future use.\r\n")
			err = setLicenseKey(company, app, licDetail)
			if err != nil {
				log.Printf("GetLicenseStatus: setLicenseKey() failed: %v\r\n", err)
			}
			return -1, false, licenseType, clientID, nil
		}
	default:
		log.Printf("GetLicenseStatus: Unhandled licensing status. Status: %v Details: %v Error: %v", licStatus, licDetail, err)
		return 0, false, licenseType, clientID, fmt.Errorf("unhandled licensing status. Status: %v Details: %v Error: %v", licStatus, licDetail, err)
	}

	startDate, err := time.Parse("2006-01-02", firstLaunchDate)
	if err != nil {
		log.Printf("GetLicenseStatus: time.Parse failed: %v\r\n", err)
		return 0, false, licenseType, clientID, fmt.Errorf("parsing first launch date: %s", err)
	}
	currentDate := time.Now()
	daysPassed := currentDate.Sub(startDate).Hours() / 24
	daysLeft := trialPeriod - int(daysPassed)
	if daysLeft > 0 {
		log.Printf("GetLicenseStatus: Using trial mode, %v days left\r\n", daysLeft)
		return daysLeft, licenseOrdered, licenseType, clientID, nil
	}
	err = errors.New("your trial period has ended")
	log.Printf("GetLicenseStatus: time.Parse failed: %v\r\n", err)
	return -2, false, licenseType, clientID, err
}

func verifyLicKey(data, pKey, sign string) (bool, error) {
	pubKey, err := base64.StdEncoding.DecodeString(pKey)
	if err != nil {
		err = fmt.Errorf("decoding public key: %s", err)
		log.Printf("GetLicenseStatus: %v\r\n", err)
		return false, err
	}

	block, _ := pem.Decode(pubKey)
	if block == nil {
		return false, errors.New("pubKey no pem data found")
	}
	genericPublicKey, err := x509.ParsePKIXPublicKey(block.Bytes)
	if err != nil {
		return false, err
	}
	pk := genericPublicKey.(*ecdsa.PublicKey)

	h := sha256.New()
	h.Write([]byte(data))
	hash := h.Sum(nil)

	bSign, err := base64.StdEncoding.DecodeString(sign)
	if err != nil {
		return false, err
	}
	return ecdsa.VerifyASN1(pk, hash, bSign), nil
}

func getRemote(apiUrl, app, guid string, licenseType int) (int, string, error) {
	data := Request{
		App:  app,
		Guid: guid,
		Type: licenseType,
	}

	jsonData, err := json.Marshal(data)
	if err != nil {
		err = fmt.Errorf("marshaling licensing data: %s", err)
		log.Printf("GetLicenseStatus: json.Marshal() failed: %v\r\n", err)
		return -1, "", err
	}

	var client = &http.Client{
		Timeout: 10 * time.Second,
	}
	resp, err := client.Post(apiUrl, "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		err = fmt.Errorf("sending license status request: %s", err)
		log.Printf("GetLicenseStatus: client.Post() failed: %v\r\n", err)
		return -1, "", err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		err = fmt.Errorf("reading license service response: %s", err)
		log.Printf("GetLicenseStatus: io.ReadAll() failed: %v\r\n", err)
		return -1, "", err
	}

	var responseObj Response
	err = json.Unmarshal(body, &responseObj)
	if err != nil {
		err = fmt.Errorf("unmarshaling license service response: %s", err)
		log.Printf("GetLicenseStatus: io.ReadAll() failed: %v\r\n", err)
		return -1, "", err
	}

	return responseObj.Status, responseObj.Message, nil
}
