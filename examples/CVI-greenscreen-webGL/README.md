# Tavus Green Screen WebGL CVI Demo

This project demonstrates a Tavus feature that enables real-time green screen removal in video calls using WebGL.

[LIVE DEMO](https://andy-tavus.github.io/CVI-greenscreen-webGL/)

## Features
- Connects to a video call created via the Tavus API.
- Subscribes to the existing participant’s (replica’s) video and audio streams.
- Removes the green screen background (RGB: `[0, 255, 155]`) using WebGL.
- Allows users to change the background color dynamically with a color picker.

## Usage
1. Use the Tavus API's [`create-conversation` endpoint](https://docs.tavus.io/api-reference/conversations/create-conversation) to generate a conversation with the `apply_greenscreen` property set to `true`.
2. Enter the conversation URL in the input field.
3. Click the "JOIN" button to connect.
4. The app will display the remote participant’s video with the green screen background removed.
5. Use the color picker to adjust the background color.

## Requirements
- A valid conversation URL created via the Tavus API.
- A browser that supports WebGL and the MediaStream API.
