drop trigger if exists "update_chat_messages_edited_at" on "public"."chat_messages";

drop trigger if exists "update_collaboration_sessions_updated_at" on "public"."collaboration_sessions";

drop trigger if exists "update_course_analyses_updated_at" on "public"."course_analyses";

drop trigger if exists "update_courses_updated_at" on "public"."courses";

drop trigger if exists "update_customers_updated_at" on "public"."customers";

drop trigger if exists "update_dialogue_sessions_updated_at" on "public"."dialogue_sessions";

drop trigger if exists "update_epistemic_driver_history_updated_at" on "public"."epistemic_driver_history";

drop trigger if exists "update_invoices_updated_at" on "public"."invoices";

drop trigger if exists "update_memories_updated_at" on "public"."memories";

drop trigger if exists "validate_memory_category_trigger" on "public"."memories";

drop trigger if exists "update_memory_links_updated_at" on "public"."memory_links";

drop trigger if exists "trigger_set_operation_sequence" on "public"."mindmap_operations";

drop trigger if exists "update_quotes_updated_at" on "public"."quotes";

drop trigger if exists "trigger_update_last_seen" on "public"."session_participants";

drop trigger if exists "update_session_participants_last_seen" on "public"."session_participants";

drop trigger if exists "update_study_maps_updated_at" on "public"."study_maps";

drop trigger if exists "update_user_preferences_updated_at" on "public"."user_preferences";

drop trigger if exists "create_user_preferences_trigger" on "public"."users";

drop trigger if exists "update_users_updated_at" on "public"."users";

drop policy "Allow AI assistant messages" on "public"."chat_messages";

drop policy "Users can update their own chat messages" on "public"."chat_messages";

drop policy "chat_messages_insert" on "public"."chat_messages";

drop policy "chat_messages_select" on "public"."chat_messages";

drop policy "collaboration_sessions_delete" on "public"."collaboration_sessions";

drop policy "collaboration_sessions_insert" on "public"."collaboration_sessions";

drop policy "collaboration_sessions_select" on "public"."collaboration_sessions";

drop policy "collaboration_sessions_update" on "public"."collaboration_sessions";

drop policy "Users can delete own course analyses" on "public"."course_analyses";

drop policy "Users can insert own course analyses" on "public"."course_analyses";

drop policy "Users can read own course analyses" on "public"."course_analyses";

drop policy "Users can update own course analyses" on "public"."course_analyses";

drop policy "Authenticated users can read courses" on "public"."courses";

drop policy "Users can manage their own customers" on "public"."customers";

drop policy "Users can delete own dialogue sessions" on "public"."dialogue_sessions";

drop policy "Users can insert own dialogue sessions" on "public"."dialogue_sessions";

drop policy "Users can read own dialogue sessions" on "public"."dialogue_sessions";

drop policy "Users can update own dialogue sessions" on "public"."dialogue_sessions";

drop policy "Users can create their own epistemic driver history" on "public"."epistemic_driver_history";

drop policy "Users can delete their own epistemic driver history" on "public"."epistemic_driver_history";

drop policy "Users can update their own epistemic driver history" on "public"."epistemic_driver_history";

drop policy "Users can view their own epistemic driver history" on "public"."epistemic_driver_history";

drop policy "Users can create their own memories" on "public"."memories";

drop policy "Users can delete own memories" on "public"."memories";

drop policy "Users can delete their own memories" on "public"."memories";

drop policy "Users can insert own memories" on "public"."memories";

drop policy "Users can read own memories" on "public"."memories";

drop policy "Users can update own memories" on "public"."memories";

drop policy "Users can update their own memories" on "public"."memories";

drop policy "Users can view their own memories" on "public"."memories";

drop policy "Users can delete own memory links" on "public"."memory_links";

drop policy "Users can insert own memory links" on "public"."memory_links";

drop policy "Users can read own memory links" on "public"."memory_links";

drop policy "Users can update own memory links" on "public"."memory_links";

drop policy "Participants can view operations in their sessions" on "public"."mindmap_operations";

drop policy "mindmap_operations_insert" on "public"."mindmap_operations";

drop policy "mindmap_operations_select" on "public"."mindmap_operations";

drop policy "mindmap_operations_update" on "public"."mindmap_operations";

drop policy "Service can insert mindmap results" on "public"."mindmap_results";

drop policy "Service can update mindmap results" on "public"."mindmap_results";

drop policy "Users can view their own mindmap results" on "public"."mindmap_results";

drop policy "mindmap_snapshots_insert" on "public"."mindmap_snapshots";

drop policy "mindmap_snapshots_select" on "public"."mindmap_snapshots";

drop policy "session_participants_delete" on "public"."session_participants";

drop policy "session_participants_insert" on "public"."session_participants";

drop policy "session_participants_select" on "public"."session_participants";

drop policy "session_participants_update" on "public"."session_participants";

drop policy "Users can delete own study maps" on "public"."study_maps";

drop policy "Users can insert own study maps" on "public"."study_maps";

drop policy "Users can read own study maps" on "public"."study_maps";

drop policy "Users can update own study maps" on "public"."study_maps";

drop policy "Users can insert own preferences" on "public"."user_preferences";

drop policy "Users can read own preferences" on "public"."user_preferences";

drop policy "Users can update own preferences" on "public"."user_preferences";

drop policy "Users can insert own profile" on "public"."users";

drop policy "Users can read own profile" on "public"."users";

drop policy "Users can update own profile" on "public"."users";

drop policy "Users can manage their own invoices" on "public"."invoices";

