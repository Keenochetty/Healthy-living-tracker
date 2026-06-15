// Supabase Edge Function pseudo-code: youtube-video-search
// Purpose: search YouTube for embeddable exercise demos, store metadata only, and require manual approval.

import { serve } from "https://deno.land/std/http/server.ts";

serve(async (req) => {
  const { exercise_id, query, maxResults = 5 } = await req.json();

  // 1) Validate user is admin/editor or internal job.
  // 2) Call YouTube Data API search.list with:
  //    part=snippet
  //    type=video
  //    videoEmbeddable=true
  //    videoSyndicated=true
  //    safeSearch=strict
  //    q=query
  //    maxResults=maxResults
  //    Optional: videoLicense=creativeCommon when you want CC-only candidates.
  // 3) For returned videoIds, call videos.list for contentDetails/status where needed.
  // 4) Store video_id, title, channel, thumbnail, license/embeddable flags, checked_at.
  // 5) Mark review_status = needs_manual_review.
  // 6) Never download or store the audiovisual video file.

  return new Response(JSON.stringify({ ok: true, exercise_id }), {
    headers: { "content-type": "application/json" },
  });
});
