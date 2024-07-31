package license

import (
	"fmt"
)

func getLicenseKey(company, app string) (string, error) {
	return "", fmt.Errorf("linux is not yet supported")
}

func setLicenseKey(company, app, licenseKey string) error {
	return nil
}

func getMachineId() (string, error) {
	return "", fmt.Errorf("linux is not yet supported")
}

func getEntraIdTenantId() string {
	return ""
}

func getDomainSID() string {
	return ""
}

func getGcpDomain() string {
	return ""
}
