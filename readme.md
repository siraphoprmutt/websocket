# QR Code Login

## 1

- ถ้าใช้งานด้วย domain เปลี่ยน CLIENT_URL ใน .env เป็น domain ใช้งาน

```bash
# เริ่มใช้งาน
# ติดตั้ง Package node_modules
cd app
npm install

# สร้างและรันคอนเทนเนอร์ใหม่ในโหมดพื้นหลัง
docker compose up --build -d

# ยกเลิกใช้งาน ลบคอนเทนเนอร์และโวลุ่มทั้งหมด และ สร้างและรันคอนเทนเนอร์ใหม่ในโหมดพื้นหลัง
docker compose down -v --rmi all && docker compose up --build -d
```

## 2

- [Open Web](http://localhost/)

```bash
# ตัวอย่างทดสอบ http://localhost/
```

- Copy Session ID แทนที session-id ขั้นตอนถัดไป
- [Open Verify Session ID](http://localhost/api/verify/session-id)

```bash
# ตัวอย่างทดสอบ http://localhost/api/verify/session-id
```

- กลับไปที่ [Open Web](http://localhost/)

# 3

- ตัวอย่างการใช้งาน cloudflared tunnel เพื่อทำ public url สำหรับบน Windows

```bash
# ติดตั้งก่อน winget
winget install -e --id Cloudflare.cloudflared

# พิมพ์ cloudflared -v ดูว่าติดตั้งสำเร็จหรือไม่
$ cloudflared -v
cloudflared version 2025.1.0 (built 2025-01-07-1218 UTC)

# พิมพ์ cloudflared tunnel --url https://localhost:443 --protocol http2 เพื่อเปิด https://localhost
# หรือ cloudflared tunnel --url http://localhost เพื่อเปิด http://localhost
$ cloudflared tunnel --url https://localhost:443 --protocol http2

2025-03-20T07:22:26Z INF Thank you for trying Cloudflare Tunnel. Doing so, without a Cloudflare account, is a quick way to experiment and try it out. However, be aware that these account-less Tunnels have no uptime guarantee, are subject to the Cloudflare Online Services Terms of Use (https://www.cloudflare.com/website-terms/), and Cloudflare reserves the right to investigate your use of Tunnels for violations of such terms. If you intend to use Tunnels in production you should use a pre-created named tunnel by following: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps
2025-03-20T07:22:26Z INF Requesting new quick Tunnel on trycloudflare.com...
2025-03-20T07:22:32Z INF +--------------------------------------------------------------------------------------------+
2025-03-20T07:22:32Z INF |  Your quick Tunnel has been created! Visit it at (it may take some time to be reachable):  |
2025-03-20T07:22:32Z INF |  https://preferences-completion-prevent-fred.trycloudflare.com                             |
2025-03-20T07:22:32Z INF +--------------------------------------------------------------------------------------------+
2025-03-20T07:22:32Z INF Cannot determine default configuration path. No file [config.yml config.yaml] in [~/.cloudflared ~/.cloudflare-warp ~/cloudflare-warp]
2025-03-20T07:22:32Z INF Version 2025.1.0 (Checksum f1ea0be7b442593b62656a371110a218bf42e0fe63338bc558744c7d84ef7826)
2025-03-20T07:22:32Z INF GOOS: windows, GOVersion: go1.22.5-devel-cf, GoArch: amd64
2025-03-20T07:22:32Z INF Settings: map[ha-connections:1 p:http2 protocol:http2 url:https://localhost:443]
2025-03-20T07:22:32Z INF cloudflared will not automatically update on Windows systems.
2025-03-20T07:22:32Z INF Generated Connector ID: f61a86ea-56f4-48b7-bbe4-8f375a10f51a
2025-03-20T07:22:32Z INF Initial protocol http2
2025-03-20T07:22:32Z INF ICMP proxy will use 203.158.242.220 as source for IPv4
2025-03-20T07:22:32Z INF ICMP proxy will use fe80::5e7c:6028:f63d:8153 in zone Ethernet as source for IPv6
2025-03-20T07:22:32Z INF cloudflared does not support loading the system root certificate pool on Windows. Please use --origin-ca-pool <PATH> to specify the path to the certificate pool
2025-03-20T07:22:32Z INF ICMP proxy will use 203.158.242.220 as source for IPv4
2025-03-20T07:22:32Z INF ICMP proxy will use fe80::5e7c:6028:f63d:8153 in zone Ethernet as source for IPv6
2025-03-20T07:22:32Z INF Starting metrics server on 127.0.0.1:20241/metrics
2025-03-20T07:22:33Z INF Registered tunnel connection connIndex=0 connection=483efe57-8633-4690-83d4-23d558d414e2 event=0 ip=198.41.200.13 location=sin02 protocol=http2
```