drop policy "Users can manage their own quotes" on "public"."quotes";

revoke delete on table "public"."chat_messages" from "anon";

revoke insert on table "public"."chat_messages" from "anon";

revoke references on table "public"."chat_messages" from "anon";

revoke select on table "public"."chat_messages" from "anon";

revoke trigger on table "public"."chat_messages" from "anon";

revoke truncate on table "public"."chat_messages" from "anon";

revoke update on table "public"."chat_messages" from "anon";

revoke delete on table "public"."chat_messages" from "authenticated";

revoke insert on table "public"."chat_messages" from "authenticated";

revoke references on table "public"."chat_messages" from "authenticated";

revoke select on table "public"."chat_messages" from "authenticated";

revoke trigger on table "public"."chat_messages" from "authenticated";

revoke truncate on table "public"."chat_messages" from "authenticated";

revoke update on table "public"."chat_messages" from "authenticated";

revoke delete on table "public"."chat_messages" from "service_role";

revoke insert on table "public"."chat_messages" from "service_role";

revoke references on table "public"."chat_messages" from "service_role";

revoke select on table "public"."chat_messages" from "service_role";

revoke trigger on table "public"."chat_messages" from "service_role";

revoke truncate on table "public"."chat_messages" from "service_role";

revoke update on table "public"."chat_messages" from "service_role";

revoke delete on table "public"."collaboration_sessions" from "anon";

revoke insert on table "public"."collaboration_sessions" from "anon";

revoke references on table "public"."collaboration_sessions" from "anon";

revoke select on table "public"."collaboration_sessions" from "anon";

revoke trigger on table "public"."collaboration_sessions" from "anon";

revoke truncate on table "public"."collaboration_sessions" from "anon";

revoke update on table "public"."collaboration_sessions" from "anon";

revoke delete on table "public"."collaboration_sessions" from "authenticated";

revoke insert on table "public"."collaboration_sessions" from "authenticated";

revoke references on table "public"."collaboration_sessions" from "authenticated";

revoke select on table "public"."collaboration_sessions" from "authenticated";

revoke trigger on table "public"."collaboration_sessions" from "authenticated";

revoke truncate on table "public"."collaboration_sessions" from "authenticated";

revoke update on table "public"."collaboration_sessions" from "authenticated";

revoke delete on table "public"."collaboration_sessions" from "service_role";

revoke insert on table "public"."collaboration_sessions" from "service_role";

revoke references on table "public"."collaboration_sessions" from "service_role";

revoke select on table "public"."collaboration_sessions" from "service_role";

revoke trigger on table "public"."collaboration_sessions" from "service_role";

revoke truncate on table "public"."collaboration_sessions" from "service_role";

revoke update on table "public"."collaboration_sessions" from "service_role";

revoke delete on table "public"."course_analyses" from "anon";

revoke insert on table "public"."course_analyses" from "anon";

revoke references on table "public"."course_analyses" from "anon";

revoke select on table "public"."course_analyses" from "anon";

revoke trigger on table "public"."course_analyses" from "anon";

revoke truncate on table "public"."course_analyses" from "anon";

revoke update on table "public"."course_analyses" from "anon";

revoke delete on table "public"."course_analyses" from "authenticated";

revoke insert on table "public"."course_analyses" from "authenticated";

revoke references on table "public"."course_analyses" from "authenticated";

revoke select on table "public"."course_analyses" from "authenticated";

revoke trigger on table "public"."course_analyses" from "authenticated";

revoke truncate on table "public"."course_analyses" from "authenticated";

revoke update on table "public"."course_analyses" from "authenticated";

revoke delete on table "public"."course_analyses" from "service_role";

revoke insert on table "public"."course_analyses" from "service_role";

revoke references on table "public"."course_analyses" from "service_role";

revoke select on table "public"."course_analyses" from "service_role";

revoke trigger on table "public"."course_analyses" from "service_role";

revoke truncate on table "public"."course_analyses" from "service_role";

revoke update on table "public"."course_analyses" from "service_role";

revoke delete on table "public"."courses" from "anon";

revoke insert on table "public"."courses" from "anon";

revoke references on table "public"."courses" from "anon";

revoke select on table "public"."courses" from "anon";

revoke trigger on table "public"."courses" from "anon";

revoke truncate on table "public"."courses" from "anon";

revoke update on table "public"."courses" from "anon";

revoke delete on table "public"."courses" from "authenticated";

revoke insert on table "public"."courses" from "authenticated";

revoke references on table "public"."courses" from "authenticated";

revoke select on table "public"."courses" from "authenticated";

revoke trigger on table "public"."courses" from "authenticated";

revoke truncate on table "public"."courses" from "authenticated";

revoke update on table "public"."courses" from "authenticated";

revoke delete on table "public"."courses" from "service_role";

revoke insert on table "public"."courses" from "service_role";

revoke references on table "public"."courses" from "service_role";

revoke select on table "public"."courses" from "service_role";

revoke trigger on table "public"."courses" from "service_role";

revoke truncate on table "public"."courses" from "service_role";

revoke update on table "public"."courses" from "service_role";

revoke delete on table "public"."customers" from "anon";

revoke insert on table "public"."customers" from "anon";

revoke references on table "public"."customers" from "anon";

revoke select on table "public"."customers" from "anon";

revoke trigger on table "public"."customers" from "anon";

revoke truncate on table "public"."customers" from "anon";

revoke update on table "public"."customers" from "anon";

revoke delete on table "public"."customers" from "authenticated";

revoke insert on table "public"."customers" from "authenticated";

revoke references on table "public"."customers" from "authenticated";

