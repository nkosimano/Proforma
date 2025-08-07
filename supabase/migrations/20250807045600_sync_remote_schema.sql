create sequence "public"."mindmap_operation_sequence";

create table "public"."chat_messages" (
    "id" uuid not null default gen_random_uuid(),
    "session_id" uuid not null,
    "user_id" uuid not null,
    "user_name" text not null,
    "user_color" text not null default '#6B46C1'::text,
    "message" text not null,
    "message_type" text default 'text'::text,
    "processed_content" text,
    "sentiment_score" numeric(3,2),
    "mentions" text[],
    "attachments" jsonb default '[]'::jsonb,
    "created_at" timestamp with time zone default now(),
    "edited_at" timestamp with time zone,
    "is_pinned" boolean default false,
    "thread_id" uuid
);


alter table "public"."chat_messages" enable row level security;

create table "public"."collaboration_sessions" (
    "id" uuid not null default gen_random_uuid(),
    "epistemic_driver_id" uuid,
    "created_by" uuid,
    "session_name" text not null,
    "description" text,
    "is_active" boolean default true,
    "max_participants" integer default 10,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "expires_at" timestamp with time zone,
    "session_settings" jsonb default '{}'::jsonb,
    "session_type" text default 'private'::text
);


alter table "public"."collaboration_sessions" enable row level security;

create table "public"."course_analyses" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "course_id" uuid not null,
    "analysis_data" jsonb not null default '{}'::jsonb,
    "memory_connections" jsonb default '{}'::jsonb,
    "career_pathways" jsonb default '{}'::jsonb,
    "study_map" jsonb default '{}'::jsonb,
    "completion_status" text default 'draft'::text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."course_analyses" enable row level security;

create table "public"."courses" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "university" text not null,
    "field" text not null,
    "difficulty" text not null,
    "duration" text not null,
    "description" text,
    "syllabus" text[] default '{}'::text[],
    "metadata" jsonb default '{}'::jsonb,
    "is_active" boolean default true,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."courses" enable row level security;

create table "public"."dialogue_sessions" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "memory_link_id" uuid not null,
    "session_data" jsonb not null default '{}'::jsonb,
    "messages" jsonb[] default '{}'::jsonb[],
    "session_status" text default 'active'::text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."dialogue_sessions" enable row level security;

create table "public"."epistemic_driver_history" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "title" text not null,
    "subject" text not null,
    "objectives" text not null,
    "study_map_data" jsonb not null,
    "is_favorite" boolean default false,
    "tags" text[] default '{}'::text[],
    "notes" text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."epistemic_driver_history" enable row level security;

create table "public"."memories" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "category" text not null,
    "text_content" text not null,
    "sensa_analysis" jsonb default '{}'::jsonb,
    "themes" text[] default '{}'::text[],
    "emotional_tone" text,
    "learning_indicators" text[] default '{}'::text[],
    "confidence_score" numeric(3,2) default 0.0,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."memories" enable row level security;

create table "public"."memory_links" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "memory_id" uuid not null,
    "course_id" uuid,
    "concept" text not null,
    "original_analogy" text not null,
    "original_study_tip" text not null,
    "refined_analogy" text,
    "refined_study_tip" text,
    "refinement_status" text default 'original'::text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."memory_links" enable row level security;

create table "public"."mindmap_operations" (
    "id" uuid not null default gen_random_uuid(),
    "session_id" uuid,
    "user_id" uuid,
    "operation_type" text not null,
    "operation_data" jsonb not null,
    "sequence_number" bigint not null,
    "parent_operation_id" uuid,
    "timestamp" timestamp with time zone default now(),
    "applied" boolean default false,
    "conflict_resolved" boolean default false
);


alter table "public"."mindmap_operations" enable row level security;

