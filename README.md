# Hindware 3D Bathroom Visualizer

An immersive 3D bathroom product visualization tool built as a **Frontend Developer**. Users can explore 5 uniquely themed bath spaces, customize products in real-time within a 3D environment, and browse product catalogs.

## ✨ Features

- **5 Themed Bathroom Rooms** — Lush Green, Contemporary, Neo-Classical, Palm Blossom, Modern Glam
- **Real-time 3D Visualization** — Powered by BabylonJS with interactive camera controls
- **Product Customization** — Swap products (showers, basins, faucets, etc.) directly in the 3D scene
- **Product Information** — View pricing, SKU, Amazon links, and YouTube demos
- **360° Auto-Rotate** — Immersive room exploration
- **Fullscreen Mode** — Distraction-free viewing
- **Social Sharing** — Share customized room configurations via link, Facebook, Twitter, or email
- **Store Finder** — Search nearby stores by pincode (demo data)
- **Help Overlay** — Interactive guide for first-time users
- **Responsive Design** — Works on desktop, tablet, and mobile

## 🛠 Tech Stack

| Technology                    | Purpose                           |
| ----------------------------- | --------------------------------- |
| **HTML5 / CSS3 / JavaScript** | Core frontend                     |
| **BabylonJS**                 | 3D rendering engine (WebGL)       |
| **Bootstrap 3/4**             | Responsive layout & components    |
| **jQuery**                    | DOM manipulation & AJAX           |
| **Slick Carousel**            | Product thumbnail slider          |
| **AOS (Animate On Scroll)**   | Scroll animations on home page    |
| **GLB/GLTF Models**           | 3D bathroom room & product models |

## 🚀 Getting Started

### Prerequisites

Any static file server (no build tools required).

### Run Locally

```bash
# Option 1: Using npx
npx http-server . -p 8080

# Option 2: Using Python
python -m http.server 8080

# Option 3: VS Code Live Server extension
# Right-click index.html → "Open with Live Server"
```

Then open [http://localhost:8080](http://localhost:8080) in your browser.

## 📁 Project Structure

```
├── index.html              # Landing page with 5 room previews
├── room.html               # 3D room visualizer page
├── assets/
│   ├── css/                # Stylesheets
│   ├── js/                 # JavaScript modules
│   │   ├── common.js       # API utilities & helpers
│   │   ├── visualizer_babylon.js  # BabylonJS 3D engine
│   │   ├── setup_room.js   # Room initialization & interactions
│   │   ├── custom_main.js  # Product category & selection logic
│   │   ├── main.js         # UI controls (fullscreen, sliders)
│   │   ├── helpOverlay.js  # Interactive help guide
│   │   ├── storefinder.js  # Store locator (demo data)
│   │   └── index_main.js   # Homepage navigation
│   ├── glb/                # 3D model files (GLB format)
│   ├── img/                # Images & icons
│   ├── tex/                # Texture files
│   └── json/               # Product & room configuration data
├── json/                   # Additional product categories
└── README.md
```

## Live Preview

[Hindware 3D BathSpace Studio](https://sohamgoswami07.github.io/Hindware-3D-BathSpace-Studio/)

## 📝 My Role

As a **Frontend Developer Intern**, I was responsible for:

- Building the interactive 3D product customization UI
- Implementing the product catalog with category/subcategory navigation
- Creating responsive layouts for desktop and mobile
- Integrating BabylonJS for real-time 3D visualization
- Developing the share functionality and store finder
- Building the animated landing page with AOS scroll effects

## 📄 License

All product data, 3D models, and brand assets belong to their respective owners. This repository is for portfolio demonstration purposes only.

