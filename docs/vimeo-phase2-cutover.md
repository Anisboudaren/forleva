# Vimeo Phase 2 Cutover Targets

This checklist is for the full cutover after sandbox validation.

## Replace Upload Flow (Teacher)

- `components/teacher/create-course-form.tsx`
  - Replace calls to:
    - `/api/mux/direct-upload`
    - `/api/mux/upload/[uploadId]/status`
  - Use `/api/vimeo/upload` with `FormData` (`file`, optional `name`, optional `courseId`).
  - Remove Mux-specific upload progress/polling assumptions.

## Replace Playback Flow (Public Course + Student Studio)

- `app/courses/[id]/page.tsx`
  - Remove `MuxVideoPlayer` and `isMuxPlaybackUrl` branching.
  - Render Vimeo embed/player when `course.videoUrl` is Vimeo.

- `components/student/learning-studio-client.tsx`
  - Remove Mux playback branch for lesson videos.
  - Use Vimeo embed logic for Vimeo URLs.

- `components/mux-video-player.tsx`
  - Delete after all references are removed.

## Remove Mux API Endpoints

- `app/api/mux/direct-upload/route.ts`
- `app/api/mux/upload/[uploadId]/status/route.ts`

Delete when no code path calls them anymore.

## Environment Variables

- Remove Mux env usage:
  - `MUX_TOKEN_ID`
  - `MUX_TOKEN_SECRET` / `MUX_SECRET_KEY`

- Keep Vimeo env usage:
  - `VIMEO_ACCESS_TOKEN`
  - `VIMEO_CLIENT_ID`
  - `VIMEO_CLIENT_SECRET`

## Final Validation Before Removing Mux

- Teacher can upload intro video and section video.
- Uploaded video is playable on:
  - Public course page
  - Student learning studio
- Error paths are clear (invalid type, large file, unauthorized).
- No remaining imports/usages of:
  - `components/mux-video-player`
  - `/api/mux/`