create table "public"."mindmap_results" (
    "id" uuid not null default gen_random_uuid(),
    "job_id" text not null,
    "user_id" uuid,
    "subject" text not null,
    "status" text not null,
    "result_data" jsonb,
    "error_message" text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."mindmap_results" enable row level security;

create table "public"."mindmap_snapshots" (
    "id" uuid not null default gen_random_uuid(),
    "session_id" uuid,
    "created_by" uuid,
    "snapshot_name" text,
    "nodes_data" jsonb not null default '[]'::jsonb,
    "edges_data" jsonb not null default '[]'::jsonb,
    "operation_sequence" bigint not null default 0,
    "created_at" timestamp with time zone default now(),
    "is_checkpoint" boolean default false
);


alter table "public"."mindmap_snapshots" enable row level security;

create table "public"."session_participants" (
    "id" uuid not null default gen_random_uuid(),
    "session_id" uuid,
    "user_id" uuid,
    "role" text default 'participant'::text,
    "joined_at" timestamp with time zone default now(),
    "last_seen" timestamp with time zone default now(),
    "cursor_position" jsonb default '{}'::jsonb,
    "is_online" boolean default true,
    "permissions" jsonb default '{}'::jsonb,
    "email" text,
    "name" text,
    "color" text default '#6B46C1'::text
);


alter table "public"."session_participants" enable row level security;

create table "public"."study_maps" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "course_id" uuid not null,
    "field_of_study" text not null,
    "map_type" text not null,
    "map_data" jsonb not null default '{}'::jsonb,
    "node_data" jsonb default '{}'::jsonb,
    "mermaid_code" text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."study_maps" enable row level security;

create table "public"."user_preferences" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "memory_analysis_enabled" boolean default true,
    "course_personalization_enabled" boolean default true,
    "memory_storage_enabled" boolean default true,
    "analytics_opt_out" boolean default false,
    "data_sharing_consent" boolean default false,
    "notification_preferences" jsonb default '{}'::jsonb,
    "privacy_settings" jsonb default '{}'::jsonb,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."user_preferences" enable row level security;

create table "public"."users" (
    "id" uuid not null default gen_random_uuid(),
    "auth_id" uuid not null,
    "email" text not null,
    "full_name" text,
    "learning_profile" jsonb default '{}'::jsonb,
    "onboarding_completed" boolean default false,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."users" enable row level security;

CREATE UNIQUE INDEX chat_messages_pkey ON public.chat_messages USING btree (id);

CREATE UNIQUE INDEX collaboration_sessions_pkey ON public.collaboration_sessions USING btree (id);

CREATE UNIQUE INDEX course_analyses_pkey ON public.course_analyses USING btree (id);

CREATE UNIQUE INDEX course_analyses_user_id_course_id_key ON public.course_analyses USING btree (user_id, course_id);

CREATE UNIQUE INDEX courses_pkey ON public.courses USING btree (id);

CREATE UNIQUE INDEX dialogue_sessions_pkey ON public.dialogue_sessions USING btree (id);

CREATE UNIQUE INDEX epistemic_driver_history_pkey ON public.epistemic_driver_history USING btree (id);

CREATE INDEX idx_chat_messages_created_at ON public.chat_messages USING btree (created_at);

CREATE INDEX idx_chat_messages_pinned ON public.chat_messages USING btree (is_pinned) WHERE (is_pinned = true);

CREATE INDEX idx_chat_messages_session ON public.chat_messages USING btree (session_id);

CREATE INDEX idx_chat_messages_thread ON public.chat_messages USING btree (thread_id);

CREATE INDEX idx_chat_messages_type ON public.chat_messages USING btree (message_type);

CREATE INDEX idx_chat_messages_user ON public.chat_messages USING btree (user_id);

CREATE INDEX idx_collaboration_sessions_active ON public.collaboration_sessions USING btree (is_active, created_at);

CREATE INDEX idx_collaboration_sessions_created_by ON public.collaboration_sessions USING btree (created_by);

CREATE INDEX idx_collaboration_sessions_creator ON public.collaboration_sessions USING btree (created_by);

CREATE INDEX idx_collaboration_sessions_epistemic_driver ON public.collaboration_sessions USING btree (epistemic_driver_id);

CREATE INDEX idx_course_analyses_course_id ON public.course_analyses USING btree (course_id);

CREATE INDEX idx_course_analyses_status ON public.course_analyses USING btree (completion_status);

CREATE INDEX idx_course_analyses_user_id ON public.course_analyses USING btree (user_id);

CREATE INDEX idx_courses_active ON public.courses USING btree (is_active);

CREATE INDEX idx_courses_difficulty ON public.courses USING btree (difficulty);

CREATE INDEX idx_courses_field ON public.courses USING btree (field);

CREATE INDEX idx_courses_university ON public.courses USING btree (university);

CREATE INDEX idx_dialogue_sessions_memory_link_id ON public.dialogue_sessions USING btree (memory_link_id);

CREATE INDEX idx_dialogue_sessions_status ON public.dialogue_sessions USING btree (session_status);

CREATE INDEX idx_dialogue_sessions_user_id ON public.dialogue_sessions USING btree (user_id);

CREATE INDEX idx_epistemic_driver_history_created_at ON public.epistemic_driver_history USING btree (created_at DESC);

CREATE INDEX idx_epistemic_driver_history_is_favorite ON public.epistemic_driver_history USING btree (is_favorite) WHERE (is_favorite = true);

CREATE INDEX idx_epistemic_driver_history_tags ON public.epistemic_driver_history USING gin (tags);

CREATE INDEX idx_epistemic_driver_history_user_id ON public.epistemic_driver_history USING btree (user_id);

CREATE INDEX idx_memories_category ON public.memories USING btree (category);

CREATE INDEX idx_memories_created_at ON public.memories USING btree (created_at DESC);

CREATE INDEX idx_memories_user_id ON public.memories USING btree (user_id);

CREATE INDEX idx_memory_links_course_id ON public.memory_links USING btree (course_id);

CREATE INDEX idx_memory_links_memory_id ON public.memory_links USING btree (memory_id);

CREATE INDEX idx_memory_links_status ON public.memory_links USING btree (refinement_status);

CREATE INDEX idx_memory_links_user_id ON public.memory_links USING btree (user_id);

CREATE INDEX idx_mindmap_operations_applied ON public.mindmap_operations USING btree (applied);

CREATE INDEX idx_mindmap_operations_sequence ON public.mindmap_operations USING btree (sequence_number);

CREATE INDEX idx_mindmap_operations_session ON public.mindmap_operations USING btree (session_id, sequence_number);

CREATE INDEX idx_mindmap_operations_timestamp ON public.mindmap_operations USING btree ("timestamp");

CREATE INDEX idx_mindmap_results_created_at ON public.mindmap_results USING btree (created_at DESC);

CREATE INDEX idx_mindmap_results_job_id ON public.mindmap_results USING btree (job_id);

CREATE INDEX idx_mindmap_results_status ON public.mindmap_results USING btree (status);

CREATE INDEX idx_mindmap_results_user_id ON public.mindmap_results USING btree (user_id);

CREATE INDEX idx_mindmap_snapshots_created_at ON public.mindmap_snapshots USING btree (created_at);

CREATE INDEX idx_mindmap_snapshots_session ON public.mindmap_snapshots USING btree (session_id, created_at);

CREATE INDEX idx_session_participants_online ON public.session_participants USING btree (session_id, is_online);

CREATE INDEX idx_session_participants_session ON public.session_participants USING btree (session_id);

CREATE INDEX idx_session_participants_user ON public.session_participants USING btree (user_id);

CREATE INDEX idx_study_maps_course_id ON public.study_maps USING btree (course_id);

CREATE INDEX idx_study_maps_type ON public.study_maps USING btree (map_type);

CREATE INDEX idx_study_maps_user_id ON public.study_maps USING btree (user_id);

CREATE INDEX idx_user_preferences_user_id ON public.user_preferences USING btree (user_id);

CREATE INDEX idx_users_auth_id ON public.users USING btree (auth_id);

CREATE INDEX idx_users_email ON public.users USING btree (email);

CREATE UNIQUE INDEX memories_pkey ON public.memories USING btree (id);

CREATE UNIQUE INDEX memory_links_pkey ON public.memory_links USING btree (id);

CREATE UNIQUE INDEX mindmap_operations_pkey ON public.mindmap_operations USING btree (id);

CREATE UNIQUE INDEX mindmap_results_job_id_key ON public.mindmap_results USING btree (job_id);

CREATE UNIQUE INDEX mindmap_results_pkey ON public.mindmap_results USING btree (id);

CREATE UNIQUE INDEX mindmap_snapshots_pkey ON public.mindmap_snapshots USING btree (id);

CREATE UNIQUE INDEX session_participants_pkey ON public.session_participants USING btree (id);

CREATE UNIQUE INDEX session_participants_session_id_user_id_key ON public.session_participants USING btree (session_id, user_id);

CREATE UNIQUE INDEX study_maps_pkey ON public.study_maps USING btree (id);

CREATE UNIQUE INDEX study_maps_user_id_course_id_map_type_key ON public.study_maps USING btree (user_id, course_id, map_type);

CREATE UNIQUE INDEX user_preferences_pkey ON public.user_preferences USING btree (id);

CREATE UNIQUE INDEX user_preferences_user_id_key ON public.user_preferences USING btree (user_id);

CREATE UNIQUE INDEX users_auth_id_key ON public.users USING btree (auth_id);

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);

CREATE UNIQUE INDEX users_pkey ON public.users USING btree (id);

alter table "public"."chat_messages" add constraint "chat_messages_pkey" PRIMARY KEY using index "chat_messages_pkey";

alter table "public"."collaboration_sessions" add constraint "collaboration_sessions_pkey" PRIMARY KEY using index "collaboration_sessions_pkey";

alter table "public"."course_analyses" add constraint "course_analyses_pkey" PRIMARY KEY using index "course_analyses_pkey";

alter table "public"."courses" add constraint "courses_pkey" PRIMARY KEY using index "courses_pkey";

alter table "public"."dialogue_sessions" add constraint "dialogue_sessions_pkey" PRIMARY KEY using index "dialogue_sessions_pkey";

alter table "public"."epistemic_driver_history" add constraint "epistemic_driver_history_pkey" PRIMARY KEY using index "epistemic_driver_history_pkey";

alter table "public"."memories" add constraint "memories_pkey" PRIMARY KEY using index "memories_pkey";

alter table "public"."memory_links" add constraint "memory_links_pkey" PRIMARY KEY using index "memory_links_pkey";

alter table "public"."mindmap_operations" add constraint "mindmap_operations_pkey" PRIMARY KEY using index "mindmap_operations_pkey";

alter table "public"."mindmap_results" add constraint "mindmap_results_pkey" PRIMARY KEY using index "mindmap_results_pkey";

alter table "public"."mindmap_snapshots" add constraint "mindmap_snapshots_pkey" PRIMARY KEY using index "mindmap_snapshots_pkey";

alter table "public"."session_participants" add constraint "session_participants_pkey" PRIMARY KEY using index "session_participants_pkey";

alter table "public"."study_maps" add constraint "study_maps_pkey" PRIMARY KEY using index "study_maps_pkey";

alter table "public"."user_preferences" add constraint "user_preferences_pkey" PRIMARY KEY using index "user_preferences_pkey";

alter table "public"."users" add constraint "users_pkey" PRIMARY KEY using index "users_pkey";

alter table "public"."chat_messages" add constraint "chat_messages_message_type_check" CHECK ((message_type = ANY (ARRAY['text'::text, 'system'::text, 'ai_suggestion'::text, 'voice_transcript'::text]))) not valid;

alter table "public"."chat_messages" validate constraint "chat_messages_message_type_check";

alter table "public"."chat_messages" add constraint "chat_messages_session_id_fkey" FOREIGN KEY (session_id) REFERENCES collaboration_sessions(id) ON DELETE CASCADE not valid;

alter table "public"."chat_messages" validate constraint "chat_messages_session_id_fkey";

alter table "public"."chat_messages" add constraint "chat_messages_thread_id_fkey" FOREIGN KEY (thread_id) REFERENCES chat_messages(id) ON DELETE SET NULL not valid;

alter table "public"."chat_messages" validate constraint "chat_messages_thread_id_fkey";

alter table "public"."collaboration_sessions" add constraint "collaboration_sessions_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."collaboration_sessions" validate constraint "collaboration_sessions_created_by_fkey";

alter table "public"."collaboration_sessions" add constraint "collaboration_sessions_epistemic_driver_id_fkey" FOREIGN KEY (epistemic_driver_id) REFERENCES epistemic_driver_history(id) ON DELETE CASCADE not valid;

alter table "public"."collaboration_sessions" validate constraint "collaboration_sessions_epistemic_driver_id_fkey";

alter table "public"."collaboration_sessions" add constraint "collaboration_sessions_session_type_check" CHECK ((session_type = ANY (ARRAY['public'::text, 'private'::text, 'invite_only'::text]))) not valid;

alter table "public"."collaboration_sessions" validate constraint "collaboration_sessions_session_type_check";

alter table "public"."course_analyses" add constraint "course_analyses_completion_status_check" CHECK ((completion_status = ANY (ARRAY['draft'::text, 'completed'::text, 'archived'::text]))) not valid;

alter table "public"."course_analyses" validate constraint "course_analyses_completion_status_check";

alter table "public"."course_analyses" add constraint "course_analyses_course_id_fkey" FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE not valid;

alter table "public"."course_analyses" validate constraint "course_analyses_course_id_fkey";

alter table "public"."course_analyses" add constraint "course_analyses_user_id_course_id_key" UNIQUE using index "course_analyses_user_id_course_id_key";

alter table "public"."course_analyses" add constraint "course_analyses_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(auth_id) ON DELETE CASCADE not valid;

alter table "public"."course_analyses" validate constraint "course_analyses_user_id_fkey";

alter table "public"."courses" add constraint "courses_difficulty_check" CHECK ((difficulty = ANY (ARRAY['Beginner'::text, 'Intermediate'::text, 'Advanced'::text]))) not valid;

alter table "public"."courses" validate constraint "courses_difficulty_check";

alter table "public"."dialogue_sessions" add constraint "dialogue_sessions_memory_link_id_fkey" FOREIGN KEY (memory_link_id) REFERENCES memory_links(id) ON DELETE CASCADE not valid;

alter table "public"."dialogue_sessions" validate constraint "dialogue_sessions_memory_link_id_fkey";

alter table "public"."dialogue_sessions" add constraint "dialogue_sessions_session_status_check" CHECK ((session_status = ANY (ARRAY['active'::text, 'completed'::text, 'abandoned'::text]))) not valid;

alter table "public"."dialogue_sessions" validate constraint "dialogue_sessions_session_status_check";

alter table "public"."dialogue_sessions" add constraint "dialogue_sessions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(auth_id) ON DELETE CASCADE not valid;

alter table "public"."dialogue_sessions" validate constraint "dialogue_sessions_user_id_fkey";

alter table "public"."epistemic_driver_history" add constraint "epistemic_driver_history_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."epistemic_driver_history" validate constraint "epistemic_driver_history_user_id_fkey";

alter table "public"."memories" add constraint "fk_memories_user" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."memories" validate constraint "fk_memories_user";

alter table "public"."memories" add constraint "memories_category_check" CHECK ((category = ANY (ARRAY['Spatial Memory'::text, 'Learning Adventure'::text, 'Emotional Memory'::text, 'Creative Memory'::text, 'Cognitive Memory'::text]))) not valid;

alter table "public"."memories" validate constraint "memories_category_check";

alter table "public"."memories" add constraint "memories_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(auth_id) ON DELETE CASCADE not valid;

alter table "public"."memories" validate constraint "memories_user_id_fkey";

alter table "public"."memory_links" add constraint "memory_links_course_id_fkey" FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE not valid;

alter table "public"."memory_links" validate constraint "memory_links_course_id_fkey";

alter table "public"."memory_links" add constraint "memory_links_memory_id_fkey" FOREIGN KEY (memory_id) REFERENCES memories(id) ON DELETE CASCADE not valid;

alter table "public"."memory_links" validate constraint "memory_links_memory_id_fkey";

alter table "public"."memory_links" add constraint "memory_links_refinement_status_check" CHECK ((refinement_status = ANY (ARRAY['original'::text, 'refined'::text, 'validated'::text]))) not valid;

alter table "public"."memory_links" validate constraint "memory_links_refinement_status_check";

alter table "public"."memory_links" add constraint "memory_links_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(auth_id) ON DELETE CASCADE not valid;

alter table "public"."memory_links" validate constraint "memory_links_user_id_fkey";

alter table "public"."mindmap_operations" add constraint "mindmap_operations_operation_type_check" CHECK ((operation_type = ANY (ARRAY['add_node'::text, 'edit_node'::text, 'delete_node'::text, 'move_node'::text, 'add_edge'::text, 'edit_edge'::text, 'delete_edge'::text, 'batch_operation'::text, 'undo'::text, 'redo'::text]))) not valid;

alter table "public"."mindmap_operations" validate constraint "mindmap_operations_operation_type_check";

alter table "public"."mindmap_operations" add constraint "mindmap_operations_parent_operation_id_fkey" FOREIGN KEY (parent_operation_id) REFERENCES mindmap_operations(id) not valid;

alter table "public"."mindmap_operations" validate constraint "mindmap_operations_parent_operation_id_fkey";

alter table "public"."mindmap_operations" add constraint "mindmap_operations_session_id_fkey" FOREIGN KEY (session_id) REFERENCES collaboration_sessions(id) ON DELETE CASCADE not valid;

alter table "public"."mindmap_operations" validate constraint "mindmap_operations_session_id_fkey";

alter table "public"."mindmap_operations" add constraint "mindmap_operations_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."mindmap_operations" validate constraint "mindmap_operations_user_id_fkey";

alter table "public"."mindmap_results" add constraint "mindmap_results_job_id_key" UNIQUE using index "mindmap_results_job_id_key";

alter table "public"."mindmap_results" add constraint "mindmap_results_status_check" CHECK ((status = ANY (ARRAY['queued'::text, 'processing'::text, 'completed'::text, 'failed'::text]))) not valid;

alter table "public"."mindmap_results" validate constraint "mindmap_results_status_check";

alter table "public"."mindmap_results" add constraint "mindmap_results_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."mindmap_results" validate constraint "mindmap_results_user_id_fkey";

alter table "public"."mindmap_snapshots" add constraint "mindmap_snapshots_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) not valid;

alter table "public"."mindmap_snapshots" validate constraint "mindmap_snapshots_created_by_fkey";

alter table "public"."mindmap_snapshots" add constraint "mindmap_snapshots_session_id_fkey" FOREIGN KEY (session_id) REFERENCES collaboration_sessions(id) ON DELETE CASCADE not valid;

alter table "public"."mindmap_snapshots" validate constraint "mindmap_snapshots_session_id_fkey";

alter table "public"."session_participants" add constraint "session_participants_role_check" CHECK ((role = ANY (ARRAY['facilitator'::text, 'participant'::text, 'observer'::text]))) not valid;

alter table "public"."session_participants" validate constraint "session_participants_role_check";

alter table "public"."session_participants" add constraint "session_participants_session_id_fkey" FOREIGN KEY (session_id) REFERENCES collaboration_sessions(id) ON DELETE CASCADE not valid;

alter table "public"."session_participants" validate constraint "session_participants_session_id_fkey";

alter table "public"."session_participants" add constraint "session_participants_session_id_user_id_key" UNIQUE using index "session_participants_session_id_user_id_key";

alter table "public"."session_participants" add constraint "session_participants_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."session_participants" validate constraint "session_participants_user_id_fkey";

alter table "public"."study_maps" add constraint "study_maps_course_id_fkey" FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE not valid;

alter table "public"."study_maps" validate constraint "study_maps_course_id_fkey";

alter table "public"."study_maps" add constraint "study_maps_map_type_check" CHECK ((map_type = ANY (ARRAY['interactive'::text, 'mermaid'::text]))) not valid;

alter table "public"."study_maps" validate constraint "study_maps_map_type_check";

alter table "public"."study_maps" add constraint "study_maps_user_id_course_id_map_type_key" UNIQUE using index "study_maps_user_id_course_id_map_type_key";

alter table "public"."study_maps" add constraint "study_maps_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(auth_id) ON DELETE CASCADE not valid;

alter table "public"."study_maps" validate constraint "study_maps_user_id_fkey";

alter table "public"."user_preferences" add constraint "user_preferences_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(auth_id) ON DELETE CASCADE not valid;

alter table "public"."user_preferences" validate constraint "user_preferences_user_id_fkey";

alter table "public"."user_preferences" add constraint "user_preferences_user_id_key" UNIQUE using index "user_preferences_user_id_key";

alter table "public"."users" add constraint "users_auth_id_fkey" FOREIGN KEY (auth_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."users" validate constraint "users_auth_id_fkey";

alter table "public"."users" add constraint "users_auth_id_key" UNIQUE using index "users_auth_id_key";

alter table "public"."users" add constraint "users_email_key" UNIQUE using index "users_email_key";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.cleanup_old_chat_messages()
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN
    -- Delete messages older than 30 days, except pinned ones
    DELETE FROM chat_messages 
    WHERE created_at < NOW() - INTERVAL '30 days'
    AND is_pinned = FALSE;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.create_user_preferences()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  INSERT INTO user_preferences (user_id)
  VALUES (NEW.auth_id);
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.search_chat_messages(p_session_id uuid, p_search_term text, p_limit integer DEFAULT 50)
 RETURNS TABLE(id uuid, user_name text, message text, processed_content text, created_at timestamp with time zone, relevance real)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        cm.id,
        cm.user_name,
        cm.message,
        cm.processed_content,
        cm.created_at,
        ts_rank(to_tsvector('english', COALESCE(cm.processed_content, cm.message)), plainto_tsquery('english', p_search_term)) as relevance
    FROM chat_messages cm
    WHERE cm.session_id = p_session_id
    AND (
        to_tsvector('english', COALESCE(cm.processed_content, cm.message)) @@ plainto_tsquery('english', p_search_term)
        OR cm.message ILIKE '%' || p_search_term || '%'
        OR cm.processed_content ILIKE '%' || p_search_term || '%'
    )
    ORDER BY relevance DESC, cm.created_at DESC
    LIMIT p_limit;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.set_operation_sequence()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.sequence_number := nextval('mindmap_operation_sequence');
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_last_seen_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.last_seen = NOW();
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_participant_last_seen()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.last_seen := NOW();
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.validate_memory_category()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF NEW.category NOT IN ('Spatial Memory', 'Learning Adventure', 'Emotional Memory', 'Creative Memory', 'Cognitive Memory') THEN
    RAISE EXCEPTION 'Invalid memory category: %', NEW.category;
  END IF;
  RETURN NEW;
END;
$function$
;

grant delete on table "public"."chat_messages" to "anon";

grant insert on table "public"."chat_messages" to "anon";

grant references on table "public"."chat_messages" to "anon";

grant select on table "public"."chat_messages" to "anon";

grant trigger on table "public"."chat_messages" to "anon";

grant truncate on table "public"."chat_messages" to "anon";

grant update on table "public"."chat_messages" to "anon";

grant delete on table "public"."chat_messages" to "authenticated";

grant insert on table "public"."chat_messages" to "authenticated";

grant references on table "public"."chat_messages" to "authenticated";

grant select on table "public"."chat_messages" to "authenticated";

grant trigger on table "public"."chat_messages" to "authenticated";

grant truncate on table "public"."chat_messages" to "authenticated";

grant update on table "public"."chat_messages" to "authenticated";

grant delete on table "public"."chat_messages" to "service_role";

grant insert on table "public"."chat_messages" to "service_role";

grant references on table "public"."chat_messages" to "service_role";

grant select on table "public"."chat_messages" to "service_role";

grant trigger on table "public"."chat_messages" to "service_role";

grant truncate on table "public"."chat_messages" to "service_role";

grant update on table "public"."chat_messages" to "service_role";

grant delete on table "public"."collaboration_sessions" to "anon";

grant insert on table "public"."collaboration_sessions" to "anon";

grant references on table "public"."collaboration_sessions" to "anon";

grant select on table "public"."collaboration_sessions" to "anon";

grant trigger on table "public"."collaboration_sessions" to "anon";

grant truncate on table "public"."collaboration_sessions" to "anon";

grant update on table "public"."collaboration_sessions" to "anon";

grant delete on table "public"."collaboration_sessions" to "authenticated";

grant insert on table "public"."collaboration_sessions" to "authenticated";

grant references on table "public"."collaboration_sessions" to "authenticated";

grant select on table "public"."collaboration_sessions" to "authenticated";

grant trigger on table "public"."collaboration_sessions" to "authenticated";

grant truncate on table "public"."collaboration_sessions" to "authenticated";

grant update on table "public"."collaboration_sessions" to "authenticated";

grant delete on table "public"."collaboration_sessions" to "service_role";

grant insert on table "public"."collaboration_sessions" to "service_role";

grant references on table "public"."collaboration_sessions" to "service_role";

grant select on table "public"."collaboration_sessions" to "service_role";

grant trigger on table "public"."collaboration_sessions" to "service_role";

grant truncate on table "public"."collaboration_sessions" to "service_role";

grant update on table "public"."collaboration_sessions" to "service_role";

grant delete on table "public"."course_analyses" to "anon";

grant insert on table "public"."course_analyses" to "anon";

grant references on table "public"."course_analyses" to "anon";

grant select on table "public"."course_analyses" to "anon";

grant trigger on table "public"."course_analyses" to "anon";

grant truncate on table "public"."course_analyses" to "anon";

grant update on table "public"."course_analyses" to "anon";

grant delete on table "public"."course_analyses" to "authenticated";

grant insert on table "public"."course_analyses" to "authenticated";

grant references on table "public"."course_analyses" to "authenticated";

grant select on table "public"."course_analyses" to "authenticated";

grant trigger on table "public"."course_analyses" to "authenticated";

grant truncate on table "public"."course_analyses" to "authenticated";

grant update on table "public"."course_analyses" to "authenticated";

grant delete on table "public"."course_analyses" to "service_role";

grant insert on table "public"."course_analyses" to "service_role";

grant references on table "public"."course_analyses" to "service_role";

grant select on table "public"."course_analyses" to "service_role";

grant trigger on table "public"."course_analyses" to "service_role";

grant truncate on table "public"."course_analyses" to "service_role";

grant update on table "public"."course_analyses" to "service_role";

grant delete on table "public"."courses" to "anon";

grant insert on table "public"."courses" to "anon";

grant references on table "public"."courses" to "anon";

grant select on table "public"."courses" to "anon";

grant trigger on table "public"."courses" to "anon";

grant truncate on table "public"."courses" to "anon";

grant update on table "public"."courses" to "anon";

grant delete on table "public"."courses" to "authenticated";

grant insert on table "public"."courses" to "authenticated";

grant references on table "public"."courses" to "authenticated";

grant select on table "public"."courses" to "authenticated";

grant trigger on table "public"."courses" to "authenticated";

grant truncate on table "public"."courses" to "authenticated";

grant update on table "public"."courses" to "authenticated";

grant delete on table "public"."courses" to "service_role";

grant insert on table "public"."courses" to "service_role";

grant references on table "public"."courses" to "service_role";

grant select on table "public"."courses" to "service_role";

grant trigger on table "public"."courses" to "service_role";

grant truncate on table "public"."courses" to "service_role";

grant update on table "public"."courses" to "service_role";

grant delete on table "public"."dialogue_sessions" to "anon";

grant insert on table "public"."dialogue_sessions" to "anon";

grant references on table "public"."dialogue_sessions" to "anon";

grant select on table "public"."dialogue_sessions" to "anon";

grant trigger on table "public"."dialogue_sessions" to "anon";

grant truncate on table "public"."dialogue_sessions" to "anon";

grant update on table "public"."dialogue_sessions" to "anon";

grant delete on table "public"."dialogue_sessions" to "authenticated";

grant insert on table "public"."dialogue_sessions" to "authenticated";

grant references on table "public"."dialogue_sessions" to "authenticated";

grant select on table "public"."dialogue_sessions" to "authenticated";

grant trigger on table "public"."dialogue_sessions" to "authenticated";

grant truncate on table "public"."dialogue_sessions" to "authenticated";

grant update on table "public"."dialogue_sessions" to "authenticated";

grant delete on table "public"."dialogue_sessions" to "service_role";

grant insert on table "public"."dialogue_sessions" to "service_role";

grant references on table "public"."dialogue_sessions" to "service_role";

grant select on table "public"."dialogue_sessions" to "service_role";

grant trigger on table "public"."dialogue_sessions" to "service_role";

grant truncate on table "public"."dialogue_sessions" to "service_role";

grant update on table "public"."dialogue_sessions" to "service_role";

grant delete on table "public"."epistemic_driver_history" to "anon";

grant insert on table "public"."epistemic_driver_history" to "anon";

grant references on table "public"."epistemic_driver_history" to "anon";

grant select on table "public"."epistemic_driver_history" to "anon";

grant trigger on table "public"."epistemic_driver_history" to "anon";

grant truncate on table "public"."epistemic_driver_history" to "anon";

grant update on table "public"."epistemic_driver_history" to "anon";

grant delete on table "public"."epistemic_driver_history" to "authenticated";

grant insert on table "public"."epistemic_driver_history" to "authenticated";

grant references on table "public"."epistemic_driver_history" to "authenticated";

grant select on table "public"."epistemic_driver_history" to "authenticated";

grant trigger on table "public"."epistemic_driver_history" to "authenticated";

grant truncate on table "public"."epistemic_driver_history" to "authenticated";

grant update on table "public"."epistemic_driver_history" to "authenticated";

grant delete on table "public"."epistemic_driver_history" to "service_role";

grant insert on table "public"."epistemic_driver_history" to "service_role";

grant references on table "public"."epistemic_driver_history" to "service_role";

grant select on table "public"."epistemic_driver_history" to "service_role";

grant trigger on table "public"."epistemic_driver_history" to "service_role";

grant truncate on table "public"."epistemic_driver_history" to "service_role";

grant update on table "public"."epistemic_driver_history" to "service_role";

grant delete on table "public"."memories" to "anon";

grant insert on table "public"."memories" to "anon";

grant references on table "public"."memories" to "anon";

grant select on table "public"."memories" to "anon";

grant trigger on table "public"."memories" to "anon";

grant truncate on table "public"."memories" to "anon";

grant update on table "public"."memories" to "anon";

grant delete on table "public"."memories" to "authenticated";

grant insert on table "public"."memories" to "authenticated";

grant references on table "public"."memories" to "authenticated";

grant select on table "public"."memories" to "authenticated";

grant trigger on table "public"."memories" to "authenticated";

grant truncate on table "public"."memories" to "authenticated";

grant update on table "public"."memories" to "authenticated";

grant delete on table "public"."memories" to "service_role";

grant insert on table "public"."memories" to "service_role";

grant references on table "public"."memories" to "service_role";

grant select on table "public"."memories" to "service_role";

grant trigger on table "public"."memories" to "service_role";

grant truncate on table "public"."memories" to "service_role";

grant update on table "public"."memories" to "service_role";

grant delete on table "public"."memory_links" to "anon";

grant insert on table "public"."memory_links" to "anon";

grant references on table "public"."memory_links" to "anon";

grant select on table "public"."memory_links" to "anon";

grant trigger on table "public"."memory_links" to "anon";

grant truncate on table "public"."memory_links" to "anon";

grant update on table "public"."memory_links" to "anon";

grant delete on table "public"."memory_links" to "authenticated";

grant insert on table "public"."memory_links" to "authenticated";

grant references on table "public"."memory_links" to "authenticated";

grant select on table "public"."memory_links" to "authenticated";

grant trigger on table "public"."memory_links" to "authenticated";

grant truncate on table "public"."memory_links" to "authenticated";

grant update on table "public"."memory_links" to "authenticated";

grant delete on table "public"."memory_links" to "service_role";

grant insert on table "public"."memory_links" to "service_role";

grant references on table "public"."memory_links" to "service_role";

grant select on table "public"."memory_links" to "service_role";

grant trigger on table "public"."memory_links" to "service_role";

grant truncate on table "public"."memory_links" to "service_role";

grant update on table "public"."memory_links" to "service_role";

grant delete on table "public"."mindmap_operations" to "anon";

grant insert on table "public"."mindmap_operations" to "anon";

grant references on table "public"."mindmap_operations" to "anon";

grant select on table "public"."mindmap_operations" to "anon";

grant trigger on table "public"."mindmap_operations" to "anon";

grant truncate on table "public"."mindmap_operations" to "anon";

grant update on table "public"."mindmap_operations" to "anon";

grant delete on table "public"."mindmap_operations" to "authenticated";

grant insert on table "public"."mindmap_operations" to "authenticated";

grant references on table "public"."mindmap_operations" to "authenticated";

grant select on table "public"."mindmap_operations" to "authenticated";

grant trigger on table "public"."mindmap_operations" to "authenticated";

grant truncate on table "public"."mindmap_operations" to "authenticated";

grant update on table "public"."mindmap_operations" to "authenticated";

grant delete on table "public"."mindmap_operations" to "service_role";

grant insert on table "public"."mindmap_operations" to "service_role";

grant references on table "public"."mindmap_operations" to "service_role";

grant select on table "public"."mindmap_operations" to "service_role";

grant trigger on table "public"."mindmap_operations" to "service_role";

grant truncate on table "public"."mindmap_operations" to "service_role";

grant update on table "public"."mindmap_operations" to "service_role";

grant delete on table "public"."mindmap_results" to "anon";

grant insert on table "public"."mindmap_results" to "anon";

grant references on table "public"."mindmap_results" to "anon";

grant select on table "public"."mindmap_results" to "anon";

grant trigger on table "public"."mindmap_results" to "anon";

grant truncate on table "public"."mindmap_results" to "anon";

grant update on table "public"."mindmap_results" to "anon";

grant delete on table "public"."mindmap_results" to "authenticated";

grant insert on table "public"."mindmap_results" to "authenticated";

grant references on table "public"."mindmap_results" to "authenticated";

grant select on table "public"."mindmap_results" to "authenticated";

grant trigger on table "public"."mindmap_results" to "authenticated";

grant truncate on table "public"."mindmap_results" to "authenticated";

grant update on table "public"."mindmap_results" to "authenticated";

grant delete on table "public"."mindmap_results" to "service_role";

grant insert on table "public"."mindmap_results" to "service_role";

grant references on table "public"."mindmap_results" to "service_role";

grant select on table "public"."mindmap_results" to "service_role";

grant trigger on table "public"."mindmap_results" to "service_role";

grant truncate on table "public"."mindmap_results" to "service_role";

grant update on table "public"."mindmap_results" to "service_role";

grant delete on table "public"."mindmap_snapshots" to "anon";

grant insert on table "public"."mindmap_snapshots" to "anon";

grant references on table "public"."mindmap_snapshots" to "anon";

grant select on table "public"."mindmap_snapshots" to "anon";

grant trigger on table "public"."mindmap_snapshots" to "anon";

grant truncate on table "public"."mindmap_snapshots" to "anon";

grant update on table "public"."mindmap_snapshots" to "anon";

grant delete on table "public"."mindmap_snapshots" to "authenticated";

grant insert on table "public"."mindmap_snapshots" to "authenticated";

grant references on table "public"."mindmap_snapshots" to "authenticated";

grant select on table "public"."mindmap_snapshots" to "authenticated";

grant trigger on table "public"."mindmap_snapshots" to "authenticated";

grant truncate on table "public"."mindmap_snapshots" to "authenticated";

grant update on table "public"."mindmap_snapshots" to "authenticated";

grant delete on table "public"."mindmap_snapshots" to "service_role";

grant insert on table "public"."mindmap_snapshots" to "service_role";

grant references on table "public"."mindmap_snapshots" to "service_role";

grant select on table "public"."mindmap_snapshots" to "service_role";

grant trigger on table "public"."mindmap_snapshots" to "service_role";

grant truncate on table "public"."mindmap_snapshots" to "service_role";

grant update on table "public"."mindmap_snapshots" to "service_role";

grant delete on table "public"."session_participants" to "anon";

grant insert on table "public"."session_participants" to "anon";

grant references on table "public"."session_participants" to "anon";

grant select on table "public"."session_participants" to "anon";

grant trigger on table "public"."session_participants" to "anon";

grant truncate on table "public"."session_participants" to "anon";

grant update on table "public"."session_participants" to "anon";

grant delete on table "public"."session_participants" to "authenticated";

grant insert on table "public"."session_participants" to "authenticated";

grant references on table "public"."session_participants" to "authenticated";

grant select on table "public"."session_participants" to "authenticated";

grant trigger on table "public"."session_participants" to "authenticated";

grant truncate on table "public"."session_participants" to "authenticated";

grant update on table "public"."session_participants" to "authenticated";

grant delete on table "public"."session_participants" to "service_role";

grant insert on table "public"."session_participants" to "service_role";

grant references on table "public"."session_participants" to "service_role";

grant select on table "public"."session_participants" to "service_role";

grant trigger on table "public"."session_participants" to "service_role";

grant truncate on table "public"."session_participants" to "service_role";

grant update on table "public"."session_participants" to "service_role";

grant delete on table "public"."study_maps" to "anon";

grant insert on table "public"."study_maps" to "anon";

grant references on table "public"."study_maps" to "anon";

grant select on table "public"."study_maps" to "anon";

grant trigger on table "public"."study_maps" to "anon";

grant truncate on table "public"."study_maps" to "anon";

grant update on table "public"."study_maps" to "anon";

grant delete on table "public"."study_maps" to "authenticated";

grant insert on table "public"."study_maps" to "authenticated";

grant references on table "public"."study_maps" to "authenticated";

grant select on table "public"."study_maps" to "authenticated";

grant trigger on table "public"."study_maps" to "authenticated";

grant truncate on table "public"."study_maps" to "authenticated";

grant update on table "public"."study_maps" to "authenticated";

grant delete on table "public"."study_maps" to "service_role";

grant insert on table "public"."study_maps" to "service_role";

grant references on table "public"."study_maps" to "service_role";

grant select on table "public"."study_maps" to "service_role";

grant trigger on table "public"."study_maps" to "service_role";

grant truncate on table "public"."study_maps" to "service_role";

grant update on table "public"."study_maps" to "service_role";

grant delete on table "public"."user_preferences" to "anon";

grant insert on table "public"."user_preferences" to "anon";

grant references on table "public"."user_preferences" to "anon";

grant select on table "public"."user_preferences" to "anon";

grant trigger on table "public"."user_preferences" to "anon";

grant truncate on table "public"."user_preferences" to "anon";

grant update on table "public"."user_preferences" to "anon";

grant delete on table "public"."user_preferences" to "authenticated";

grant insert on table "public"."user_preferences" to "authenticated";

grant references on table "public"."user_preferences" to "authenticated";

grant select on table "public"."user_preferences" to "authenticated";

grant trigger on table "public"."user_preferences" to "authenticated";

grant truncate on table "public"."user_preferences" to "authenticated";

grant update on table "public"."user_preferences" to "authenticated";

grant delete on table "public"."user_preferences" to "service_role";

grant insert on table "public"."user_preferences" to "service_role";

grant references on table "public"."user_preferences" to "service_role";

grant select on table "public"."user_preferences" to "service_role";

grant trigger on table "public"."user_preferences" to "service_role";

grant truncate on table "public"."user_preferences" to "service_role";

grant update on table "public"."user_preferences" to "service_role";

grant delete on table "public"."users" to "anon";

grant insert on table "public"."users" to "anon";

grant references on table "public"."users" to "anon";

grant select on table "public"."users" to "anon";

grant trigger on table "public"."users" to "anon";

grant truncate on table "public"."users" to "anon";

grant update on table "public"."users" to "anon";

grant delete on table "public"."users" to "authenticated";

grant insert on table "public"."users" to "authenticated";

grant references on table "public"."users" to "authenticated";

grant select on table "public"."users" to "authenticated";

grant trigger on table "public"."users" to "authenticated";

grant truncate on table "public"."users" to "authenticated";

grant update on table "public"."users" to "authenticated";

grant delete on table "public"."users" to "service_role";

grant insert on table "public"."users" to "service_role";

grant references on table "public"."users" to "service_role";

grant select on table "public"."users" to "service_role";

grant trigger on table "public"."users" to "service_role";

grant truncate on table "public"."users" to "service_role";

grant update on table "public"."users" to "service_role";

create policy "Allow AI assistant messages"
on "public"."chat_messages"
as permissive
for all
to service_role
using (true)
with check (true);


create policy "Users can update their own chat messages"
on "public"."chat_messages"
as permissive
for update
to authenticated
using ((user_id = auth.uid()))
with check ((user_id = auth.uid()));


create policy "chat_messages_insert"
on "public"."chat_messages"
as permissive
for insert
to authenticated
with check (((user_id = auth.uid()) AND ((EXISTS ( SELECT 1
   FROM collaboration_sessions cs
  WHERE ((cs.id = chat_messages.session_id) AND (cs.created_by = auth.uid())))) OR (EXISTS ( SELECT 1
   FROM session_participants sp
  WHERE ((sp.session_id = chat_messages.session_id) AND (sp.user_id = auth.uid()) AND (sp.role = ANY (ARRAY['facilitator'::text, 'participant'::text]))))))));


create policy "chat_messages_select"
on "public"."chat_messages"
as permissive
for select
to authenticated
using (((EXISTS ( SELECT 1
   FROM collaboration_sessions cs
  WHERE ((cs.id = chat_messages.session_id) AND (cs.created_by = auth.uid())))) OR (EXISTS ( SELECT 1
   FROM session_participants sp
  WHERE ((sp.session_id = chat_messages.session_id) AND (sp.user_id = auth.uid()))))));


create policy "collaboration_sessions_delete"
on "public"."collaboration_sessions"
as permissive
for delete
to authenticated
using ((created_by = auth.uid()));


create policy "collaboration_sessions_insert"
on "public"."collaboration_sessions"
as permissive
for insert
to authenticated
with check ((created_by = auth.uid()));


create policy "collaboration_sessions_select"
on "public"."collaboration_sessions"
as permissive
for select
to authenticated
using ((created_by = auth.uid()));


create policy "collaboration_sessions_update"
on "public"."collaboration_sessions"
as permissive
for update
to authenticated
using ((created_by = auth.uid()))
with check ((created_by = auth.uid()));


create policy "Users can delete own course analyses"
on "public"."course_analyses"
as permissive
for delete
to authenticated
using ((auth.uid() = user_id));


create policy "Users can insert own course analyses"
on "public"."course_analyses"
as permissive
for insert
to authenticated
with check ((auth.uid() = user_id));


create policy "Users can read own course analyses"
on "public"."course_analyses"
as permissive
for select
to authenticated
using ((auth.uid() = user_id));


create policy "Users can update own course analyses"
on "public"."course_analyses"
as permissive
for update
to authenticated
using ((auth.uid() = user_id));


create policy "Authenticated users can read courses"
on "public"."courses"
as permissive
for select
to authenticated
using ((is_active = true));


create policy "Users can delete own dialogue sessions"
on "public"."dialogue_sessions"
as permissive
for delete
to authenticated
using ((auth.uid() = user_id));


create policy "Users can insert own dialogue sessions"
on "public"."dialogue_sessions"
as permissive
for insert
to authenticated
with check ((auth.uid() = user_id));


create policy "Users can read own dialogue sessions"
on "public"."dialogue_sessions"
as permissive
for select
to authenticated
using ((auth.uid() = user_id));


create policy "Users can update own dialogue sessions"
on "public"."dialogue_sessions"
as permissive
for update
to authenticated
using ((auth.uid() = user_id));


create policy "Users can create their own epistemic driver history"
on "public"."epistemic_driver_history"
as permissive
for insert
to authenticated
with check ((auth.uid() = user_id));


create policy "Users can delete their own epistemic driver history"
on "public"."epistemic_driver_history"
as permissive
for delete
to authenticated
using ((auth.uid() = user_id));


create policy "Users can update their own epistemic driver history"
on "public"."epistemic_driver_history"
as permissive
for update
to authenticated
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));


