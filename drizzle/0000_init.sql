CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"username" text,
	"display_name" text NOT NULL,
	"avatar_url" text,
	"bio" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
