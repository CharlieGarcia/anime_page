CREATE TABLE "top_anime" (
	"user_id" text NOT NULL,
	"rank" smallint NOT NULL,
	"anime_id" text NOT NULL,
	"title" text NOT NULL,
	"poster_url" text,
	"subtype" text,
	CONSTRAINT "top_anime_user_id_rank_pk" PRIMARY KEY("user_id","rank"),
	CONSTRAINT "top_anime_user_anime_unique" UNIQUE("user_id","anime_id"),
	CONSTRAINT "top_anime_rank_range" CHECK ("top_anime"."rank" BETWEEN 1 AND 10)
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "top_anime_public" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "top_anime" ADD CONSTRAINT "top_anime_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;