create policy "Users can view their own epistemic driver history"
on "public"."epistemic_driver_history"
as permissive
for select
to authenticated
using ((auth.uid() = user_id));


create policy "Users can create their own memories"
on "public"."memories"
as permissive
for insert
to authenticated
with check ((auth.uid() = user_id));


create policy "Users can delete own memories"
on "public"."memories"
as permissive
for delete
to authenticated
using ((auth.uid() = user_id));


create policy "Users can delete their own memories"
on "public"."memories"
as permissive
for delete
to authenticated
using ((auth.uid() = user_id));


create policy "Users can insert own memories"
on "public"."memories"
as permissive
for insert
to authenticated
with check ((auth.uid() = user_id));


create policy "Users can read own memories"
on "public"."memories"
as permissive
for select
to authenticated
using ((auth.uid() = user_id));


create policy "Users can update own memories"
on "public"."memories"
as permissive
for update
to authenticated
using ((auth.uid() = user_id));


create policy "Users can update their own memories"
on "public"."memories"
as permissive
for update
to authenticated
using ((auth.uid() = user_id));


create policy "Users can view their own memories"
on "public"."memories"
as permissive
for select
to authenticated
using ((auth.uid() = user_id));


create policy "Users can delete own memory links"
on "public"."memory_links"
as permissive
for delete
to authenticated
using ((auth.uid() = user_id));