revoke select on table "public"."customers" from "authenticated";

revoke trigger on table "public"."customers" from "authenticated";

revoke truncate on table "public"."customers" from "authenticated";

revoke update on table "public"."customers" from "authenticated";

revoke delete on table "public"."customers" from "service_role";

revoke insert on table "public"."customers" from "service_role";

revoke references on table "public"."customers" from "service_role";

revoke select on table "public"."customers" from "service_role";

revoke trigger on table "public"."customers" from "service_role";

revoke truncate on table "public"."customers" from "service_role";

revoke update on table "public"."customers" from "service_role";

revoke delete on table "public"."dialogue_sessions" from "anon";

revoke insert on table "public"."dialogue_sessions" from "anon";

revoke references on table "public"."dialogue_sessions" from "anon";

revoke select on table "public"."dialogue_sessions" from "anon";

revoke trigger on table "public"."dialogue_sessions" from "anon";

revoke truncate on table "public"."dialogue_sessions" from "anon";

revoke update on table "public"."dialogue_sessions" from "anon";

revoke delete on table "public"."dialogue_sessions" from "authenticated";

revoke insert on table "public"."dialogue_sessions" from "authenticated";

revoke references on table "public"."dialogue_sessions" from "authenticated";

revoke select on table "public"."dialogue_sessions" from "authenticated";

revoke trigger on table "public"."dialogue_sessions" from "authenticated";

revoke truncate on table "public"."dialogue_sessions" from "authenticated";

revoke update on table "public"."dialogue_sessions" from "authenticated";

revoke delete on table "public"."dialogue_sessions" from "service_role";

revoke insert on table "public"."dialogue_sessions" from "service_role";

revoke references on table "public"."dialogue_sessions" from "service_role";

revoke select on table "public"."dialogue_sessions" from "service_role";

revoke trigger on table "public"."dialogue_sessions" from "service_role";

revoke truncate on table "public"."dialogue_sessions" from "service_role";

revoke update on table "public"."dialogue_sessions" from "service_role";

revoke delete on table "public"."epistemic_driver_history" from "anon";

revoke insert on table "public"."epistemic_driver_history" from "anon";

revoke references on table "public"."epistemic_driver_history" from "anon";

revoke select on table "public"."epistemic_driver_history" from "anon";

revoke trigger on table "public"."epistemic_driver_history" from "anon";

revoke truncate on table "public"."epistemic_driver_history" from "anon";

revoke update on table "public"."epistemic_driver_history" from "anon";

revoke delete on table "public"."epistemic_driver_history" from "authenticated";

revoke insert on table "public"."epistemic_driver_history" from "authenticated";

revoke references on table "public"."epistemic_driver_history" from "authenticated";

revoke select on table "public"."epistemic_driver_history" from "authenticated";

revoke trigger on table "public"."epistemic_driver_history" from "authenticated";

revoke truncate on table "public"."epistemic_driver_history" from "authenticated";

revoke update on table "public"."epistemic_driver_history" from "authenticated";

revoke delete on table "public"."epistemic_driver_history" from "service_role";

revoke insert on table "public"."epistemic_driver_history" from "service_role";

revoke references on table "public"."epistemic_driver_history" from "service_role";

revoke select on table "public"."epistemic_driver_history" from "service_role";

revoke trigger on table "public"."epistemic_driver_history" from "service_role";

revoke truncate on table "public"."epistemic_driver_history" from "service_role";

revoke update on table "public"."epistemic_driver_history" from "service_role";

revoke delete on table "public"."memories" from "anon";

revoke insert on table "public"."memories" from "anon";

revoke references on table "public"."memories" from "anon";

revoke select on table "public"."memories" from "anon";

revoke trigger on table "public"."memories" from "anon";

revoke truncate on table "public"."memories" from "anon";

revoke update on table "public"."memories" from "anon";

revoke delete on table "public"."memories" from "authenticated";

revoke insert on table "public"."memories" from "authenticated";

revoke references on table "public"."memories" from "authenticated";

revoke select on table "public"."memories" from "authenticated";

revoke trigger on table "public"."memories" from "authenticated";

revoke truncate on table "public"."memories" from "authenticated";

revoke update on table "public"."memories" from "authenticated";

revoke delete on table "public"."memories" from "service_role";

revoke insert on table "public"."memories" from "service_role";

revoke references on table "public"."memories" from "service_role";

revoke select on table "public"."memories" from "service_role";

revoke trigger on table "public"."memories" from "service_role";

revoke truncate on table "public"."memories" from "service_role";

revoke update on table "public"."memories" from "service_role";

revoke delete on table "public"."memory_links" from "anon";

revoke insert on table "public"."memory_links" from "anon";

revoke references on table "public"."memory_links" from "anon";

revoke select on table "public"."memory_links" from "anon";

revoke trigger on table "public"."memory_links" from "anon";

revoke truncate on table "public"."memory_links" from "anon";

revoke update on table "public"."memory_links" from "anon";

revoke delete on table "public"."memory_links" from "authenticated";

revoke insert on table "public"."memory_links" from "authenticated";

revoke references on table "public"."memory_links" from "authenticated";

revoke select on table "public"."memory_links" from "authenticated";

revoke trigger on table "public"."memory_links" from "authenticated";

revoke truncate on table "public"."memory_links" from "authenticated";

revoke update on table "public"."memory_links" from "authenticated";

revoke delete on table "public"."memory_links" from "service_role";

revoke insert on table "public"."memory_links" from "service_role";

revoke references on table "public"."memory_links" from "service_role";

