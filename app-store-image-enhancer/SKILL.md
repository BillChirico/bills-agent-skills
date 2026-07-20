---
name: app-store-image-enhancer
description: Enhance image resolution, sharpness, and clarity with Python and Pillow. Use for iOS marketing icons, Google Play icons, screenshots, social media images, upscaling, or sharpening while preserving the original file.
---

# App Store Image Enhancer

Enhance images to be sharper, clearer, and more professional using Python's Pillow library.

## When to Use This Skill

- Preparing iOS App Store marketing icons (1024×1024 PNG, no alpha)
- Preparing Google Play store icons (512×512 32-bit PNG with alpha)
- Improving screenshot quality for documentation or marketing
- Enhancing images for social media posts
- Upscaling low-resolution images
- Sharpening blurry photos
- Cleaning up compression artifacts

## Implementation

### Required Setup

```bash
python3 -m venv .venv
source .venv/bin/activate
python3 -m pip install Pillow
```

### Core Enhancement Script

```python
from PIL import Image, ImageEnhance, ImageFilter
import os

def enhance_image(
    input_path: str,
    output_path: str = None,
    target_size: tuple = None,
    sharpen_factor: float = 1.5,
    contrast_factor: float = 1.1,
    mode: str = "general"
) -> str:
    """
    Enhance an image with sharpening, contrast adjustment, and optional resizing.

    Args:
        input_path: Path to the source image
        output_path: Path for enhanced image (default: adds '-enhanced' suffix)
        target_size: Tuple of (width, height) for resizing, or None to preserve
        sharpen_factor: Sharpness multiplier (1.0 = original, >1.0 = sharper)
        contrast_factor: Contrast multiplier (1.0 = original, >1.0 = more contrast)
        mode: "app-icon", "screenshot", or "general"

    Returns:
        Path to the enhanced image
    """
    if mode not in {"app-icon", "screenshot", "general"}:
        raise ValueError(f"Unsupported mode: {mode}")
    if not os.path.isfile(input_path):
        raise FileNotFoundError(f"Image not found: {input_path}")
    if target_size and any(dimension <= 0 for dimension in target_size):
        raise ValueError("target_size dimensions must be positive")

    # Open and convert to RGBA while processing.
    img = Image.open(input_path)

    if img.mode != 'RGBA':
        img = img.convert('RGBA')

    # Apply mode-specific settings
    if mode == "app-icon":
        target_size = (1024, 1024)
        sharpen_factor = 1.8
        contrast_factor = 1.15
    elif mode == "screenshot":
        sharpen_factor = 1.4
        contrast_factor = 1.05

    # Resize if target size specified (use LANCZOS for quality)
    if target_size:
        img = img.resize(target_size, Image.Resampling.LANCZOS)

    # Apply unsharp mask for edge enhancement
    img = img.filter(ImageFilter.UnsharpMask(radius=2, percent=150, threshold=3))

    # Enhance sharpness
    sharpener = ImageEnhance.Sharpness(img)
    img = sharpener.enhance(sharpen_factor)

    # Enhance contrast
    contraster = ImageEnhance.Contrast(img)
    img = contraster.enhance(contrast_factor)

    # Generate output path if not provided
    if not output_path:
        base, ext = os.path.splitext(input_path)
        output_path = f"{base}-enhanced.png"

    # Apple's marketing icon must be opaque. Flatten transparency before saving.
    if mode == "app-icon":
        background = Image.new('RGB', img.size, (255, 255, 255))
        background.paste(img, mask=img.getchannel('A'))
        img = background

    # Save as PNG for quality; flatten alpha for JPG output.
    if output_path.lower().endswith('.png'):
        img.save(output_path, 'PNG', optimize=True)
    else:
        # For JPG output, convert to RGB
        if img.mode == 'RGBA':
            background = Image.new('RGB', img.size, (255, 255, 255))
            background.paste(img, mask=img.split()[3])
            img = background
        img.save(output_path, quality=95, optimize=True)

    return output_path


def analyze_image(input_path: str) -> dict:
    """
    Analyze image quality metrics.

    Args:
        input_path: Path to the image

    Returns:
        Dictionary with image analysis results
    """
    img = Image.open(input_path)

    has_transparency = img.mode in ('RGBA', 'LA') or (
        img.mode == 'P' and 'transparency' in img.info
    )

    return {
        "path": input_path,
        "format": img.format,
        "mode": img.mode,
        "size": img.size,
        "width": img.size[0],
        "height": img.size[1],
        "is_square": img.size[0] == img.size[1],
        "has_transparency": has_transparency,
        "file_size_kb": os.path.getsize(input_path) / 1024,
        "meets_ios_marketing_icon_spec": (
            img.size == (1024, 1024)
            and img.format == 'PNG'
            and not has_transparency
        )
    }


def batch_enhance(
    directory: str,
    output_dir: str = None,
    extensions: tuple = ('.png', '.jpg', '.jpeg', '.webp'),
    **enhance_kwargs
) -> list:
    """
    Enhance all images in a directory.

    Args:
        directory: Source directory path
        output_dir: Output directory (default: same as source with '-enhanced' suffix)
        extensions: Tuple of file extensions to process
        **enhance_kwargs: Arguments passed to enhance_image()

    Returns:
        List of output file paths
    """
    if not output_dir:
        output_dir = f"{directory.rstrip('/')}-enhanced"

    os.makedirs(output_dir, exist_ok=True)

    results = []
    for filename in os.listdir(directory):
        if filename.lower().endswith(extensions):
            input_path = os.path.join(directory, filename)
            base, _ = os.path.splitext(filename)
            output_path = os.path.join(output_dir, f"{base}-enhanced.png")

            enhance_image(input_path, output_path, **enhance_kwargs)
            results.append(output_path)

    return results
```

