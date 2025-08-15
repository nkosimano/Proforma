# Database Migration Guide - Fixing Relationship and Policy Issues

## Current Issues Identified

### 1. Foreign Key Relationship Errors
- **recurring_invoices ↔ invoices**: Missing `template_invoice_id` foreign key
- **invoices ↔ customers**: Relationship exists but not working in production
- **quotes**: Missing `user_id` field for proper user filtering

### 2. Policy Recursion Issues
- **user_roles table**: Infinite recursion in RLS policies
- **currencies table**: Policy conflicts causing 500 errors

### 3. Missing User Filtering
- **invoices table**: Missing `user_id` for proper data isolation
- **quotes table**: Missing `user_id` for user-specific access

## Migration Files Created

### 1. `20250122000001_create_app_settings_table.sql`
- Creates missing `app_settings` table
- Adds user-specific application settings
- Fixes quote/invoice numbering system

### 2. `20250122000002_fix_invoices_relationships.sql`
- Adds `user_id` to invoices table
- Establishes proper foreign key relationships
- Updates RLS policies for invoices
- Adds performance indexes

### 3. `20250122000003_fix_all_relationships_and_policies.sql`
- Fixes recurring_invoices ↔ invoices relationship
- Resolves user_roles policy recursion
- Fixes currencies table policies
- Adds missing user_id to quotes table
- Updates all RLS policies to be non-recursive

## Application-Layer Fixes Applied

### 1. Analytics Component
- Removed problematic foreign key joins
- Added application-layer filtering
- Graceful handling of missing relationships

### 2. Recurring Invoice Service
- Separated data fetching to avoid join errors
- Manual data enrichment until migration is applied
- Backward compatibility maintained

### 3. Currency Service
- Simplified queries to avoid policy conflicts
- Removed user-specific filtering temporarily
- Added fallback mechanisms

## Database Schema Updates Required

### Tables to Modify:

#### invoices
```sql
ALTER TABLE invoices ADD COLUMN user_id UUID REFERENCES auth.users(id);
```

#### quotes
```sql
ALTER TABLE quotes ADD COLUMN user_id UUID REFERENCES auth.users(id);
```

#### recurring_invoices
```sql
ALTER TABLE recurring_invoices ADD COLUMN template_invoice_id UUID REFERENCES invoices(id);
```

### Policies to Fix:

#### user_roles (Remove Recursion)
```sql
-- Simple, non-recursive policies
CREATE POLICY "Enable read access for authenticated users" ON user_roles
  FOR SELECT USING (auth.role() = 'authenticated');
```

#### currencies (Simplify Access)
```sql
-- Allow global read access
CREATE POLICY "Enable read access for all currencies" ON currencies
  FOR SELECT USING (true);
```

## Migration Strategy

### Phase 1: Immediate Fixes (Applied)
✅ Application-layer workarounds
✅ Error handling improvements
✅ Graceful degradation

### Phase 2: Database Migration (Pending)
🔄 Apply migration files to production
🔄 Update foreign key relationships
🔄 Fix RLS policies

### Phase 3: Optimization (Future)
🔄 Re-enable database-level joins
🔄 Remove application-layer workarounds
🔄 Performance optimizations

## Testing Checklist

### Before Migration
- [ ] Analytics component loads without errors
- [ ] Recurring invoices display (with limited data)
- [ ] Currency operations work
- [ ] No infinite recursion errors

### After Migration
- [ ] All foreign key relationships work
- [ ] User-specific data isolation
- [ ] Improved query performance
- [ ] Full feature functionality

## Rollback Plan

If migration fails:
1. Keep application-layer fixes in place
2. Revert database changes
3. Continue with workaround solutions
4. Debug specific migration issues

## Performance Impact

### Current (Workaround)
- Multiple separate queries
- Application-layer joins
- Reduced performance but functional

### Post-Migration
- Single optimized queries
- Database-level joins
- Proper indexing
- Significant performance improvement

## Security Considerations

### Current Issues
- Some data not properly isolated by user
- Policy recursion vulnerabilities
- Potential data leakage

### Post-Migration
- Proper user data isolation
- Non-recursive, secure policies
- Enhanced data protection

## Next Steps

1. **Apply migrations to production database**
2. **Test all functionality thoroughly**
3. **Monitor for any remaining issues**
4. **Optimize queries post-migration**
5. **Remove temporary workarounds**

## Support

For issues during migration:
- Check application logs for specific errors
- Verify migration file execution
- Test individual components
- Rollback if necessary