revoke select on table "public"."memory_links" from "service_role";

revoke trigger on table "public"."memory_links" from "service_role";

revoke truncate on table "public"."memory_links" from "service_role";

revoke update on table "public"."memory_links" from "service_role";

revoke delete on table "public"."mindmap_operations" from "anon";

revoke insert on table "public"."mindmap_operations" from "anon";

revoke references on table "public"."mindmap_operations" from "anon";

revoke select on table "public"."mindmap_operations" from "anon";

revoke trigger on table "public"."mindmap_operations" from "anon";

revoke truncate on table "public"."mindmap_operations" from "anon";

revoke update on table "public"."mindmap_operations" from "anon";

revoke delete on table "public"."mindmap_operations" from "authenticated";

revoke insert on table "public"."mindmap_operations" from "authenticated";

revoke references on table "public"."mindmap_operations" from "authenticated";

revoke select on table "public"."mindmap_operations" from "authenticated";

revoke trigger on table "public"."mindmap_operations" from "authenticated";

revoke truncate on table "public"."mindmap_operations" from "authenticated";

revoke update on table "public"."mindmap_operations" from "authenticated";

revoke delete on table "public"."mindmap_operations" from "service_role";

revoke insert on table "public"."mindmap_operations" from "service_role";

revoke references on table "public"."mindmap_operations" from "service_role";

revoke select on table "public"."mindmap_operations" from "service_role";

revoke trigger on table "public"."mindmap_operations" from "service_role";

revoke truncate on table "public"."mindmap_operations" from "service_role";

revoke update on table "public"."mindmap_operations" from "service_role";

revoke delete on table "public"."mindmap_results" from "anon";

revoke insert on table "public"."mindmap_results" from "anon";

revoke references on table "public"."mindmap_results" from "anon";

revoke select on table "public"."mindmap_results" from "anon";

revoke trigger on table "public"."mindmap_results" from "anon";

revoke truncate on table "public"."mindmap_results" from "anon";

revoke update on table "public"."mindmap_results" from "anon";

revoke delete on table "public"."mindmap_results" from "authenticated";

revoke insert on table "public"."mindmap_results" from "authenticated";

revoke references on table "public"."mindmap_results" from "authenticated";

revoke select on table "public"."mindmap_results" from "authenticated";

revoke trigger on table "public"."mindmap_results" from "authenticated";

revoke truncate on table "public"."mindmap_results" from "authenticated";

revoke update on table "public"."mindmap_results" from "authenticated";

revoke delete on table "public"."mindmap_results" from "service_role";

revoke insert on table "public"."mindmap_results" from "service_role";

revoke references on table "public"."mindmap_results" from "service_role";

revoke select on table "public"."mindmap_results" from "service_role";

revoke trigger on table "public"."mindmap_results" from "service_role";

revoke truncate on table "public"."mindmap_results" from "service_role";

revoke update on table "public"."mindmap_results" from "service_role";

revoke delete on table "public"."mindmap_snapshots" from "anon";

revoke insert on table "public"."mindmap_snapshots" from "anon";

revoke references on table "public"."mindmap_snapshots" from "anon";

revoke select on table "public"."mindmap_snapshots" from "anon";

revoke trigger on table "public"."mindmap_snapshots" from "anon";

revoke truncate on table "public"."mindmap_snapshots" from "anon";

revoke update on table "public"."mindmap_snapshots" from "anon";

revoke delete on table "public"."mindmap_snapshots" from "authenticated";

revoke insert on table "public"."mindmap_snapshots" from "authenticated";

revoke references on table "public"."mindmap_snapshots" from "authenticated";

revoke select on table "public"."mindmap_snapshots" from "authenticated";

revoke trigger on table "public"."mindmap_snapshots" from "authenticated";

revoke truncate on table "public"."mindmap_snapshots" from "authenticated";

revoke update on table "public"."mindmap_snapshots" from "authenticated";

revoke delete on table "public"."mindmap_snapshots" from "service_role";

revoke insert on table "public"."mindmap_snapshots" from "service_role";

revoke references on table "public"."mindmap_snapshots" from "service_role";

revoke select on table "public"."mindmap_snapshots" from "service_role";

revoke trigger on table "public"."mindmap_snapshots" from "service_role";

revoke truncate on table "public"."mindmap_snapshots" from "service_role";

revoke update on table "public"."mindmap_snapshots" from "service_role";

revoke delete on table "public"."session_participants" from "anon";

revoke insert on table "public"."session_participants" from "anon";

revoke references on table "public"."session_participants" from "anon";

revoke select on table "public"."session_participants" from "anon";

revoke trigger on table "public"."session_participants" from "anon";

revoke truncate on table "public"."session_participants" from "anon";

revoke update on table "public"."session_participants" from "anon";

revoke delete on table "public"."session_participants" from "authenticated";

revoke insert on table "public"."session_participants" from "authenticated";

revoke references on table "public"."session_participants" from "authenticated";

revoke select on table "public"."session_participants" from "authenticated";

revoke trigger on table "public"."session_participants" from "authenticated";

revoke truncate on table "public"."session_participants" from "authenticated";

revoke update on table "public"."session_participants" from "authenticated";

revoke delete on table "public"."session_participants" from "service_role";

revoke insert on table "public"."session_participants" from "service_role";

revoke references on table "public"."session_participants" from "service_role";

revoke select on table "public"."session_participants" from "service_role";

revoke trigger on table "public"."session_participants" from "service_role";

revoke truncate on table "public"."session_participants" from "service_role";

revoke update on table "public"."session_participants" from "service_role";