create policy "Users can insert own memory links"
on "public"."memory_links"
as permissive
for insert
to authenticated
with check ((auth.uid() = user_id));


create policy "Users can read own memory links"
on "public"."memory_links"
as permissive
for select
to authenticated
using ((auth.uid() = user_id));


create policy "Users can update own memory links"
on "public"."memory_links"
as permissive
for update
to authenticated
using ((auth.uid() = user_id));


create policy "Participants can view operations in their sessions"
on "public"."mindmap_operations"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM session_participants
  WHERE ((session_participants.session_id = mindmap_operations.session_id) AND (session_participants.user_id = auth.uid())))));


create policy "mindmap_operations_insert"
on "public"."mindmap_operations"
as permissive
for insert
to authenticated
with check (((user_id = auth.uid()) AND ((EXISTS ( SELECT 1
   FROM collaboration_sessions cs
  WHERE ((cs.id = mindmap_operations.session_id) AND (cs.created_by = auth.uid())))) OR (EXISTS ( SELECT 1
   FROM session_participants sp
  WHERE ((sp.session_id = mindmap_operations.session_id) AND (sp.user_id = auth.uid()) AND (sp.role = ANY (ARRAY['facilitator'::text, 'participant'::text]))))))));


create policy "mindmap_operations_select"
on "public"."mindmap_operations"
as permissive
for select
to authenticated
using (((EXISTS ( SELECT 1
   FROM collaboration_sessions cs
  WHERE ((cs.id = mindmap_operations.session_id) AND (cs.created_by = auth.uid())))) OR (EXISTS ( SELECT 1
   FROM session_participants sp
  WHERE ((sp.session_id = mindmap_operations.session_id) AND (sp.user_id = auth.uid()))))));


