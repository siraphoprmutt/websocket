# 🐳 ใช้ Node.js เวอร์ชัน 22 (Alpine เป็นเวอร์ชันที่เบา)
FROM node:22-alpine

# 🔧 ตั้งค่า Working Directory ภายใน Container
WORKDIR /usr/src/app

# 📝 คัดลอกไฟล์ package.json และ package-lock.json เพื่อให้ Docker Cache ใช้งานได้
COPY package*.json ./

# 📦 ติดตั้ง Dependencies เฉพาะ Production เพื่อลดขนาด Image
RUN npm install --only=production

# 🚀 คัดลอกโค้ดทั้งหมดไปยัง Container (ยกเว้นไฟล์ที่ถูก Ignore)
COPY . .

# 🎯 เปิดพอร์ต 3000 เพื่อรองรับการรับส่งข้อมูล
EXPOSE 3000

# 🔄 Watch Mode สำหรับการพัฒนา (ปลดคอมเมนต์เพื่อใช้ nodemon)
RUN npm install --only=development
CMD ["npx", "nodemon", "server.js"]

# 🚀 คำสั่งเริ่มต้นของ Container (โหมด Production)
#CMD ["node", "server.js"]
