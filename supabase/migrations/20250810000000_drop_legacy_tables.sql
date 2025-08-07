-- Drop legacy tables that are not needed for Proforma application
-- These tables are related to course analysis, dialogue sessions, epistemic driver history, and mindmap operations

-- Drop tables in correct order to handle dependencies
DROP TABLE IF EXISTS "public"."course_analyses" CASCADE;
DROP TABLE IF EXISTS "public"."dialogue_sessions" CASCADE;
DROP TABLE IF EXISTS "public"."epistemic_driver_history" CASCADE;
DROP TABLE IF EXISTS "public"."mindmap_operations" CASCADE;
DROP TABLE IF EXISTS "public"."mindmap_results" CASCADE;
DROP TABLE IF EXISTS "public"."mindmap_snapshots" CASCADE;
DROP TABLE IF EXISTS "public"."session_participants" CASCADE;
DROP TABLE IF EXISTS "public"."study_maps" CASCADE;
DROP TABLE IF EXISTS "public"."collaboration_sessions" CASCADE;
DROP TABLE IF EXISTS "public"."chat_messages" CASCADE;
DROP TABLE IF EXISTS "public"."memories" CASCADE;
DROP TABLE IF EXISTS "public"."memory_links" CASCADE;

-- Drop any remaining sequences or types related to these tables
DROP SEQUENCE IF EXISTS "public"."course_analyses_id_seq" CASCADE;
DROP SEQUENCE IF EXISTS "public"."dialogue_sessions_id_seq" CASCADE;
DROP SEQUENCE IF EXISTS "public"."epistemic_driver_history_id_seq" CASCADE;
DROP SEQUENCE IF EXISTS "public"."mindmap_operations_id_seq" CASCADE;

-- Clean up any remaining indexes that might exist
DROP INDEX IF EXISTS "public"."idx_course_analyses_user_id";
DROP INDEX IF EXISTS "public"."idx_dialogue_sessions_user_id";
DROP INDEX IF EXISTS "public"."idx_dialogue_sessions_status";
DROP INDEX IF EXISTS "public"."idx_dialogue_sessions_memory_link_id";
DROP INDEX IF EXISTS "public"."idx_epistemic_driver_history_user_id";
DROP INDEX IF EXISTS "public"."idx_mindmap_operations_user_id";
DROP INDEX IF EXISTS "public"."idx_mindmap_operations_session_id";
DROP INDEX IF EXISTS "public"."idx_memories_user_id";
DROP INDEX IF EXISTS "public"."idx_memories_category";
DROP INDEX IF EXISTS "public"."idx_memories_created_at";
DROP INDEX IF EXISTS "public"."idx_memory_links_user_id";
DROP INDEX IF EXISTS "public"."idx_memory_links_status";
DROP INDEX IF EXISTS "public"."idx_chat_messages_session";
DROP INDEX IF EXISTS "public"."idx_chat_messages_user";
DROP INDEX IF EXISTS "public"."idx_chat_messages_created_at";
DROP INDEX IF EXISTS "public"."idx_chat_messages_type";
DROP INDEX IF EXISTS "public"."idx_chat_messages_thread";
DROP INDEX IF EXISTS "public"."idx_chat_messages_pinned";

-- Drop any functions related to these tables
DROP FUNCTION IF EXISTS "public"."update_dialogue_sessions_updated_at"() CASCADE;
DROP FUNCTION IF EXISTS "public"."update_epistemic_driver_history_updated_at"() CASCADE;
DROP FUNCTION IF EXISTS "public"."update_memories_updated_at"() CASCADE;
DROP FUNCTION IF EXISTS "public"."update_memory_links_updated_at"() CASCADE;

COMMIT;