revoke delete on table "public"."study_maps" from "anon";

revoke insert on table "public"."study_maps" from "anon";

revoke references on table "public"."study_maps" from "anon";

revoke select on table "public"."study_maps" from "anon";

revoke trigger on table "public"."study_maps" from "anon";

revoke truncate on table "public"."study_maps" from "anon";

revoke update on table "public"."study_maps" from "anon";

revoke delete on table "public"."study_maps" from "authenticated";

revoke insert on table "public"."study_maps" from "authenticated";

revoke references on table "public"."study_maps" from "authenticated";

revoke select on table "public"."study_maps" from "authenticated";

revoke trigger on table "public"."study_maps" from "authenticated";

revoke truncate on table "public"."study_maps" from "authenticated";

revoke update on table "public"."study_maps" from "authenticated";

revoke delete on table "public"."study_maps" from "service_role";

revoke insert on table "public"."study_maps" from "service_role";

revoke references on table "public"."study_maps" from "service_role";

revoke select on table "public"."study_maps" from "service_role";

revoke trigger on table "public"."study_maps" from "service_role";

revoke truncate on table "public"."study_maps" from "service_role";

revoke update on table "public"."study_maps" from "service_role";

revoke delete on table "public"."user_preferences" from "anon";

revoke insert on table "public"."user_preferences" from "anon";

revoke references on table "public"."user_preferences" from "anon";

revoke select on table "public"."user_preferences" from "anon";

revoke trigger on table "public"."user_preferences" from "anon";

revoke truncate on table "public"."user_preferences" from "anon";

revoke update on table "public"."user_preferences" from "anon";

revoke delete on table "public"."user_preferences" from "authenticated";

revoke insert on table "public"."user_preferences" from "authenticated";

revoke references on table "public"."user_preferences" from "authenticated";

revoke select on table "public"."user_preferences" from "authenticated";

revoke trigger on table "public"."user_preferences" from "authenticated";

revoke truncate on table "public"."user_preferences" from "authenticated";

revoke update on table "public"."user_preferences" from "authenticated";

revoke delete on table "public"."user_preferences" from "service_role";

revoke insert on table "public"."user_preferences" from "service_role";

revoke references on table "public"."user_preferences" from "service_role";

revoke select on table "public"."user_preferences" from "service_role";

revoke trigger on table "public"."user_preferences" from "service_role";

revoke truncate on table "public"."user_preferences" from "service_role";

revoke update on table "public"."user_preferences" from "service_role";

revoke delete on table "public"."users" from "anon";

revoke insert on table "public"."users" from "anon";

revoke references on table "public"."users" from "anon";

revoke select on table "public"."users" from "anon";

revoke trigger on table "public"."users" from "anon";

revoke truncate on table "public"."users" from "anon";

revoke update on table "public"."users" from "anon";

revoke delete on table "public"."users" from "authenticated";

revoke insert on table "public"."users" from "authenticated";

revoke references on table "public"."users" from "authenticated";

revoke select on table "public"."users" from "authenticated";

revoke trigger on table "public"."users" from "authenticated";

revoke truncate on table "public"."users" from "authenticated";

revoke update on table "public"."users" from "authenticated";

revoke delete on table "public"."users" from "service_role";

revoke insert on table "public"."users" from "service_role";

revoke references on table "public"."users" from "service_role";

revoke select on table "public"."users" from "service_role";

revoke trigger on table "public"."users" from "service_role";

revoke truncate on table "public"."users" from "service_role";

revoke update on table "public"."users" from "service_role";

alter table "public"."chat_messages" drop constraint "chat_messages_message_type_check";

alter table "public"."chat_messages" drop constraint "chat_messages_session_id_fkey";

alter table "public"."chat_messages" drop constraint "chat_messages_thread_id_fkey";

alter table "public"."collaboration_sessions" drop constraint "collaboration_sessions_created_by_fkey";

alter table "public"."collaboration_sessions" drop constraint "collaboration_sessions_epistemic_driver_id_fkey";

alter table "public"."collaboration_sessions" drop constraint "collaboration_sessions_session_type_check";

alter table "public"."course_analyses" drop constraint "course_analyses_completion_status_check";

alter table "public"."course_analyses" drop constraint "course_analyses_course_id_fkey";

alter table "public"."course_analyses" drop constraint "course_analyses_user_id_course_id_key";

alter table "public"."course_analyses" drop constraint "course_analyses_user_id_fkey";

alter table "public"."courses" drop constraint "courses_difficulty_check";

alter table "public"."customers" drop constraint "customers_user_id_fkey";

alter table "public"."dialogue_sessions" drop constraint "dialogue_sessions_memory_link_id_fkey";

alter table "public"."dialogue_sessions" drop constraint "dialogue_sessions_session_status_check";

alter table "public"."dialogue_sessions" drop constraint "dialogue_sessions_user_id_fkey";

alter table "public"."epistemic_driver_history" drop constraint "epistemic_driver_history_user_id_fkey";

alter table "public"."invoices" drop constraint "invoices_customer_id_fkey";

alter table "public"."invoices" drop constraint "invoices_user_id_fkey";

alter table "public"."memories" drop constraint "fk_memories_user";

alter table "public"."memories" drop constraint "memories_category_check";

alter table "public"."memories" drop constraint "memories_user_id_fkey";

alter table "public"."memory_links" drop constraint "memory_links_course_id_fkey";

alter table "public"."memory_links" drop constraint "memory_links_memory_id_fkey";

alter table "public"."memory_links" drop constraint "memory_links_refinement_status_check";

