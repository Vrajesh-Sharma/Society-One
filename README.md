## Database queries

Assign Roles to Users
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

## Bill Payment Functionality

So basically there are 3 cases.

Case 1 - Exact payment
If secretary creates a bill and the flat pays exact amount then balance is zero - bill is paid. Everything is cool.

Case 2 - Extra Payment
If a flat pays extra in a particular bill, then the extra amount is stored for future use. Next bill will be shown in discounted price(original-balance amount). 

Case 3 - Less Payment
If a flat due to any financial reasons pays less then the bill amount then the balance is stored for future use. Next bill will be shown overcharged price(original+left amount).

---

This sql is not for copy-paste, it is for debugging.

-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.
```sql
CREATE TABLE public.balance_adjustments (
  adjustment_id uuid NOT NULL DEFAULT uuid_generate_v4(),
  flat_id uuid NOT NULL,
  flat_number character varying NOT NULL,
  society_id uuid NOT NULL,
  amount numeric NOT NULL,
  adjustment_type character varying NOT NULL,
  reason text NOT NULL,
  adjusted_by uuid NOT NULL,
  adjusted_at timestamp without time zone DEFAULT now(),
  CONSTRAINT balance_adjustments_pkey PRIMARY KEY (adjustment_id),
  CONSTRAINT balance_adjustments_flat_id_fkey FOREIGN KEY (flat_id) REFERENCES public.flats(flat_id),
  CONSTRAINT balance_adjustments_society_id_fkey FOREIGN KEY (society_id) REFERENCES public.societies(society_id),
  CONSTRAINT balance_adjustments_adjusted_by_fkey FOREIGN KEY (adjusted_by) REFERENCES public.users(user_id)
);


CREATE TABLE public.complaints (
  complaint_id uuid NOT NULL DEFAULT gen_random_uuid(),
  society_id uuid NOT NULL,
  filed_by uuid NOT NULL,
  title character varying NOT NULL,
  description text,
  status character varying NOT NULL DEFAULT 'open'::character varying CHECK (status::text = ANY (ARRAY['open'::character varying, 'acknowledged'::character varying, 'resolved'::character varying, 'cleared'::character varying]::text[])),
  cleared_at timestamp without time zone,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT complaints_pkey PRIMARY KEY (complaint_id),
  CONSTRAINT complaints_society_id_fkey FOREIGN KEY (society_id) REFERENCES public.societies(society_id),
  CONSTRAINT complaints_filed_by_fkey FOREIGN KEY (filed_by) REFERENCES public.users(user_id)
);


CREATE TABLE public.flat_bills (
  flat_bill_id uuid NOT NULL DEFAULT uuid_generate_v4(),
  bill_id uuid NOT NULL,
  flat_id uuid NOT NULL,
  flat_number character varying NOT NULL,
  society_id uuid NOT NULL,
  bill_amount numeric NOT NULL,
  total_paid numeric DEFAULT 0.00,
  balance_due numeric NOT NULL DEFAULT 0,
  status character varying DEFAULT 'pending'::character varying,
  paid_at timestamp without time zone,
  created_at timestamp without time zone DEFAULT now(),
  discounted_amount numeric NOT NULL DEFAULT 0,
  CONSTRAINT flat_bills_pkey PRIMARY KEY (flat_bill_id),
  CONSTRAINT flat_bills_bill_id_fkey FOREIGN KEY (bill_id) REFERENCES public.maintenance_bills(bill_id),
  CONSTRAINT flat_bills_flat_id_fkey FOREIGN KEY (flat_id) REFERENCES public.flats(flat_id),
  CONSTRAINT flat_bills_society_id_fkey FOREIGN KEY (society_id) REFERENCES public.societies(society_id)
);


CREATE TABLE public.flat_ledger (
  ledger_id uuid NOT NULL DEFAULT uuid_generate_v4(),
  flat_id uuid NOT NULL UNIQUE,
  flat_number character varying NOT NULL,
  society_id uuid NOT NULL,
  balance numeric DEFAULT 0.00,
  last_updated timestamp without time zone DEFAULT now(),
  CONSTRAINT flat_ledger_pkey PRIMARY KEY (ledger_id),
  CONSTRAINT flat_ledger_flat_id_fkey FOREIGN KEY (flat_id) REFERENCES public.flats(flat_id),
  CONSTRAINT flat_ledger_society_id_fkey FOREIGN KEY (society_id) REFERENCES public.societies(society_id)
);


CREATE TABLE public.flats (
  flat_id uuid NOT NULL DEFAULT gen_random_uuid(),
  society_id uuid NOT NULL,
  flat_number character varying NOT NULL,
  owner_id uuid NOT NULL,
  area_sqft numeric,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT flats_pkey PRIMARY KEY (flat_id),
  CONSTRAINT flats_society_id_fkey FOREIGN KEY (society_id) REFERENCES public.societies(society_id),
  CONSTRAINT flats_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.users(user_id)
);


CREATE TABLE public.maintenance_bills (
  bill_id uuid NOT NULL DEFAULT uuid_generate_v4(),
  society_id uuid NOT NULL,
  bill_month character varying NOT NULL,
  bill_year integer NOT NULL,
  default_amount numeric NOT NULL,
  due_date date NOT NULL,
  title character varying NOT NULL,
  description text,
  created_by uuid NOT NULL,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT maintenance_bills_pkey PRIMARY KEY (bill_id),
  CONSTRAINT maintenance_bills_society_id_fkey FOREIGN KEY (society_id) REFERENCES public.societies(society_id),
  CONSTRAINT maintenance_bills_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(user_id)
);


CREATE TABLE public.notices (
  notice_id uuid NOT NULL DEFAULT gen_random_uuid(),
  society_id uuid NOT NULL,
  created_by uuid NOT NULL,
  title character varying NOT NULL,
  description text,
  notice_type character varying NOT NULL DEFAULT 'general'::character varying CHECK (notice_type::text = ANY (ARRAY['general'::character varying, 'urgent'::character varying, 'maintenance'::character varying]::text[])),
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT notices_pkey PRIMARY KEY (notice_id),
  CONSTRAINT notices_society_id_fkey FOREIGN KEY (society_id) REFERENCES public.societies(society_id),
  CONSTRAINT notices_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(user_id)
);


CREATE TABLE public.payment_transactions (
  transaction_id uuid NOT NULL DEFAULT uuid_generate_v4(),
  flat_bill_id uuid NOT NULL,
  flat_id uuid NOT NULL,
  flat_number character varying NOT NULL,
  society_id uuid NOT NULL,
  amount_paid numeric NOT NULL,
  payment_method character varying NOT NULL,
  payment_date date NOT NULL,
  transaction_reference character varying,
  remarks text,
  paid_by uuid,
  recorded_by uuid NOT NULL,
  recorded_at timestamp without time zone DEFAULT now(),
  CONSTRAINT payment_transactions_pkey PRIMARY KEY (transaction_id),
  CONSTRAINT payment_transactions_flat_bill_id_fkey FOREIGN KEY (flat_bill_id) REFERENCES public.flat_bills(flat_bill_id),
  CONSTRAINT payment_transactions_flat_id_fkey FOREIGN KEY (flat_id) REFERENCES public.flats(flat_id),
  CONSTRAINT payment_transactions_society_id_fkey FOREIGN KEY (society_id) REFERENCES public.societies(society_id),
  CONSTRAINT payment_transactions_paid_by_fkey FOREIGN KEY (paid_by) REFERENCES public.users(user_id),
  CONSTRAINT payment_transactions_recorded_by_fkey FOREIGN KEY (recorded_by) REFERENCES public.users(user_id)
);


CREATE TABLE public.payments (
  payment_id uuid NOT NULL DEFAULT gen_random_uuid(),
  flat_id uuid NOT NULL,
  society_id uuid NOT NULL,
  month character varying NOT NULL,
  year integer NOT NULL,
  amount_due numeric NOT NULL DEFAULT 0,
  paid boolean DEFAULT false,
  paid_date timestamp without time zone,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT payments_pkey PRIMARY KEY (payment_id),
  CONSTRAINT payments_flat_id_fkey FOREIGN KEY (flat_id) REFERENCES public.flats(flat_id),
  CONSTRAINT payments_society_id_fkey FOREIGN KEY (society_id) REFERENCES public.societies(society_id)
);


CREATE TABLE public.societies (
  society_id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL UNIQUE,
  location character varying,
  city character varying,
  state character varying,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT societies_pkey PRIMARY KEY (society_id)
);


CREATE TABLE public.users (
  user_id uuid NOT NULL DEFAULT gen_random_uuid(),
  society_id uuid NOT NULL,
  email character varying NOT NULL UNIQUE,
  phone character varying NOT NULL,
  name character varying NOT NULL,
  flat_number character varying NOT NULL,
  role character varying NOT NULL CHECK (role::text = ANY (ARRAY['resident'::character varying, 'secretary'::character varying, 'chairman'::character varying, 'security'::character varying]::text[])),
  password_hash character varying NOT NULL,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT users_pkey PRIMARY KEY (user_id),
  CONSTRAINT users_society_id_fkey FOREIGN KEY (society_id) REFERENCES public.societies(society_id)
);


CREATE TABLE public.vehicles (
  vehicle_id uuid NOT NULL DEFAULT gen_random_uuid(),
  added_by uuid NOT NULL,
  society_id uuid NOT NULL,
  number_plate character varying NOT NULL UNIQUE,
  vehicle_type character varying NOT NULL CHECK (vehicle_type::text = ANY (ARRAY['2-wheeler'::character varying, '4-wheeler'::character varying, 'auto'::character varying, 'commercial'::character varying]::text[])),
  color character varying,
  vehicle_brand character varying,
  vehicle_model character varying,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  flat_id uuid NOT NULL,
  CONSTRAINT vehicles_pkey PRIMARY KEY (vehicle_id),
  CONSTRAINT vehicles_user_id_fkey FOREIGN KEY (added_by) REFERENCES public.users(user_id),
  CONSTRAINT vehicles_society_id_fkey FOREIGN KEY (society_id) REFERENCES public.societies(society_id),
  CONSTRAINT vehicles_flat_id_fkey FOREIGN KEY (flat_id) REFERENCES public.flats(flat_id)
);
```
---

