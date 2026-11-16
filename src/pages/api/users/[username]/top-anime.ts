import { getDb } from '@/server/db/client';
import { route } from '@/server/http';
import { getPublicTopAnime } from '@/server/topAnime';

export default route({
  // Anyone's top 10 in rank order; no sign-in needed. 403 when its owner made it private.
  GET: async (req, res) => {
    const items = await getPublicTopAnime(getDb(), String(req.query.username));
    res.status(200).json({ items });
  }
});
