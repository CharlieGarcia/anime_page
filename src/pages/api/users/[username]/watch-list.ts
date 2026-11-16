import { getDb } from '@/server/db/client';
import { route } from '@/server/http';
import { getPublicWatchList } from '@/server/watchList';

export default route({
  // Anyone's watch list; no sign-in needed. 403 when its owner made it private.
  GET: async (req, res) => {
    const items = await getPublicWatchList(getDb(), String(req.query.username));
    res.status(200).json({ items });
  }
});