Functions,
1. calculate_discounted_bill_on_create
```sql
DECLARE
  v_ledger_balance DECIMAL(10,2);
  v_discounted_amt DECIMAL(10,2);
BEGIN
  -- Get current ledger balance (default to 0 if doesn't exist)
  SELECT COALESCE(balance, 0) INTO v_ledger_balance
  FROM flat_ledger
  WHERE flat_id = NEW.flat_id;


  -- Calculate: discounted_amount = bill_amount - ledger_balance
  v_discounted_amt := NEW.bill_amount - v_ledger_balance;
  
  -- Ensure not negative
  v_discounted_amt := GREATEST(0, v_discounted_amt);


  -- Set values BEFORE inserting the row
  NEW.discounted_amount := v_discounted_amt;
  NEW.balance_due := v_discounted_amt;


  RETURN NEW;
END;
```
2. update_flat_bill_status
```sql
DECLARE
  v_total_paid DECIMAL(10,2);
  v_disc_amt DECIMAL(10,2);
  v_bal_due DECIMAL(10,2);
BEGIN
  -- Get discounted amount for this bill
  SELECT discounted_amount INTO v_disc_amt
  FROM flat_bills
  WHERE flat_bill_id = NEW.flat_bill_id;


  -- Calculate total paid for THIS specific bill
  SELECT COALESCE(SUM(amount_paid), 0) INTO v_total_paid
  FROM payment_transactions
  WHERE flat_bill_id = NEW.flat_bill_id;


  -- Calculate balance due
  v_bal_due := v_disc_amt - v_total_paid;


  -- Update flat_bills with new status based on DISCOUNTED amount
  UPDATE flat_bills
  SET 
    total_paid = v_total_paid,
    balance_due = v_bal_due,
    status = CASE
      WHEN v_total_paid >= v_disc_amt THEN 'paid'
      WHEN v_total_paid > 0 AND v_total_paid < v_disc_amt THEN 'partial'
      ELSE 'pending'
    END,
    paid_at = CASE
      WHEN v_total_paid >= v_disc_amt THEN NOW()
      ELSE NULL
    END
  WHERE flat_bill_id = NEW.flat_bill_id;
  
  RETURN NEW;
END;
```
3. update_flat_ledger
```sql
DECLARE
  total_paid_amount DECIMAL(10,2);
  total_bill_amount DECIMAL(10,2);
  total_adjustments DECIMAL(10,2);
  final_balance DECIMAL(10,2);
BEGIN
  -- Calculate total amount PAID by this flat (across all bills)
  SELECT COALESCE(SUM(amount_paid), 0)
  INTO total_paid_amount
  FROM payment_transactions
  WHERE flat_id = NEW.flat_id;


  -- Calculate total amount BILLED to this flat (across all bills)
  SELECT COALESCE(SUM(bill_amount), 0)
  INTO total_bill_amount
  FROM flat_bills
  WHERE flat_id = NEW.flat_id;


  -- Calculate total ADJUSTMENTS for this flat
  SELECT COALESCE(SUM(amount), 0)
  INTO total_adjustments
  FROM balance_adjustments
  WHERE flat_id = NEW.flat_id;


  -- Final balance = Total Paid - Total Billed + Adjustments
  -- Positive = Advance (paid more than billed)
  -- Negative = Due (billed more than paid)
  final_balance := total_paid_amount - total_bill_amount + total_adjustments;


  -- Insert or update ledger
  INSERT INTO flat_ledger (flat_id, flat_number, society_id, balance, last_updated)
  VALUES (NEW.flat_id, NEW.flat_number, NEW.society_id, final_balance, NOW())
  ON CONFLICT (flat_id)
  DO UPDATE SET 
    balance = final_balance,
    last_updated = NOW();


  RETURN NEW;
END;
```
4. update_ledger_adjustment
```sql
DECLARE
BEGIN
  UPDATE flat_ledger
  SET 
    balance = balance + NEW.amount,
    last_updated = NOW()
  WHERE flat_id = NEW.flat_id;
  
  IF NOT FOUND THEN
    INSERT INTO flat_ledger (flat_id, flat_number, society_id, balance, last_updated)
    VALUES (NEW.flat_id, NEW.flat_number, NEW.society_id, NEW.amount, NOW());
  END IF;
  
  RETURN NEW;
END;
```
---

Triggers,

1. trg_calculate_discounted_bill
Table - flat_bills
Function - calculate_discounted_bill_on_create
Events - Before Insert

2. trg_update_flat_bill_status
Table - payment_transactions
Function - update_flat_bill_status
Events - After Insert

3. trg_update_ledger_adjustment
Table - balance_adjustment
Function - update_ledger_adjustment
Events - After Insert

4. trg_update_ledger_payment
Table - payment_transactions
Function - update_flat_ledger
Events - After Insert

---