## Usage Examples

### App Store Icon Enhancement

```python
# Enhance for app store (auto-resizes to 1024x1024)
result = enhance_image("my-icon.png", mode="app-icon")
print(f"Enhanced icon saved to: {result}")
```

### Screenshot Enhancement

```python
# Enhance screenshot without resizing
result = enhance_image("screenshot.png", mode="screenshot")
```

### Custom Enhancement

```python
# Custom settings
result = enhance_image(
    "photo.jpg",
    target_size=(2048, 2048),
    sharpen_factor=2.0,
    contrast_factor=1.2
)
```

### Batch Processing

```python
# Enhance all images in a folder
enhanced_files = batch_enhance("./images", mode="screenshot")
print(f"Enhanced {len(enhanced_files)} images")
```

## App Store Icon Requirements

| Platform        | Size      | Format | Notes                                               |
| --------------- | --------- | ------ | --------------------------------------------------- |
| iOS App Store   | 1024×1024 | PNG    | No transparency, no rounded corners (iOS adds them) |
| Google Play     | 512×512   | PNG    | 32-bit PNG with alpha, maximum 1,024 KB             |
| macOS App Store | 1024×1024 | PNG    | Can have transparency                               |

**Important**: iOS App Store icons should NOT have transparency—use a solid background. The system applies the rounded corners automatically.

## Output Specifications

When `mode="app-icon"` (the iOS marketing-icon preset):

- Size: 1024×1024 pixels
- Format: PNG
- Sharpness: Enhanced (1.8x)
- Contrast: Slightly boosted (1.15x)
- Optimized file size
- Alpha flattened onto an opaque white background

## Tips

- Always preserve originals (the script creates new files by default)
- Use `mode="app-icon"` for the iOS marketing icon; set `target_size=(512, 512)` separately for Google Play
- Use `mode="screenshot"` for documentation images
- For social media, consider platform-specific sizes after enhancement
- JPG output is supported but PNG is preferred for icons

Current source specifications: [Apple app icon help](https://developer.apple.com/help/app-store-connect/manage-app-information/add-an-app-icon), [Apple screenshot specifications](https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications/), and [Google Play preview asset requirements](https://support.google.com/googleplay/android-developer/answer/9866151).