create policy "mindmap_operations_update"
on "public"."mindmap_operations"
as permissive
for update
to authenticated
using ((user_id = auth.uid()))
with check ((user_id = auth.uid()));


create policy "Service can insert mindmap results"
on "public"."mindmap_results"
as permissive
for insert
to authenticated
with check (true);


create policy "Service can update mindmap results"
on "public"."mindmap_results"
as permissive
for update
to authenticated
using (true);


create policy "Users can view their own mindmap results"
on "public"."mindmap_results"
as permissive
for select
to authenticated
using (((auth.uid() = user_id) OR (user_id IS NULL)));


create policy "mindmap_snapshots_insert"
on "public"."mindmap_snapshots"
as permissive
for insert
to authenticated
with check (((created_by = auth.uid()) AND ((EXISTS ( SELECT 1
   FROM collaboration_sessions cs
  WHERE ((cs.id = mindmap_snapshots.session_id) AND (cs.created_by = auth.uid())))) OR (EXISTS ( SELECT 1
   FROM session_participants sp
  WHERE ((sp.session_id = mindmap_snapshots.session_id) AND (sp.user_id = auth.uid()) AND (sp.role = ANY (ARRAY['facilitator'::text, 'participant'::text]))))))));


create policy "mindmap_snapshots_select"
on "public"."mindmap_snapshots"
as permissive
for select
to authenticated
using (((EXISTS ( SELECT 1
   FROM collaboration_sessions cs
  WHERE ((cs.id = mindmap_snapshots.session_id) AND (cs.created_by = auth.uid())))) OR (EXISTS ( SELECT 1
   FROM session_participants sp
  WHERE ((sp.session_id = mindmap_snapshots.session_id) AND (sp.user_id = auth.uid()))))));


