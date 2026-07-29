import os
import sys
import subprocess
import shutil
from pathlib import Path
import argparse
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, Dataset
from torchvision import transforms
import torchvision.models as models
from PIL import Image
from torch.optim.lr_scheduler import CosineAnnealingLR

# ONNX ve TFLite
import onnx
from onnx import helper, TensorProto, numpy_helper
import numpy as np
import tensorflow as tf

# ================= AYARLAR =================
DRIVE_PATH = '/content/drive/MyDrive/FaceQR_Modeller/'
CELEBA_DIR = Path('/content/celeba/img_align_celeba')
# ============================================

class PerceptualLoss(nn.Module):
    def __init__(self):
        super(PerceptualLoss, self).__init__()
        vgg = models.vgg16(pretrained=True).features
        self.blocks = nn.ModuleList([
            vgg[:4],    # relu1_2
            vgg[4:9],   # relu2_2
            vgg[9:16],  # relu3_3
            vgg[16:23]  # relu4_3
        ])
        for param in self.parameters():
            param.requires_grad = False
        self.register_buffer("mean", torch.tensor([0.485, 0.456, 0.406]).view(1, 3, 1, 1))
        self.register_buffer("std", torch.tensor([0.229, 0.224, 0.225]).view(1, 3, 1, 1))

    def forward(self, x, y):
        x = (x + 1.0) / 2.0
        y = (y + 1.0) / 2.0
        x = (x - self.mean) / self.std
        y = (y - self.mean) / self.std
        
        loss = 0.0
        for block in self.blocks:
            x = block(x)
            y = block(y)
            loss += torch.nn.functional.l1_loss(x, y)
        return loss

class ConvBlock(nn.Module):
    def __init__(self, in_c, out_c):
        super().__init__()
        self.block = nn.Sequential(
            nn.Conv2d(in_c, out_c, kernel_size=3, padding=1, bias=False),
            nn.BatchNorm2d(out_c),
            nn.GELU() 
        )
    def forward(self, x): return self.block(x)

class ADDRDecoderOptimized(nn.Module):
    def __init__(self):
        super().__init__()
        self.fc = nn.Linear(128, 512 * 7 * 7)
        self.bn_fc = nn.BatchNorm2d(512)
        
        self.up1 = nn.Sequential(nn.Upsample(scale_factor=2, mode='bilinear', align_corners=False), ConvBlock(512, 256))
        self.up2 = nn.Sequential(nn.Upsample(scale_factor=2, mode='bilinear', align_corners=False), ConvBlock(256, 128))
        self.up3 = nn.Sequential(nn.Upsample(scale_factor=2, mode='bilinear', align_corners=False), ConvBlock(128, 64))
        self.up4 = nn.Sequential(nn.Upsample(scale_factor=2, mode='bilinear', align_corners=False), ConvBlock(64, 32))
        
        self.out = nn.Sequential(
            nn.Conv2d(32, 3, kernel_size=3, padding=1),
            nn.Tanh()
        )

    def forward(self, x):
        x = self.fc(x).view(-1, 512, 7, 7)
        x = torch.nn.functional.gelu(self.bn_fc(x))
        x = self.up1(x)
        x = self.up2(x)
        x = self.up3(x)
        x = self.up4(x)
        return self.out(x)

class CelebADataset(Dataset):
    def __init__(self, img_dir, max_samples=None, transform=None):
        self.img_dir = img_dir
        all_imgs = [f for f in os.listdir(img_dir) if f.endswith('.jpg')]
        if max_samples is not None and max_samples > 0:
            self.img_names = all_imgs[:max_samples]
        else:
            self.img_names = all_imgs
        self.transform = transform
    def __len__(self): return len(self.img_names)
    def __getitem__(self, idx):
        return self.transform(Image.open(os.path.join(self.img_dir, self.img_names[idx])).convert('RGB'))

