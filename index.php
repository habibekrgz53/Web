<?php
$servername = "localhost";
$username = "root";
$password = ""; // XAMPP'de varsayılan şifre yok, boş bırakabilirsin
$dbname = "veritabani_adi"; // Veritabanı adını buraya yaz

// Bağlantı oluşturuluyor
$conn = new mysqli($servername, $username, $password, $dbname);

// Bağlantı kontrolü
if ($conn->connect_error) {
  die("Bağlantı hatası: " . $conn->connect_error);
}
echo "Bağlantı başarılı!";
?>