create policy "session_participants_delete"
on "public"."session_participants"
as permissive
for delete
to authenticated
using ((user_id = auth.uid()));


create policy "session_participants_insert"
on "public"."session_participants"
as permissive
for insert
to authenticated
with check ((user_id = auth.uid()));


create policy "session_participants_select"
on "public"."session_participants"
as permissive
for select
to authenticated
using (((user_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM collaboration_sessions cs
  WHERE ((cs.id = session_participants.session_id) AND (cs.created_by = auth.uid()))))));


create policy "session_participants_update"
on "public"."session_participants"
as permissive
for update
to authenticated
using ((user_id = auth.uid()))
with check ((user_id = auth.uid()));


create policy "Users can delete own study maps"
on "public"."study_maps"
as permissive
for delete
to authenticated
using ((auth.uid() = user_id));


create policy "Users can insert own study maps"
on "public"."study_maps"
as permissive
for insert
to authenticated
with check ((auth.uid() = user_id));


create policy "Users can read own study maps"
on "public"."study_maps"
as permissive
for select
to authenticated
using ((auth.uid() = user_id));


create policy "Users can update own study maps"
on "public"."study_maps"
as permissive
for update
to authenticated
using ((auth.uid() = user_id));


create policy "Users can insert own preferences"
on "public"."user_preferences"
as permissive
for insert
to authenticated
with check ((auth.uid() = user_id));


