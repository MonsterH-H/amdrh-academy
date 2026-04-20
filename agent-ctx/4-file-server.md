# Task 4 — File Server Agent

## Summary
Created a complete file server system for the AMDRH Academy project with upload, serving, and streaming support.

## Files Created

### 1. `src/app/api/files/serve/[id]/route.ts`
- **GET endpoint**: Serves files by resource ID from the local filesystem
- **Authentication**: Any authenticated user (checks userId + role query params, verifies user is active in DB)
- **Range requests**: Full HTTP 206 Partial Content support for video/audio streaming
- **Download tracking**: Fire-and-forget increment of `downloadCount` on each access
- **Headers**: Proper Content-Type, Content-Disposition (inline/attachment), Content-Length, Cache-Control, Accept-Ranges

### 2. `src/app/api/files/upload/route.ts`
- **POST endpoint**: Accepts multipart form data for file uploads
- **Authentication**: Restricted to ADMIN and FORMATEUR roles via `requireRole` helper
- **Storage**: Files saved to `/uploads/YYYY/MM/` with timestamp-prefixed unique filenames
- **Max size**: 500MB
- **MIME mapping**: Comprehensive mapping for VIDEO, PDF, IMAGE, DOCUMENT, AUDIO, ARCHIVE types
- **Database**: Creates a `Resource` record linked to the uploaded file

### 3. `uploads/` directory
- Created at project root for local file storage

## API Usage

### Upload a file
```
POST /api/files/upload?userId=xxx&role=ADMIN
Content-Type: multipart/form-data
Fields: file, courseId?, sectionId?, lessonId?, category?, description?
```

### Serve/download a file
```
GET /api/files/serve/{resourceId}?userId=xxx&role=ARBITRE
Headers: Range: bytes=0-1023  (for partial content)
```

## Integration Notes
- Uses existing `db` client from `@/lib/db`
- Uses existing `requireRole` from `@/lib/auth-helpers` for upload auth
- Compatible with the existing Resource model in Prisma schema
- Follows project patterns (French error messages, query param auth, etc.)
