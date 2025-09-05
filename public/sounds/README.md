# LCARS Sound Effects for Starfleet Engineering Report Generator

This directory contains sound effect files used by the application to create an authentic LCARS interface experience.

## Sound Files

The application looks for the following sound files:

- `lcars_beep1.mp3` - Standard button click sound
- `lcars_hover.mp3` - Subtle hover sound for buttons and controls
- `lcars_alert.mp3` - Alert notification sound
- `lcars_success.mp3` - Operation successful indicator
- `lcars_negative.mp3` - Error or negative feedback sound
- `lcars_processing.mp3` - Data processing or working sound
- `lcars_edit.mp3` - Chart editing mode sound
- `lcars_notification.mp3` - General notification sound
- `lcars_share.mp3` - Share report sound
- `lcars_toggle_on.mp3` - Feature activation sound
- `lcars_toggle_off.mp3` - Feature deactivation sound

## Sound Generator

This folder includes a sound generation tool that can create authentic LCARS-style sound effects directly in your browser. To use it:

1. Start your development server (`npm run dev`)
2. Navigate to `/sounds/` or `/sounds/index.html`
3. Use the interactive interface to preview and generate sound files
4. Click the "Generate All Sound Files" button to download all sound effects
5. Move the downloaded files into this directory

## Manually Generating Sound Files

If you want to manually create the sound files:

1. Open `index.html` or `generator.html` in your browser
2. Use the provided tools to preview and download individual sound effects
3. Place the downloaded files in this directory

## Custom Sound Files

You can also use your own custom sound files:

1. Create or obtain MP3 sound files that match the LCARS aesthetic
2. Name them according to the names listed above
3. Place them in this directory

The application will automatically use any sound files it finds in this directory, falling back to synthetic sounds if files are missing.
