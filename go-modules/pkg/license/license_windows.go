package license

import (
	"crypto/sha256"
	"errors"
	"fmt"
	"log"
	"strings"
	"syscall"
	"unsafe"

	wapi "github.com/iamacarpet/go-win64api"
	"github.com/yusufpapurcu/wmi"
	"golang.org/x/sys/windows/registry"
)

type Win32_ComputerSystem struct {
	Manufacturer string
	Model        string
}

type Win32_BIOS struct {
	SerialNumber string
}

func getLicenseKey(company, app string) (string, error) {
	license := ""
	k, oldKey, err := registry.CreateKey(registry.LOCAL_MACHINE, `SOFTWARE\`+company+`\`+app, registry.READ+registry.WRITE)
	if err != nil {
		log.Printf("GetLicenseStatus: registry.CreateKey() failed: %v\r\n", err)
		return "", errors.New("cannot open " + app + " registry key")
	}
	defer k.Close()
	if oldKey {
		license, _, _ = k.GetStringValue("LicenseKey")
	}
	return license, nil
}

func setLicenseKey(company, app, licenseKey string) error {
	k, _, err := registry.CreateKey(registry.LOCAL_MACHINE, `SOFTWARE\`+company+`\`+app, registry.READ+registry.WRITE)
	if err != nil {
		return errors.New("cannot open " + app + " registry key")
	}
	defer k.Close()
	k.SetStringValue("LicenseKey", licenseKey)
	return nil
}

func getMachineId() (string, error) {
	// Generate single machine client ID in format:
	// Manufacturer|Model|SerialNumber
	var computerInfo []Win32_ComputerSystem
	query := "SELECT Manufacturer,Model FROM Win32_ComputerSystem"
	if err := wmi.Query(query, &computerInfo); err != nil {
		err = errors.New("cannot read BIOS information")
		log.Printf("getMachineId: %v\r\n", err)
		return "", err
	}
	var biosInfo []Win32_BIOS
	query = "SELECT SerialNumber FROM Win32_BIOS"
	if err := wmi.Query(query, &biosInfo); err != nil {
		err = errors.New("cannot read BIOS information")
		log.Printf("getMachineId: %v\r\n", err)
		return "", err
	}
	return computerInfo[0].Manufacturer + "|" + computerInfo[0].Model + "|" + biosInfo[0].SerialNumber, nil
}

func getEntraIdTenantId() string {
	key, err := registry.OpenKey(registry.LOCAL_MACHINE, `SYSTEM\CurrentControlSet\Control\CloudDomainJoin\JoinInfo`, registry.ENUMERATE_SUB_KEYS)
	if err != nil {
		return ""
	}
	defer key.Close()

	subkeys, err := key.ReadSubKeyNames(-1)
	if err != nil {
		return ""
	}

	if len(subkeys) == 0 {
		return ""
	}

	joinInfoKey, err := registry.OpenKey(key, subkeys[0], registry.QUERY_VALUE)
	if err != nil {
		fmt.Printf("Error opening join info key: %v\n", err)
		return ""
	}
	defer joinInfoKey.Close()

	tenantId, _, err := joinInfoKey.GetStringValue("TenantId")
	if err != nil {
		fmt.Printf("Error reading TenantId value: %v\n", err)
		return ""
	}

	return tenantId
}

func getDomainSID() string {
	profileListKey, err := registry.OpenKey(registry.LOCAL_MACHINE, `SOFTWARE\Microsoft\Windows NT\CurrentVersion\ProfileList`, registry.READ)
	if err != nil {
		fmt.Printf("Cannot open ProfileList registry key: %v\n", err)
		return ""
	}
	defer profileListKey.Close()

	// Get local computer SID prefix
	users, err := wapi.ListLocalUsers()
	if err != nil {
		fmt.Printf("Cannot list local users: %v\n", err)
		return ""
	}

	sid, _, _, err := syscall.LookupSID("", users[0].Username)
	if err != nil {
		fmt.Printf("User: %v LookupSID failed: \n", users[0].Username, err)
		return ""
	}

	// Convert SID to string
	var sidString *uint16
	err = syscall.ConvertSidToStringSid(sid, &sidString)
	if err != nil {
		fmt.Printf("ConvertSidToStringSid failed: %v\n", err)
		return ""
	}
	defer syscall.LocalFree(syscall.Handle(unsafe.Pointer(sidString)))
	sidString2 := syscall.UTF16ToString((*[1 << 16]uint16)(unsafe.Pointer(sidString))[:])
	sidParts := strings.Split(sidString2, "-")
	localSIDPrefix := strings.Join(sidParts[:len(sidParts)-1], "-")

	// Enumerate subkeys
	subKeys, err := profileListKey.ReadSubKeyNames(-1)
	if err != nil {
		fmt.Printf("profileListKey.ReadSubKeyNames failed: %v\n", err)
		return ""
	}

	for _, subKey := range subKeys {
		// Ignore built-in accounts and profiles matching the local SID prefix
		if strings.HasPrefix(subKey, "S-1-5-21-") && !strings.HasPrefix(subKey, localSIDPrefix) {
			// Return the domain SID portion (all parts before the last hyphen)
			sidParts := strings.Split(subKey, "-")
			if len(sidParts) > 3 {
				domainSID := strings.Join(sidParts[:len(sidParts)-1], "-")
				return domainSID
			}
		}
	}

	return ""
}

func getGcpDomain() string {
	key, err := registry.OpenKey(registry.LOCAL_MACHINE, `SOFTWARE\Google\GCPW\Users`, registry.ENUMERATE_SUB_KEYS)
	if err != nil {
		return ""
	}
	defer key.Close()

	subkeys, err := key.ReadSubKeyNames(-1)
	if err != nil {
		return ""
	}

	if len(subkeys) == 0 {
		return ""
	}

	joinInfoKey, err := registry.OpenKey(key, subkeys[0], registry.QUERY_VALUE)
	if err != nil {
		fmt.Printf("Error opening join info key: %v\n", err)
		return ""
	}
	defer joinInfoKey.Close()

	email, _, err := joinInfoKey.GetStringValue("email")
	if err != nil {
		fmt.Printf("Error reading email value: %v\n", err)
		return ""
	}

	domain := strings.Split(email, "@")
	if len(domain) >= 2 {
		h := sha256.New()
		h.Write([]byte(domain[1]))
		hash := h.Sum(nil)
		return fmt.Sprintf("%x", hash)
	}

	return ""
}
