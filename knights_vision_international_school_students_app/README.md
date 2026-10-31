# Sure Success Point School — Student App

The Flutter Student App is a student-only client for the SSPS web API. It uses
the `student_token` secure-storage session and never calls faculty or
administration APIs for student records.

## First-time account activation

1. An authorized school staff member opens the student record in the web
   Student Lifecycle workspace and chooses **Issue app code**.
2. The generated one-time code is delivered privately to the student or
   verified guardian. It expires after seven days and is never stored or shown
   again by the web UI.
3. In the app, choose **First time here? Activate account**.
4. Enter the admission number, the one-time code, and a new password with at
   least 12 characters.
5. Sign in with the admission number (or school email) and that new password.

UID and Aadhaar values are never passwords. A student can only read data for
the account in their signed-in token.

## Run against the local Next.js API

Start the web project on port 3000, then use the right host for the device:

```powershell
# Android emulator
flutter run --dart-define=SSPS_API_BASE_URL=http://10.0.2.2:3000

# Physical Android phone on the same Wi-Fi network
flutter run --dart-define=SSPS_API_BASE_URL=http://YOUR_COMPUTER_LAN_IP:3000
```

The Android debug manifest permits local HTTP only for development. Production
builds must use the HTTPS SSPS API origin:

```powershell
flutter build appbundle --dart-define=SSPS_API_BASE_URL=https://YOUR_SSPS_HTTPS_DOMAIN
```

Never put API secrets, Backblaze keys, staff credentials, or JWTs in a
`--dart-define`, source file, or mobile build.
