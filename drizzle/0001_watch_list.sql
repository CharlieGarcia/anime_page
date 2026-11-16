CREATE TABLE "watch_list_items" (
	"user_id" text NOT NULL,
	"anime_id" text NOT NULL,
	"status" text DEFAULT 'planned' NOT NULL,
	"title" text NOT NULL,
	"poster_url" text,
	"subtype" text,
	"added_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "watch_list_items_user_id_anime_id_pk" PRIMARY KEY("user_id","anime_id")
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "watch_list_public" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "watch_list_items" ADD CONSTRAINT "watch_list_items_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "watch_list_items_user_added_idx" ON "watch_list_items" USING btree ("user_id","added_at");