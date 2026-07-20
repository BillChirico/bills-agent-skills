# App Store Submission Guidelines

Quick reference for Apple App Store and Google Play submissions. Last verified July 19, 2026; store consoles remain the final authority.

## Text Metadata

| Field          | Apple                      | Google                     |
| -------------- | -------------------------- | -------------------------- |
| App Name       | 30 characters              | 30 characters              |
| Subtitle/Short | 30 characters              | 80 characters              |
| Description    | 4,000 characters           | 4,000 characters           |
| Keywords       | 100-character field        | Extracted from listing copy |

## Apple App Store

### Text Fields

- **App Name (30):** Accurate product name; include a useful search term only when it reads naturally.
- **Subtitle (30):** Concise value proposition.
- **Promotional Text (170):** Can be updated without a new app version.
- **Description (4,000):** Lead with the current product value and capabilities.
- **Keywords (100):** Comma-separated terms. Omit spaces after commas, but spaces are allowed inside phrases such as `Real Estate`.

### Keyword Rules

- Avoid duplicating words already covered by the app name, subtitle, or category.
- Use relevant terms and phrases that describe real functionality.
- Do not use competitor names, unauthorized trademarks, irrelevant terms, or keyword stuffing.
- Promotional text is not indexed for search.

### Screenshots

Upload one to ten screenshots per supported device family. JPEG, JPG, and PNG are accepted; screenshots cannot contain alpha or transparency.

| Device       | Accepted portrait sizes                         | Requirement |
| ------------ | ----------------------------------------------- | ----------- |
| iPhone 6.9"  | 1260×2736, 1290×2796, or 1320×2868             | Required for iPhone apps |
| iPhone 6.5"  | 1242×2688 or 1284×2778                         | Used when 6.9" screenshots are absent |
| iPad 13"     | 2048×2732 or 2064×2752                         | Required when the app runs on iPad |

Landscape uses the corresponding reversed dimensions. Check Apple's full specification for older devices and other platforms.

### App Preview Video

- Duration: 15–30 seconds.
- Use an accepted H.264 `.mov`, `.m4v`, or `.mp4` profile and resolution for the target device.
- Show the app itself; avoid hands or external device footage.
- Verify the current codec, frame-rate, and audio requirements before export.

### Required Submission Material

- App icon supplied through the Xcode asset catalog; the marketing icon is 1024×1024 and opaque.
- Privacy Policy URL for iOS and macOS apps.
- Support URL and accurate review contact/instructions.
- Completed privacy, age-rating, content-rights, and any applicable regulated-medical-device declarations.

## Google Play

### Text Fields

- **App Name (30):** Accurate product name.
- **Short Description (80):** Plain-language synopsis of the core value.
- **Full Description (4,000):** Current capabilities and relevant search language.

Google does not provide a separate keyword field. Write naturally; unnecessary repetition and keyword spam do not improve ranking and can create policy problems.

### Graphics

| Asset             | Current requirement                                      | Required |
| ----------------- | -------------------------------------------------------- | -------- |
| App Icon          | 512×512, 32-bit PNG with alpha, maximum 1,024 KB         | Yes      |
| Feature Graphic   | 1024×500, JPEG or 24-bit PNG without alpha               | Yes      |
| Screenshots       | 2–8 per device type; 320–3840 px, JPEG/24-bit PNG, no alpha | Yes   |

For screenshots, the longest dimension cannot exceed twice the shortest dimension. Four 1080p phone screenshots are strongly recommended for eligibility in large recommendation surfaces. Large-screen listings have additional requirements.

### Graphic Content Rules

- Show the real app experience and current functionality.
- Keep the feature graphic's focal content near the center to survive cropping.
- Avoid rankings, awards, prices, promotions, testimonials, or calls to action in store graphics.
- Localize marketing text and provide concise alt text for each uploaded graphic.

### Preview Video

- One public or unlisted, embeddable YouTube URL; playlists and private videos are not accepted.
- Disable ads and monetization claims that could display third-party ads.
- Put real app footage early and design for muted autoplay.

### Required Submission Material

- App icon, feature graphic, and at least two screenshots.
- Privacy Policy URL and public contact email.
- Completed Data safety, target-audience, content-rating, and app-content declarations.

## Current Volvox Storefront Snapshot

Ratings and categories are questionnaire results, not values to copy blindly. Re-check both consoles whenever product content changes.

| Product      | Apple category / rating | Google category / rating |
| ------------ | ----------------------- | ------------------------ |
| Decision Jar | Lifestyle / 4+          | Productivity / Everyone  |
| Sobers       | Health & Fitness / 18+  | Lifestyle / Everyone     |

Snapshot verified against US storefronts on July 19, 2026. Apple ratings can vary by operating-system generation and region.

## Review Timing

- **Apple:** Apple reports that 90% of submissions are reviewed in under 24 hours on average. This is not a guarantee; incomplete review information causes delays, and distribution can take up to another 24 hours after approval.
- **Google:** Processing can take a few hours to seven days or longer in exceptional cases. Plan at least a one-week buffer. Submitting more changes while a review is active can restart the review clock.

## Before Submission

1. Verify metadata and prices directly in the live storefront for each region being targeted.
2. Review search terms in App Store Connect and Play Console; use a reputable ASO research tool only as supplemental evidence.
3. Confirm every screenshot, feature claim, privacy declaration, and support link matches the current release.
4. Include working review credentials and concise reviewer instructions when login or setup is required.

## Official Sources

- [Apple app information reference](https://developer.apple.com/help/app-store-connect/reference/app-information/app-information/)
- [Apple app icon help](https://developer.apple.com/help/app-store-connect/manage-app-information/add-an-app-icon)
- [Apple screenshot specifications](https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications/)
- [Apple product-page and keyword guidance](https://developer.apple.com/app-store/product-page/)
- [Apple App Review status](https://developer.apple.com/app-store/review/)
- [Google Play preview asset requirements](https://support.google.com/googleplay/android-developer/answer/9866151)
- [Google Play store-listing guidance](https://support.google.com/googleplay/android-developer/answer/13393723)
- [Google Play review and publishing timing](https://support.google.com/googleplay/android-developer/answer/9859654)