def setup_celeba():
    global CELEBA_DIR
    if CELEBA_DIR.exists():
        imgs = list(CELEBA_DIR.glob("*.jpg"))
        if len(imgs) > 40000:
            print(f"CelebA zaten mevcut: {len(imgs)} goruntu")
            return

    print("CelebA indiriliyor (kagglehub)...")
    subprocess.run([sys.executable, "-m", "pip", "install", "-q", "kagglehub"])
    import kagglehub
    path = kagglehub.dataset_download("jessicali9530/celeba-dataset")
    
    import glob
    jpgs = glob.glob(f"{path}/**/img_align_celeba/*.jpg", recursive=True)
    if jpgs:
        src = Path(jpgs[0]).parent
        CELEBA_DIR = src
        print(f"CelebA hazir (Cache uzerinden okutuluyor, 0 saniye): {len(list(CELEBA_DIR.glob('*.jpg')))} goruntu")
    else:
        print("HATA: CelebA zip icinden cikarilamadi!")

def quantize_dequantize(x):
    # 8-bit Quantization simülasyonu
    x_q = torch.round(x * 127.0).clamp(-128, 127)
    x_dq = x_q / 127.0
    return x_dq

def main():
    parser = argparse.ArgumentParser(description="Saf Decoder Egitimi (MobileFaceNet TFLite + ADDR Decoder)")
    parser.add_argument('--epochs', type=int, default=50, help='Toplam epoch sayisi')
    parser.add_argument('--batch-size', type=int, default=64, help='Batch size')
    parser.add_argument('--max-samples', type=int, default=100000, help='Kullanilacak goruntu sayisi')
    parser.add_argument('--start-epoch', type=int, default=0, help='Kalinan yerden devam etmek icin')
    args = parser.parse_args()

    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"Egitim Cihazi: {device}")
    
    os.makedirs(DRIVE_PATH, exist_ok=True)
    setup_celeba()

    # TFLite Modelini Yukle
    tflite_path = '/content/mobilefacenet_128D.tflite'
    if not os.path.exists(tflite_path):
        print(f"HATA: TFLite modeli bulunamadi: {tflite_path}")
        print("Lutfen Colab ana dizinine mobilefacenet_128D.tflite dosyasini yukleyin.")
        return

    interpreter = tf.lite.Interpreter(model_path=tflite_path)
    interpreter.allocate_tensors()
    input_details = interpreter.get_input_details()
    output_details = interpreter.get_output_details()
    input_shape = input_details[0]['shape']
    is_nhwc = (len(input_shape) == 4 and input_shape[3] == 3)

    decoder = ADDRDecoderOptimized().to(device)
    optimizer = optim.AdamW(decoder.parameters(), lr=2e-4, weight_decay=1e-4)
    scheduler = CosineAnnealingLR(optimizer, T_max=args.epochs)
    
    criterion_l1 = nn.L1Loss()
    criterion_p = PerceptualLoss().to(device)
    
    scaler = torch.cuda.amp.GradScaler()

    if args.start_epoch > 0:
        print(f"{args.start_epoch}. epoch'tan devam ediliyor...")
        decoder.load_state_dict(torch.load(f"{DRIVE_PATH}dec_epoch_{args.start_epoch}.pth"))

    transform = transforms.Compose([
        transforms.Lambda(lambda img: img.crop((29, 70, 151, 192))),
        transforms.Resize((112, 112)), 
        transforms.RandomHorizontalFlip(p=0.5),
        transforms.ColorJitter(brightness=0.1, contrast=0.1, saturation=0.1),
        transforms.ToTensor(), 
        transforms.Normalize((0.5, 0.5, 0.5), (0.5, 0.5, 0.5))
    ])
    
    dataset = CelebADataset(str(CELEBA_DIR), max_samples=args.max_samples, transform=transform)
    dataloader = DataLoader(dataset, batch_size=args.batch_size, shuffle=True, num_workers=2)

    print("Saf ADDR Egitimi Basliyor (MobileFaceNet TFLite 128D)...")
    for epoch in range(args.start_epoch, args.epochs):
        decoder.train()
        
        for i, imgs in enumerate(dataloader):
            imgs = imgs.to(device)
            imgs_np = imgs.cpu().numpy()
            
            # Encoder (TFLite) Islemi - Dondurulmus
            batch_embeddings = []
            for j in range(imgs_np.shape[0]):
                single_img = imgs_np[j:j+1]
                if is_nhwc:
                    single_img = np.transpose(single_img, (0, 2, 3, 1))
                interpreter.set_tensor(input_details[0]['index'], single_img)
                interpreter.invoke()
                emb = interpreter.get_tensor(output_details[0]['index'])[0]
                batch_embeddings.append(emb)
                
            batch_embeddings = np.array(batch_embeddings)
            embeddings_tensor = torch.tensor(batch_embeddings, dtype=torch.float32).to(device)
            
            with torch.autocast(device_type='cuda', dtype=torch.float16):
                # Android FaceEmbedder.kt Simulasyonu (L2 Normalization)
                embeddings_128 = torch.nn.functional.normalize(embeddings_tensor, p=2, dim=1)
                
                # Quantization (Yuvarlama)
                quantized = quantize_dequantize(embeddings_128)
                
                outputs = decoder(quantized)
                loss_l1 = criterion_l1(outputs, imgs)
                loss_p = criterion_p(outputs, imgs)
                loss = (loss_l1 * 10.0) + (loss_p * 0.1)
            
            optimizer.zero_grad()
            scaler.scale(loss).backward()
            scaler.step(optimizer)
            scaler.update()
            
            if i % 50 == 0:
                print(f"Epoch [{epoch+1}/{args.epochs}], Adim [{i}/{len(dataloader)}], Loss L1: {loss_l1.item():.4f}, Loss P: {loss_p.item():.4f}")
                
        scheduler.step()
                
        import torchvision
        with torch.no_grad():
            decoder.eval()
            n = min(imgs.size(0), 8)
            
            # Ornek cikarma
            batch_emb_sample = []
            sample_np = imgs[:n].cpu().numpy()
            for j in range(sample_np.shape[0]):
                s_img = sample_np[j:j+1]
                if is_nhwc:
                    s_img = np.transpose(s_img, (0, 2, 3, 1))
                interpreter.set_tensor(input_details[0]['index'], s_img)
                interpreter.invoke()
                batch_emb_sample.append(interpreter.get_tensor(output_details[0]['index'])[0])
                
            emb_n = torch.tensor(np.array(batch_emb_sample), dtype=torch.float32).to(device)
            emb_n = torch.nn.functional.normalize(emb_n, p=2, dim=1)
            q_n = quantize_dequantize(emb_n)
            
            out = decoder(q_n)
            comparison = torch.cat([imgs[:n], out])
            comparison = (comparison * 0.5) + 0.5 
            torchvision.utils.save_image(comparison.cpu(), f"{DRIVE_PATH}sample_epoch_{epoch+1}.png", nrow=n)
            print(f"--- Ornek Goruntuler Kaydedildi: sample_epoch_{epoch+1}.png ---")

        torch.save(decoder.state_dict(), f"{DRIVE_PATH}dec_epoch_{epoch+1}.pth")
        print(f"--- Epoch {epoch+1} Agirliklari Drive'a Kaydedildi! ---")

    print("Egitim Bitti! Decoder TFLite Uretiliyor...")
    decoder.eval()
    
    dec_onnx_path = f"{DRIVE_PATH}decoder_128D_v3.onnx"
    dummy_lat = torch.randn(1, 128).to(device)
    torch.onnx.export(decoder, dummy_lat, dec_onnx_path, input_names=['input'], output_names=['output'])
    
    subprocess.run([sys.executable, "-m", "pip", "install", "-q", "onnx2tf", "sng4onnx", "onnxsim"])
    import tempfile
    
    def convert_to_tflite(onnx_file, out_name):
        with tempfile.TemporaryDirectory() as tmpdir:
            cmd = [sys.executable, "-m", "onnx2tf", "-i", onnx_file, "-o", tmpdir, "-b", "1", "--non_verbose"]
            subprocess.run(cmd, capture_output=True)
            
            tflites = sorted(Path(tmpdir).rglob("*.tflite"), key=lambda f: f.stat().st_size)
            if tflites:
                fp32 = next((f for f in tflites if "float16" not in f.name), None) or tflites[0]
                tflite_out_path = f"{DRIVE_PATH}{out_name}"
                shutil.copy2(fp32, tflite_out_path)
                print(f"Standart TFLite Uretildi: {tflite_out_path}")
            else:
                print(f"HATA: {out_name} uretilemedi!")

    convert_to_tflite(dec_onnx_path, "decoder_128D_v3.tflite")
    
    print(f"TEBRIKLER! Tum Android TFLite dosyalari uretildi: {DRIVE_PATH}")

if __name__ == '__main__':
    main()
