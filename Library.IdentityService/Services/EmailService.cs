using System.Net;
using System.Net.Mail;

namespace Library.IdentityService.Services
{
    public class EmailService:IEmailService
    {
        private readonly IConfiguration _config;

        public EmailService(IConfiguration config)
        {
            _config = config;
        }

        public async Task SendEmailAsync(string toEmail, string subject, string body)
        {
            var emailFrom = _config["EmailSettings:From"];
            var password = _config["EmailSettings:Password"];
            var host = _config["EmailSettings:Host"];
            var port = int.Parse(_config["EmailSettings:Port"]);

            var client = new SmtpClient(host, port)
            {
                Credentials = new NetworkCredential(emailFrom, password),
                EnableSsl = true
            };

            var mailMessage = new MailMessage(emailFrom, toEmail, subject, body)
            {
                IsBodyHtml = true
            };

            await client.SendMailAsync(mailMessage);
        }
    }
}
