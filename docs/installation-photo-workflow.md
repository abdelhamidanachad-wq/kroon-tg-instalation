# KROON installation proof workflow

## Field team
1. Sign in with the team's username and PIN/password.
2. Open only an assigned store.
3. Choose the task type shown on the store record (TG or Stand).
4. Tap **Prendre une photo avec GPS**. The browser requests camera and location permissions.
5. The app captures a fresh location, a client-side capture timestamp, and a photo. It stamps the image with the store, installation type, local capture time, latitude/longitude and accuracy before upload.
6. Review the image and upload. The server stores the stamped image and its metadata together.
7. Submit at least three proof photos before asking for installation completion.

## Evidence notes
- Geolocation must be explicitly allowed in the browser; HTTPS is required.
- Browser time can be manipulated. The server also records receipt time, while the capture time/GPS accuracy are evidence supplied by the device, not a cryptographic guarantee.
- Coordinates are collected only when the user initiates a photo capture for the assigned installation.
- Keep image GPS/time both visible on the image and saved as metadata, so the evidence remains understandable when downloaded.