alter table "public"."memory_links" drop constraint "memory_links_user_id_fkey";

alter table "public"."mindmap_operations" drop constraint "mindmap_operations_operation_type_check";

alter table "public"."mindmap_operations" drop constraint "mindmap_operations_parent_operation_id_fkey";

alter table "public"."mindmap_operations" drop constraint "mindmap_operations_session_id_fkey";

alter table "public"."mindmap_operations" drop constraint "mindmap_operations_user_id_fkey";

alter table "public"."mindmap_results" drop constraint "mindmap_results_job_id_key";

alter table "public"."mindmap_results" drop constraint "mindmap_results_status_check";

alter table "public"."mindmap_results" drop constraint "mindmap_results_user_id_fkey";

alter table "public"."mindmap_snapshots" drop constraint "mindmap_snapshots_created_by_fkey";

alter table "public"."mindmap_snapshots" drop constraint "mindmap_snapshots_session_id_fkey";

alter table "public"."quotes" drop constraint "quotes_customer_id_fkey";

alter table "public"."quotes" drop constraint "quotes_user_id_fkey";

alter table "public"."session_participants" drop constraint "session_participants_role_check";

alter table "public"."session_participants" drop constraint "session_participants_session_id_fkey";

alter table "public"."session_participants" drop constraint "session_participants_session_id_user_id_key";

alter table "public"."session_participants" drop constraint "session_participants_user_id_fkey";

alter table "public"."study_maps" drop constraint "study_maps_course_id_fkey";

alter table "public"."study_maps" drop constraint "study_maps_map_type_check";

alter table "public"."study_maps" drop constraint "study_maps_user_id_course_id_map_type_key";

alter table "public"."study_maps" drop constraint "study_maps_user_id_fkey";

alter table "public"."user_preferences" drop constraint "user_preferences_user_id_fkey";

alter table "public"."user_preferences" drop constraint "user_preferences_user_id_key";

alter table "public"."users" drop constraint "users_auth_id_fkey";

alter table "public"."users" drop constraint "users_auth_id_key";

alter table "public"."users" drop constraint "users_email_key";

drop function if exists "public"."cleanup_old_chat_messages"();

drop function if exists "public"."create_user_preferences"();

drop function if exists "public"."search_chat_messages"(p_session_id uuid, p_search_term text, p_limit integer);

drop function if exists "public"."set_operation_sequence"();

drop function if exists "public"."update_last_seen_column"();

drop function if exists "public"."update_participant_last_seen"();

drop function if exists "public"."update_updated_at_column"();

drop function if exists "public"."validate_memory_category"();

alter table "public"."chat_messages" drop constraint "chat_messages_pkey";

alter table "public"."collaboration_sessions" drop constraint "collaboration_sessions_pkey";

alter table "public"."course_analyses" drop constraint "course_analyses_pkey";

alter table "public"."courses" drop constraint "courses_pkey";

alter table "public"."customers" drop constraint "customers_pkey";

alter table "public"."dialogue_sessions" drop constraint "dialogue_sessions_pkey";

alter table "public"."epistemic_driver_history" drop constraint "epistemic_driver_history_pkey";

alter table "public"."memories" drop constraint "memories_pkey";

alter table "public"."memory_links" drop constraint "memory_links_pkey";

alter table "public"."mindmap_operations" drop constraint "mindmap_operations_pkey";

alter table "public"."mindmap_results" drop constraint "mindmap_results_pkey";

alter table "public"."mindmap_snapshots" drop constraint "mindmap_snapshots_pkey";

alter table "public"."session_participants" drop constraint "session_participants_pkey";

alter table "public"."study_maps" drop constraint "study_maps_pkey";

alter table "public"."user_preferences" drop constraint "user_preferences_pkey";

alter table "public"."users" drop constraint "users_pkey";

drop index if exists "public"."chat_messages_pkey";

drop index if exists "public"."collaboration_sessions_pkey";

drop index if exists "public"."course_analyses_pkey";

drop index if exists "public"."course_analyses_user_id_course_id_key";

drop index if exists "public"."courses_pkey";

drop index if exists "public"."customers_email_idx";

drop index if exists "public"."customers_name_idx";

drop index if exists "public"."customers_pkey";

drop index if exists "public"."customers_user_id_idx";

drop index if exists "public"."dialogue_sessions_pkey";

drop index if exists "public"."epistemic_driver_history_pkey";

drop index if exists "public"."idx_chat_messages_created_at";

drop index if exists "public"."idx_chat_messages_pinned";

drop index if exists "public"."idx_chat_messages_session";

drop index if exists "public"."idx_chat_messages_thread";

drop index if exists "public"."idx_chat_messages_type";

drop index if exists "public"."idx_chat_messages_user";

drop index if exists "public"."idx_collaboration_sessions_active";

drop index if exists "public"."idx_collaboration_sessions_created_by";

drop index if exists "public"."idx_collaboration_sessions_creator";

drop index if exists "public"."idx_collaboration_sessions_epistemic_driver";

drop index if exists "public"."idx_course_analyses_course_id";

drop index if exists "public"."idx_course_analyses_status";

drop index if exists "public"."idx_course_analyses_user_id";

drop index if exists "public"."idx_courses_active";

drop index if exists "public"."idx_courses_difficulty";

drop index if exists "public"."idx_courses_field";

drop index if exists "public"."idx_courses_university";

drop index if exists "public"."idx_dialogue_sessions_memory_link_id";

drop index if exists "public"."idx_dialogue_sessions_status";

drop index if exists "public"."idx_dialogue_sessions_user_id";

