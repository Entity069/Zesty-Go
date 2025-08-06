package utils

import (
	"bytes"
	"fmt"
	"html/template"
	"net/smtp"

	"github.com/Entity069/Zesty-Go/pkg/config"
)

func SendEmail(to, subject, templatePath string, data interface{}) error {
	tmpl, err := template.ParseFiles(templatePath)
	if err != nil {
		return fmt.Errorf("parsing template failed: %w", err)
	}

	var body bytes.Buffer
	if err := tmpl.Execute(&body, data); err != nil {
		return fmt.Errorf("executing template failed: %w", err)
	}

	emailCfg := config.LoadEmailConfig()
	auth := smtp.PlainAuth("", emailCfg.Address, emailCfg.Password, emailCfg.Host)

	headers := map[string]string{
		"From":         emailCfg.Address,
		"To":           to,
		"Subject":      subject,
		"MIME-Version": "1.0",
		"Content-Type": "text/html; charset=UTF-8",
	}

	var msg bytes.Buffer
	for k, v := range headers {
		msg.WriteString(fmt.Sprintf("%s: %s\r\n", k, v))
	}
	msg.WriteString("\r\n")
	msg.Write(body.Bytes())

	addr := fmt.Sprintf("%s:%s", emailCfg.Host, emailCfg.Port)
	if err := smtp.SendMail(addr, auth, emailCfg.Address, []string{to}, msg.Bytes()); err != nil {
		return fmt.Errorf("send mail failed: %w", err)
	}
	return nil
}
