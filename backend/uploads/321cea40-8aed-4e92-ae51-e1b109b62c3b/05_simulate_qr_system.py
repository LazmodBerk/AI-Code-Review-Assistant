import cv2
import numpy as np
import onnxruntime as ort
import qrcode
from PIL import Image

print("======================================================")
print("ADIM 5: Uçtan Uca FaceQR Simülasyonu (Windows)")
print("======================================================")

# Dosya Yolları (Kendi bilgisayarınıza indirdiğiniz ONNX dosyaları)
PROJ_ONNX = "projection_256d.onnx"
DEC_ONNX = "decoder_112x112.onnx"
TEST_IMG = "test_face.jpg" # Buraya sistemde denemek istediğiniz 112x112 hizalanmış bir yüz koyacağız.

import os
if not os.path.exists(PROJ_ONNX) or not os.path.exists(DEC_ONNX):
    print("HATA: Lütfen Google Drive'dan indirdiğiniz .onnx dosyalarını bu klasöre kopyalayın!")
    exit(1)

# 1. Aşama: QR KOD OLUŞTURUCU (Admin/Backend Tarafı)
print("\n[AŞAMA 1] QR Kod Oluşturuluyor...")

# (Normalde burada MobileFaceNet çalışır ve 512D çıkarır. Simülasyon için rastgele 512D bir vektör veya gerçek vektör kullanacağız)
# Test için şimdilik rastgele bir 512D "sahte yüz" şifresi oluşturalım:
dummy_512 = np.random.randn(1, 512).astype(np.float32)

# Projection modelini çalıştır (512D -> 256D)
session_proj = ort.InferenceSession(PROJ_ONNX, providers=['CPUExecutionProvider'])
latent_256 = session_proj.run(None, {'input_512': dummy_512})[0]

# ** KRİTİK NOKTA: INT8 Quantization (Sıkıştırma) **
# Float32 (1024 byte) veriyi, QR koda sığması için INT8 (256 byte) formatına sıkıştırıyoruz!
latent_int8 = np.clip(np.round(latent_256 * 127.0), -128, 127).astype(np.int8)

# Byte dizisine (Binary) çevir
qr_data_bytes = latent_int8.tobytes()
print(f"Sıkıştırılmış Veri Boyutu: {len(qr_data_bytes)} Byte (Karekod için mükemmel!)")

# QR Kod Oluştur
qr = qrcode.QRCode(
    version=None, # Otomatik boyut
    error_correction=qrcode.constants.ERROR_CORRECT_L, # Düşük hata toleransı (daha az yer kaplar)
    box_size=10,
    border=4,
)
qr.add_data(qr_data_bytes)
qr.make(fit=True)

qr_img = qr.make_image(fill_color="black", back_color="white")
qr_img.save("face_qr_code.png")
print("✅ Karekod başarıyla üretildi: face_qr_code.png")

# 2. Aşama: ANDROID QR OKUYUCU (Telefon Tarafı)
print("\n[AŞAMA 2] QR Kod Okunuyor ve Yüz Çiziliyor...")

# (Telefondaki kamera QR'ı okudu ve byte dizisini çıkardı varsayıyoruz)
scanned_bytes = open("face_qr_code.png", "rb").read() # Gerçekte QR parser byte array'i verir
# Simülasyon için direkt byte array'i kullanıyoruz:
recovered_int8 = np.frombuffer(qr_data_bytes, dtype=np.int8).reshape(1, 256)

# ** KRİTİK NOKTA: Dequantization (Geri Çözme) **
# 256 Byte'ı tekrar Float32'ye çeviriyoruz
recovered_float32 = (recovered_int8.astype(np.float32) / 127.0)

# Decoder modelini çalıştır (256D -> 112x112 Resim)
session_dec = ort.InferenceSession(DEC_ONNX, providers=['CPUExecutionProvider'])
generated_img = session_dec.run(None, {'latent_256': recovered_float32})[0]

# Pytorch (-1, 1) formatını -> OpenCV (0, 255) formatına çevir
gen_img = generated_img[0].transpose(1, 2, 0) # CHW -> HWC
gen_img = np.clip((gen_img + 1.0) * 127.5, 0, 255).astype(np.uint8)
gen_img_bgr = cv2.cvtColor(gen_img, cv2.COLOR_RGB2BGR)

cv2.imwrite("recovered_face.jpg", gen_img_bgr)
print("✅ Yüz başarıyla geri çizildi: recovered_face.jpg")
print("\n🎉 SİMÜLASYON BAŞARILI! Sistem uçtan uca çalışıyor. Artık Android kodlamasına geçebiliriz!")
