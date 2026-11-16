import { requireUser } from '@/server/auth';
import { getDb } from '@/server/db/client';
import { route } from '@/server/http';
import { removeFromTopAnime } from '@/server/topAnime';

export default route({
  // 204 whether or not the anime was in the signed-in user's top 10.
  // The anime ranked below it move up one.
  DELETE: async (req, res) => {
    const user = await requireUser(req);
    await removeFromTopAnime(getDb(), user.id, req.query.animeId);
    res.status(204).end();
  }
});
