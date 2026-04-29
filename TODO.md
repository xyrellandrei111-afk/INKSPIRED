# INKSPIRED Schema Update TODO

## Plan: Align Supabase Schema with Frontend Code

### Steps:
- [x] 1. Create TODO.md (this file)
- [x] 2. Rewrite `supabase-schema.sql` with corrected column names
- [x] 3. Add `handle_new_user()` trigger for auto-profile creation on auth signup
- [x] 4. Fix `apps` table: `status` instead of `approval_status`/`is_published`/`is_approved`, `downloads` instead of `download_count`, add `is_featured`/`download_url`/`size`
- [x] 5. Fix `orders` table: `user_id`/`name`/`email`/`phone`/`address`/`discount` instead of `customer_*` prefixes
- [x] 6. Fix `reviews` table: add `user_name` column
- [x] 7. Update triggers (`increment_app_downloads`, `create_earnings`) to use corrected column names
- [x] 8. Update RLS policies to reference new column names
- [x] 9. Uncomment and complete storage bucket + policies SQL
- [x] 10. Verify SQL syntax and completeness