drop index if exists "public"."idx_epistemic_driver_history_created_at";

drop index if exists "public"."idx_epistemic_driver_history_is_favorite";

drop index if exists "public"."idx_epistemic_driver_history_tags";

drop index if exists "public"."idx_epistemic_driver_history_user_id";

drop index if exists "public"."idx_memories_category";

drop index if exists "public"."idx_memories_created_at";

drop index if exists "public"."idx_memories_user_id";

drop index if exists "public"."idx_memory_links_course_id";

drop index if exists "public"."idx_memory_links_memory_id";

drop index if exists "public"."idx_memory_links_status";

drop index if exists "public"."idx_memory_links_user_id";

drop index if exists "public"."idx_mindmap_operations_applied";

drop index if exists "public"."idx_mindmap_operations_sequence";

drop index if exists "public"."idx_mindmap_operations_session";

drop index if exists "public"."idx_mindmap_operations_timestamp";

drop index if exists "public"."idx_mindmap_results_created_at";

drop index if exists "public"."idx_mindmap_results_job_id";

drop index if exists "public"."idx_mindmap_results_status";

drop index if exists "public"."idx_mindmap_results_user_id";

drop index if exists "public"."idx_mindmap_snapshots_created_at";

drop index if exists "public"."idx_mindmap_snapshots_session";

drop index if exists "public"."idx_session_participants_online";

drop index if exists "public"."idx_session_participants_session";

drop index if exists "public"."idx_session_participants_user";

drop index if exists "public"."idx_study_maps_course_id";

drop index if exists "public"."idx_study_maps_type";

drop index if exists "public"."idx_study_maps_user_id";

drop index if exists "public"."idx_user_preferences_user_id";

drop index if exists "public"."idx_users_auth_id";

drop index if exists "public"."idx_users_email";

drop index if exists "public"."invoices_created_at_idx";

drop index if exists "public"."invoices_customer_id_idx";

drop index if exists "public"."invoices_invoice_number_idx";

drop index if exists "public"."invoices_quote_id_idx";

drop index if exists "public"."invoices_status_idx";

drop index if exists "public"."invoices_user_id_idx";

drop index if exists "public"."memories_pkey";

drop index if exists "public"."memory_links_pkey";

drop index if exists "public"."mindmap_operations_pkey";

drop index if exists "public"."mindmap_results_job_id_key";

drop index if exists "public"."mindmap_results_pkey";

drop index if exists "public"."mindmap_snapshots_pkey";

drop index if exists "public"."quotes_created_at_idx";

drop index if exists "public"."quotes_customer_id_idx";

drop index if exists "public"."quotes_quote_number_idx";

drop index if exists "public"."quotes_status_idx";

drop index if exists "public"."quotes_user_id_idx";

drop index if exists "public"."session_participants_pkey";

drop index if exists "public"."session_participants_session_id_user_id_key";

drop index if exists "public"."study_maps_pkey";

drop index if exists "public"."study_maps_user_id_course_id_map_type_key";

drop index if exists "public"."user_preferences_pkey";

drop index if exists "public"."user_preferences_user_id_key";

drop index if exists "public"."users_auth_id_key";

drop index if exists "public"."users_email_key";

drop index if exists "public"."users_pkey";

drop table "public"."chat_messages";

drop table "public"."collaboration_sessions";

drop table "public"."course_analyses";

drop table "public"."courses";

drop table "public"."customers";

drop table "public"."dialogue_sessions";

drop table "public"."epistemic_driver_history";

drop table "public"."memories";

drop table "public"."memory_links";

drop table "public"."mindmap_operations";

drop table "public"."mindmap_results";

drop table "public"."mindmap_snapshots";

drop table "public"."session_participants";

drop table "public"."study_maps";

drop table "public"."user_preferences";

drop table "public"."users";

create table "public"."app_settings" (
    "id" bigint not null default 1,
    "quote_prefix" text default 'QU-'::text,
    "next_quote_number" bigint default 1001,
    "invoice_prefix" text default 'INV-'::text,
    "next_invoice_number" bigint default 2025001,
    "user_id" uuid not null,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "terms_and_conditions" text default ''::text,
    "pdf_template" text default 'classic-blue'::text
);


alter table "public"."app_settings" enable row level security;

create table "public"."company_profile" (
    "id" uuid not null default gen_random_uuid(),
    "company_name" text not null,
    "address" text not null,
    "email" text not null,
    "phone" text,
    "user_id" uuid not null,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "logo_url" text,
    "company_registration_number" text,
    "tax_number" text
);


alter table "public"."company_profile" enable row level security;

alter table "public"."invoices" drop column "customer_address";

alter table "public"."invoices" drop column "customer_email";

alter table "public"."invoices" drop column "customer_id";

alter table "public"."invoices" drop column "customer_name";

alter table "public"."invoices" drop column "customer_phone";

alter table "public"."invoices" drop column "notes";

alter table "public"."invoices" drop column "subtotal";

alter table "public"."invoices" drop column "tax_amount";

alter table "public"."invoices" drop column "tax_rate";

alter table "public"."invoices" drop column "total";

alter table "public"."invoices" drop column "user_id";

alter table "public"."invoices" add column "client_details" jsonb not null;

alter table "public"."invoices" add column "totals" jsonb not null;

alter table "public"."invoices" alter column "due_date" set data type timestamp with time zone using "due_date"::timestamp with time zone;

alter table "public"."invoices" alter column "line_items" drop default;

alter table "public"."invoices" alter column "paid_date" set data type timestamp with time zone using "paid_date"::timestamp with time zone;

