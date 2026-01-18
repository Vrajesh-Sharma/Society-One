## Database queries

```sql
-- Update user role (replace email with actual email)
UPDATE users 
SET role = 'chairman' 
WHERE email = 'chairman@example.com';

-- Or make someone secretary
UPDATE users 
SET role = 'secretary' 
WHERE email = 'secretary@example.com';

-- Or security
UPDATE users 
SET role = 'security' 
WHERE email = 'security@example.com';
```

Add societies
```sql
INSERT INTO societies (name, location, city, state) VALUES
  ('Mirai', 'Gota', 'Ahmedabad', 'Gujarat'),
  ('Elite Neptune', 'S.G. Highway', 'Ahmedabad', 'Gujarat')
ON CONFLICT (name) DO NOTHING;
```