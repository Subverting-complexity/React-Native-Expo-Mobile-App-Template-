# Raw store captures

Drop raw device screenshots here (PNG, portrait, any consistent size — an
iPhone or Pixel capture straight off the device is fine). They are the
**inputs** to the store-screenshot generator; the composed, store-sized
outputs land in `fastlane/screenshots/` and
`fastlane/metadata/android/en-US/images/`.

Map each file to a slide and caption in the `SLIDES` list at the top of
[`fastlane/creative/render.py`](../../fastlane/creative/render.py), then run:

```bash
cd fastlane/creative && python render.py mockups
```

See [`fastlane/PUBLISHING.md`](../../fastlane/PUBLISHING.md) for the full
publishing workflow.
