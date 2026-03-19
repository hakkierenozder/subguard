$npgsqlDll = "C:\Users\hakki\.nuget\packages\npgsql\6.0.11\lib\net6.0\Npgsql.dll"
Write-Host "Npgsql: $npgsqlDll"
Add-Type -Path $npgsqlDll

$connStr = "Host=localhost;Port=5432;Database=SubGuardDb;Username=postgres;Password=mysecretpassword;"
$conn = New-Object Npgsql.NpgsqlConnection($connStr)
$conn.Open()
Write-Host "Baglandi."

# Kolon var mi?
$checkCmd = $conn.CreateCommand()
$checkCmd.CommandText = "SELECT COUNT(*) FROM information_schema.columns WHERE table_name='NotificationQueues' AND column_name='Type';"
$exists = [int]$checkCmd.ExecuteScalar()

if ($exists -eq 0) {
    $alterCmd = $conn.CreateCommand()
    $alterCmd.CommandText = 'ALTER TABLE "NotificationQueues" ADD COLUMN "Type" integer NOT NULL DEFAULT 1;'
    $alterCmd.ExecuteNonQuery() | Out-Null
    Write-Host "Kolon eklendi: Type"
} else {
    Write-Host "Kolon zaten mevcut, atlanıyor"
}

# Migration history'e ekle
$histCmd = $conn.CreateCommand()
$histCmd.CommandText = "SELECT COUNT(*) FROM ""__EFMigrationsHistory"" WHERE ""MigrationId"" = '20260318000001_AddNotificationTypeField';"
$histExists = [int]$histCmd.ExecuteScalar()

if ($histExists -eq 0) {
    $insertCmd = $conn.CreateCommand()
    $insertCmd.CommandText = "INSERT INTO ""__EFMigrationsHistory"" (""MigrationId"", ""ProductVersion"") VALUES ('20260318000001_AddNotificationTypeField', '7.0.0');"
    $insertCmd.ExecuteNonQuery() | Out-Null
    Write-Host "Migration history'e eklendi"
} else {
    Write-Host "Migration zaten history'de"
}

$conn.Close()
Write-Host "Tamamlandi!"
