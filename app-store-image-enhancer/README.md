# App Store Image Enhancer

Image enhancement skill for app icons, screenshots, social images, and other assets that need cleaner resizing, sharpening, and contrast.

## When to Use

- Preparing iOS, macOS, or Google Play store icons
- Upscaling or sharpening marketing screenshots
- Cleaning up compressed PNG, JPG, JPEG, or WebP files
- Batch-enhancing an image directory while preserving originals

## Folder Contents

- `SKILL.md` - Skill trigger metadata, workflow, Pillow implementation, usage examples, and store asset requirements.
- `commands/app-store-image-enhancer-command.md` - Slash command wrapper for `/enhance-image`.

## Requirements

- Python 3
- Pillow

```bash
python3 -m pip install Pillow
```

## Usage

```text
/enhance-image ./assets/icon.png app-icon
/enhance-image ./screenshots screenshot
/enhance-image ./logo.jpg general
```

Use `app-icon` for 1024x1024 store icons, `screenshot` for docs or marketing screenshots, and `general` for balanced cleanup.
