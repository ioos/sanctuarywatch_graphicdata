# Graphic Data <img align="right" width="150" alt="Graphic Data logo" height="150" src="https://github.com/user-attachments/assets/c999e108-7d2c-40f8-90a5-574c0e1446cc">

Graphic Data is an open-source WordPress framework designed to seamlessly combine artwork, structured content, and data-driven storytelling.  
It includes a **WordPress theme** and **WordPress plugin** that together create an accessible, visually rich interface for organizations that need powerful communication tools without requiring large development teams.

---

# 📌 Table of Contents
- [Overview](#overview)
- [What Is Graphic Data?](#what-is-graphic-data)
- [Where Is It Used?](#where-is-it-used)
- [Documentation](#documentation)
- [Installation Guide](#installation-guide)
  - [1. System Requirements](#1-system-requirements)
  - [2. Install WordPress](#2-install-wordpress)
  - [3. Clone the Repository](#3-clone-the-repository)
  - [4. Add the Theme and Plugin to WordPress](#4-add-the-theme-and-plugin-to-wordpress)
  - [5. Activate Theme and Plugin](#5-activate-theme-and-plugin)
  - [6. Validate the Setup](#6-validate-the-setup)
- [Directory Structure](#directory-structure)
- [Contributing](#contributing)
- [Earlier Work](#earlier-work)
- [Questions](#questions)
- [License](#license)

---

# 📖 Overview

This repository contains:

- **Graphic Data WordPress Plugin**  
- **Graphic Data WordPress Theme**  

Together, they deliver a specialized environment for building **interactive condition reports**, **data visualizations**, and **structured content pages** inside WordPress.

---

# 🧩 What Is Graphic Data?

Graphic Data is a flexible, user-friendly system built to:

- Present structured information as clear, attractive graphics  
- Combine artwork, layouts, and real-world data  
- Make updates easy for content editors with no technical background  
- Maintain visual consistency across pages  
- Empower small teams with a high-quality website framework  

This framework is ideal for organizations with “big website ambitions” but limited development capacity.

---

# 🌊 Where Is It Used?

Graphic Data currently powers **Sanctuary Watch**, a public-facing platform that displays environmental, cultural, and conservation information related to U.S. National Marine Sanctuaries:

👉 https://sanctuarywatch.ioos.us/american-samoa/overview/

Learn more about the National Marine Sanctuary System here:

👉 https://sanctuaries.noaa.gov/

---

# 📘 Documentation

Full usage documentation is available at:

👉 **https://ioos.github.io/sanctuarywatch_graphicdata/**

This guide explains how to create pages, use the custom blocks, and build full condition reports.

---

# 🚀 Installation Guide

The following steps describe how to install and run Graphic Data locally.

---

## **1. System Requirements**

Choose one of the two installation approaches:

### ✔ Recommended: **LocalWP**
- Fastest and easiest WordPress setup  
- Free download: https://localwp.com/

### ✔ Manual Installation (Advanced)
Requires:
- PHP 7.4+
- MySQL or MariaDB
- Apache or Nginx
- Composer (optional)
- Ability to modify `wp-content/`

---

## **2. Install WordPress**

### ⭐ Using LocalWP (Beginner-Friendly)

1. Install LocalWP  
2. Click **“Create New Site”**  
3. Enter a site name (e.g., `sanctuary`)  
4. Select **Preferred** environment  
5. Set your WordPress admin username & password  
6. Click **Add Site**  
7. Inside LocalWP → click **“Open Site Folder”**

This opens:

```
~/Local Sites/<your-site>/app/public/
```

Which contains:

```
wp-admin/
wp-content/
wp-includes/
index.php
```

---

### 🛠 Manual WordPress Installation (Linux Example)

```bash
sudo apt update
sudo apt install apache2 mysql-server php php-mysql php-xml php-mbstring php-curl unzip
```

Download WordPress:

```bash
wget https://wordpress.org/latest.zip
unzip latest.zip
sudo mv wordpress /var/www/html/
```

Configure Apache, MySQL, and visit:

```
http://localhost/wordpress
```

---

## **3. Clone the Repository**

```bash
git clone https://github.com/ioos/sanctuarywatch_graphicdata.git
cd sanctuarywatch_graphicdata
```

You will find:

```
plugins/graphic_data_plugin
themes/graphic_data_theme
```

---

## **4. Add the Theme and Plugin to WordPress**

### For LocalWP users:

```bash
cp -r themes/graphic_data_theme \
"~/Local Sites/<your-site>/app/public/wp-content/themes/"

cp -r plugins/graphic_data_plugin \
"~/Local Sites/<your-site>/app/public/wp-content/plugins/"
```

Replace `<your-site>` with your LocalWP folder name.

---

## **5. Activate Theme and Plugin**

Navigate to:

```
http://<your-site>.local/wp-admin
```

### Activate Theme:
**Appearance → Themes → Graphic Data Theme → Activate**

### Activate Plugin:
**Plugins → Graphic Data Plugin → Activate**

---

## **6. Validate the Setup**

Testing your environment:

1. Go to **Pages → Add New**  
2. Click the **( + ) Add Block** button  
3. Search for “Graphic Data” blocks  
4. Add a few blocks and publish  
5. View the page on the frontend  

If no intro text is displayed, configure it here:

```
Settings → Graphic Data Settings
```

Or set it manually:

```bash
wp option update graphic_data_settings '{"intro_text":"Welcome to Graphic Data"}' --format=json
```

---

# 📁 Directory Structure

```
sanctuarywatch_graphicdata/
│
├── plugins/
│   └── graphic_data_plugin/     # Custom Gutenberg blocks, CPTs, logic
│
├── themes/
│   └── graphic_data_theme/      # Front-end templates, rendering, layout
│
├── docs/                        # Full documentation site
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
├── LICENSE
└── readme.md
```

---

# 🤝 Contributing

We welcome contributions from the community, including:

- UI and UX improvements  
- New WordPress blocks  
- Documentation enhancements  
- Bug fixes and issue resolutions  
- Accessibility improvements  
- Performance and security updates  

Before contributing, please review:

👉 **CONTRIBUTING.md**  
👉 **CODE_OF_CONDUCT.md**

Pull Requests are appreciated and encouraged.

---

# 🛠 Earlier Work

Graphic Data builds on the foundation of:

- **Infographiq** by Ben Best  
  https://github.com/marinebon/infographiq

- **WordPress Plugin Boilerplate** by Joe Sz & Devin Vinson  
  https://github.com/DevinVinson/WordPress-Plugin-Boilerplate

These projects informed the architectural and design patterns used here.

---

# ❓ Questions?

For inquiries, please contact:

**Jai Ranganathan**  
jai.ranganathan@noaa.gov

---

# 📄 License

This project is licensed under the **MIT License**.  
See the [LICENSE](LICENSE.md) file for details.
