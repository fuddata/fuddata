package main

import (
	"fmt"

	"github.com/fatih/color"
	"github.com/fuddata/fuddata/go-modules/pkg/license"
)

const (
	company       = "Fuddata"
	application   = "Hello World"
	licenseApiUrl = "https://www.fuddata.com/api/license"
	licPubKey     = ``
)

const helloWorld = ` _   _      _ _        __        __         _     _
| | | | ___| | | ___   \ \      / /__  _ __| | __| |
| |_| |/ _ \ | |/ _ \   \ \ /\ / / _ \| '__| |/ _  |
|  _  |  __/ | | (_) |   \ V  V / (_) | |  | | (_| |
|_| |_|\___|_|_|\___/     \_/\_/ \___/|_|  |_|\__,_|

`

func main() {
	trialLeft, ordered, _, _, err := license.GetLicenseStatus(company, application, licenseApiUrl, licPubKey)
	if err != nil {
		color.Red("Error: %s", err)
		return
	}
	if trialLeft != -1 {
		if ordered {
			color.Cyan("License ordered, waiting for payment. You have %d days left in your trial period.", trialLeft)
		} else {
			color.Yellow("Warning: Unlicensed copy of application. You have %d days left in your trial period.", trialLeft)
		}
	} else {
		color.Green("Info: Licensed copy of application\r\n")
	}

	color.HiBlue(helloWorld)
	fmt.Printf("Press any key to close this window")
	fmt.Scanln()
}