alter table "public"."invoices" alter column "status" set default 'draft'::text;

alter table "public"."invoices" alter column "status" drop not null;

alter table "public"."quotes" drop column "customer_address";

alter table "public"."quotes" drop column "customer_email";

alter table "public"."quotes" drop column "customer_id";

alter table "public"."quotes" drop column "customer_name";

alter table "public"."quotes" drop column "customer_phone";

alter table "public"."quotes" drop column "notes";

alter table "public"."quotes" drop column "subtotal";

alter table "public"."quotes" drop column "tax_amount";

alter table "public"."quotes" drop column "tax_rate";

alter table "public"."quotes" drop column "total";

alter table "public"."quotes" drop column "user_id";

alter table "public"."quotes" drop column "valid_until";

alter table "public"."quotes" add column "client_details" jsonb not null;

alter table "public"."quotes" add column "totals" jsonb not null;

alter table "public"."quotes" alter column "line_items" drop default;

alter table "public"."quotes" alter column "status" set default 'pending'::text;

alter table "public"."quotes" alter column "status" drop not null;

drop sequence if exists "public"."mindmap_operation_sequence";

CREATE UNIQUE INDEX app_settings_pkey ON public.app_settings USING btree (id);

CREATE UNIQUE INDEX company_profile_pkey ON public.company_profile USING btree (id);

CREATE UNIQUE INDEX invoices_invoice_number_key ON public.invoices USING btree (invoice_number);

CREATE UNIQUE INDEX quotes_quote_number_key ON public.quotes USING btree (quote_number);

alter table "public"."app_settings" add constraint "app_settings_pkey" PRIMARY KEY using index "app_settings_pkey";

alter table "public"."company_profile" add constraint "company_profile_pkey" PRIMARY KEY using index "company_profile_pkey";

alter table "public"."company_profile" add constraint "company_profile_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."company_profile" validate constraint "company_profile_user_id_fkey";

alter table "public"."invoices" add constraint "invoices_invoice_number_key" UNIQUE using index "invoices_invoice_number_key";

alter table "public"."quotes" add constraint "quotes_quote_number_key" UNIQUE using index "quotes_quote_number_key";

grant delete on table "public"."app_settings" to "anon";

grant insert on table "public"."app_settings" to "anon";

grant references on table "public"."app_settings" to "anon";

grant select on table "public"."app_settings" to "anon";

grant trigger on table "public"."app_settings" to "anon";

grant truncate on table "public"."app_settings" to "anon";

grant update on table "public"."app_settings" to "anon";

grant delete on table "public"."app_settings" to "authenticated";

grant insert on table "public"."app_settings" to "authenticated";

grant references on table "public"."app_settings" to "authenticated";

grant select on table "public"."app_settings" to "authenticated";

grant trigger on table "public"."app_settings" to "authenticated";

grant truncate on table "public"."app_settings" to "authenticated";

grant update on table "public"."app_settings" to "authenticated";

grant delete on table "public"."app_settings" to "service_role";

grant insert on table "public"."app_settings" to "service_role";

grant references on table "public"."app_settings" to "service_role";

grant select on table "public"."app_settings" to "service_role";

grant trigger on table "public"."app_settings" to "service_role";

grant truncate on table "public"."app_settings" to "service_role";

grant update on table "public"."app_settings" to "service_role";

grant delete on table "public"."company_profile" to "anon";

grant insert on table "public"."company_profile" to "anon";

grant references on table "public"."company_profile" to "anon";

grant select on table "public"."company_profile" to "anon";

grant trigger on table "public"."company_profile" to "anon";

grant truncate on table "public"."company_profile" to "anon";

grant update on table "public"."company_profile" to "anon";

grant delete on table "public"."company_profile" to "authenticated";

grant insert on table "public"."company_profile" to "authenticated";

grant references on table "public"."company_profile" to "authenticated";

grant select on table "public"."company_profile" to "authenticated";

grant trigger on table "public"."company_profile" to "authenticated";

grant truncate on table "public"."company_profile" to "authenticated";

grant update on table "public"."company_profile" to "authenticated";

grant delete on table "public"."company_profile" to "service_role";

grant insert on table "public"."company_profile" to "service_role";

grant references on table "public"."company_profile" to "service_role";

grant select on table "public"."company_profile" to "service_role";

grant trigger on table "public"."company_profile" to "service_role";

grant truncate on table "public"."company_profile" to "service_role";

grant update on table "public"."company_profile" to "service_role";

create policy "Users can manage their own app settings"
on "public"."app_settings"
as permissive
for all
to authenticated
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));


create policy "Users can delete own company profile"
on "public"."company_profile"
as permissive
for delete
to authenticated
using ((auth.uid() = user_id));


create policy "Users can insert own company profile"
on "public"."company_profile"
as permissive
for insert
to authenticated
with check ((auth.uid() = user_id));


create policy "Users can read own company profile"
on "public"."company_profile"
as permissive
for select
to authenticated
using ((auth.uid() = user_id));


create policy "Users can update own company profile"
on "public"."company_profile"
as permissive
for update
to authenticated
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));


create policy "Users can manage their own invoices"
on "public"."invoices"
as permissive
for all
to authenticated
using (((client_details ->> 'user_id'::text) = (auth.uid())::text))
with check (((client_details ->> 'user_id'::text) = (auth.uid())::text));


create policy "Users can manage their own quotes"
on "public"."quotes"
as permissive
for all
to authenticated
using (((auth.uid())::text = (client_details ->> 'user_id'::text)))
with check (((auth.uid())::text = (client_details ->> 'user_id'::text)));



