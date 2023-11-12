Add-Type -Assembly System.Windows.Forms
[System.Windows.Forms.MessageBox]::Show("Your PC is vulnerable for PowerShell attack", "Warning", "OK", "Warning", 256).ToString()