create policy "Users can read own preferences"
on "public"."user_preferences"
as permissive
for select
to authenticated
using ((auth.uid() = user_id));


create policy "Users can update own preferences"
on "public"."user_preferences"
as permissive
for update
to authenticated
using ((auth.uid() = user_id));


create policy "Users can insert own profile"
on "public"."users"
as permissive
for insert
to authenticated
with check ((auth.uid() = auth_id));


create policy "Users can read own profile"
on "public"."users"
as permissive
for select
to authenticated
using ((auth.uid() = auth_id));


create policy "Users can update own profile"
on "public"."users"
as permissive
for update
to authenticated
using ((auth.uid() = auth_id));


CREATE TRIGGER update_chat_messages_edited_at BEFORE UPDATE ON public.chat_messages FOR EACH ROW WHEN ((old.message IS DISTINCT FROM new.message)) EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_collaboration_sessions_updated_at BEFORE UPDATE ON public.collaboration_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_course_analyses_updated_at BEFORE UPDATE ON public.course_analyses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON public.courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dialogue_sessions_updated_at BEFORE UPDATE ON public.dialogue_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_epistemic_driver_history_updated_at BEFORE UPDATE ON public.epistemic_driver_history FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_memories_updated_at BEFORE UPDATE ON public.memories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER validate_memory_category_trigger BEFORE INSERT OR UPDATE ON public.memories FOR EACH ROW EXECUTE FUNCTION validate_memory_category();

CREATE TRIGGER update_memory_links_updated_at BEFORE UPDATE ON public.memory_links FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_set_operation_sequence BEFORE INSERT ON public.mindmap_operations FOR EACH ROW EXECUTE FUNCTION set_operation_sequence();

CREATE TRIGGER trigger_update_last_seen BEFORE UPDATE ON public.session_participants FOR EACH ROW EXECUTE FUNCTION update_participant_last_seen();

CREATE TRIGGER update_session_participants_last_seen BEFORE UPDATE ON public.session_participants FOR EACH ROW EXECUTE FUNCTION update_last_seen_column();

CREATE TRIGGER update_study_maps_updated_at BEFORE UPDATE ON public.study_maps FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON public.user_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER create_user_preferences_trigger AFTER INSERT ON public.users FOR EACH ROW EXECUTE FUNCTION create_user_preferences();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


