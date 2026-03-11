namespace SubGuard.Service.Services
{
    public static class EmailTemplates
    {
        public static string PaymentReminder(string userName, string subscriptionName, decimal price, string currency, int daysUntil)
        {
            var daysText = daysUntil == 0 ? "bugün" : $"{daysUntil} gün sonra";

            return $@"
<!DOCTYPE html>
<html lang=""tr"">
<head>
  <meta charset=""UTF-8"">
  <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
  <title>Ödeme Hatırlatması</title>
</head>
<body style=""margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;"">
  <table width=""100%"" cellpadding=""0"" cellspacing=""0"">
    <tr>
      <td align=""center"" style=""padding:40px 0;"">
        <table width=""600"" cellpadding=""0"" cellspacing=""0"" style=""background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);"">

          <!-- Header -->
          <tr>
            <td style=""background:#6C63FF;padding:30px 40px;text-align:center;"">
              <h1 style=""color:#ffffff;margin:0;font-size:24px;letter-spacing:1px;"">SubGuard</h1>
              <p style=""color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px;"">Abonelik Yöneticisi</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style=""padding:40px;"">
              <p style=""color:#333;font-size:16px;margin:0 0 20px;"">Merhaba <strong>{userName}</strong>,</p>
              <p style=""color:#555;font-size:15px;line-height:1.6;margin:0 0 24px;"">
                <strong>{subscriptionName}</strong> aboneliğinizin ödemesi <strong>{daysText}</strong> gerçekleşecek.
              </p>

              <!-- Amount Box -->
              <table width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""background:#f8f7ff;border-left:4px solid #6C63FF;border-radius:4px;margin-bottom:32px;"">
                <tr>
                  <td style=""padding:20px 24px;"">
                    <p style=""margin:0;color:#888;font-size:13px;text-transform:uppercase;letter-spacing:1px;"">Ödenecek Tutar</p>
                    <p style=""margin:6px 0 0;color:#6C63FF;font-size:28px;font-weight:bold;"">{price:F2} {currency}</p>
                  </td>
                </tr>
              </table>

              <p style=""color:#777;font-size:13px;margin:0;"">
                Aboneliklerinizi SubGuard uygulaması üzerinden yönetebilirsiniz.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style=""background:#f9f9f9;padding:20px 40px;text-align:center;border-top:1px solid #eee;"">
              <p style=""color:#aaa;font-size:12px;margin:0;"">Bu e-posta SubGuard tarafından otomatik olarak gönderilmiştir.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>";
        }
    }
}
