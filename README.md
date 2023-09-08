# :bulb: Aplikasi Pengaduan Wali Murid

Repository ini berisi sistem pusat pelayanan pengaduan wali murid berbasis web

## :package: Prasyarat

Sebelum memulai, pastikan telah terinstall beberapa tools:
* MySQL atau MariaDB
* Node.js
* Text editor
* Web browser

## :cd: Menginstall Aplikasi

Untuk menginstall aplikasi ini, ikuti langkah berikut:

```bash
# clone this repository
git clone https://github.com/kunkoder/apic.git

# change working directory
cd apic

# install package
npm install
```

## :open_file_folder: Struktur Projek

```text
├── app
│   ├── middlewares
│   ├── models
│   ├── routes
│   ├── utils
│   ├── views
├── command
│   └── createuser.js
├── config
│   ├── database.js
│   ├── mail.js
│   ├── route.js
│   └── www.js
├── static
│   ├── css
│   ├── fonts
│   ├── html
│   ├── images
│   ├── js
│   ├── sass
│   └── uploads
├── .env
├── app.js
├── debug.log
├── package.json
└── visits.sqlite
```

>Note: jangan lupa ubah pengaturan database.

## :eyes: Preview

**Home**
![alt text](https://raw.githubusercontent.com/kunkoder/apic/master/static/images/preview-home.png)

**Register**
![alt text](https://raw.githubusercontent.com/kunkoder/apic/master/static/images/preview-register.png)

**Login**
![alt text](https://raw.githubusercontent.com/kunkoder/apic/master/static/images/preview-login.png)

**Form**
![alt text](https://raw.githubusercontent.com/kunkoder/apic/master/static/images/preview-form.png)

**List**
![alt text](https://raw.githubusercontent.com/kunkoder/apic/master/static/images/preview-list.png)

**Profile**
![alt text](https://raw.githubusercontent.com/kunkoder/apic/master/static/images/preview-profile.png)

## :balance_scale: Lisensi

[MIT License](https://github.com/kunkoder/apic/blob/main/LICENSE)
