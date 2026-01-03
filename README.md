# [mandelbrot-canvas](https://github.com/beenotung/mandelbrot-canvas)

**High-performance Mandelbrot Set explorer with WebGL acceleration**

Demo: https://mandelbrot-canvas.surge.sh

Wiki: https://en.wikipedia.org/wiki/Mandelbrot_set

## ✨ Features

### 🚀 Performance

- **Pixel-Level Parallelism**: Each screen pixel computed simultaneously by GPU cores
- **Massive Throughput**: 1920×1080 display = 2M+ parallel Mandelbrot calculations
- **GPU Power**: Modern GPUs have 1000-3000+ cores (e.g., RTX 3050: 2560 cores)
- **Real-time Rendering**: Smooth exploration of the Mandelbrot set
- **Hardware Scaling**: Performance scales with GPU capabilities

### 🎨 Visual Themes

Choose from 9 beautiful color schemes:

- **Red**: Classic red-to-yellow gradient
- **Purple**: Smooth vanilla purple tones
- **Blue**: Clear blue gradient phases
- **Green**: Fresh forest greens
- **Gold**: Warm golden sunset colors
- **Ocean**: Deep teal ocean blues
- **Rainbow**: Full spectrum colors
- **Fire**: Bright flame gradients
- **Mono**: Elegant greyscale

### 📱 Controls

#### Desktop Navigation

- **Mouse Wheel**: Zoom in/out
- **Click**: Center view on clicked point
- **Arrow Keys**: Precise panning
- **+/- Keys**: Zoom in/out

#### Mobile Support

- **Touch Zoom**: Pinch gestures (browser default)
- **Touch Tap**: Center view on tapped point
- **Mobile Controls**: Dedicated zoom and panel toggle buttons
- **Responsive UI**: Optimized for touch devices

#### Keyboard Shortcuts

- **Arrow Keys**: Pan view
- **+/-**: Zoom in/out
- **[ ]**: Halve/double iterations
- **Theme Selection**: Use arrow keys when dropdown is focused

### 🎛️ UI Features

- **Real-time Display**: Current offset, zoom level, and iteration count
- **Iteration Control**: Manual/auto-adjust modes with increment/decrement buttons
- **Panel Toggle**: Hide/show controls for immersive viewing
- **Settings Persistence**: Auto-save all preferences to localStorage
- **Center Lines**: Optional crosshairs for navigation reference

## 🛠️ Technology Stack

- **Rendering**: WebGL 2.0 with GLSL shaders
- **Language**: TypeScript for type safety
- **Build**: Snowpack for fast development
- **Architecture**: Modular design with clean separation of concerns

## 📊 Performance Comparison

| Method            | Performance                     | Implementation      |
| ----------------- | ------------------------------- | ------------------- |
| Canvas 2D         | Sequential (1 core)             | Original version    |
| **WebGL Shaders** | **Parallel (1000-3000+ cores)** | **Current version** |

**WebGL provides 1000-3000x performance improvement through massive GPU parallelism!**

## 🏗️ Project Structure

```
src/
├── main.ts      # Application entry point & event handling
├── webgl.ts     # WebGL context, shaders, and rendering pipeline
├── ui.ts        # DOM manipulation and user interface
├── storage.ts   # State management and persistence
├── cli.ts       # Console debugging functions
└── index.html   # Main HTML structure
```

## 🎮 Console Functions

For development and debugging, these functions are available in browser console:

- `restart()` - Reset view to default position
- `clear()` - Reset all settings to defaults
- `setMaxI(number)` - Set maximum iterations
- `setLine(boolean)` - Toggle center crosshairs
- `setColor(number)` - Set color theme (0-8)
- `save()` - Save current state to localStorage
- `load()` - Load saved state from localStorage
- `getState()` - Get current state object
- `render()` - Force re-render (for debugging)

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

## 📝 Development Notes

- **WebGL Context**: Requires WebGL-capable browser
- **Extensions**: Uses OES_vertex_array_object for modern VAO support
- **Mobile**: Touch events handled by browser, custom mobile controls provided
- **Performance**: GPU acceleration scales with hardware capabilities

---

**Explore the infinite beauty of the Mandelbrot set with GPU-powered performance!** 🌌✨
