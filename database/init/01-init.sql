-- Initialize Open Denkaru Database with optimizations
-- Medical-grade PostgreSQL configuration

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- Create dedicated schemas for organization
CREATE SCHEMA IF NOT EXISTS medical;
CREATE SCHEMA IF NOT EXISTS audit;
CREATE SCHEMA IF NOT EXISTS analytics;

-- Set timezone to Japan
SET timezone = 'Asia/Tokyo';

-- Create custom types for medical data
CREATE TYPE medical.gender_type AS ENUM ('male', 'female', 'other', 'unknown');
CREATE TYPE medical.blood_type AS ENUM ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown');
CREATE TYPE medical.prescription_status AS ENUM ('下書き', '有効', '完了', '取消', '期限切れ');
CREATE TYPE medical.lab_order_status AS ENUM ('下書き', 'オーダー済み', '検査中', '完了', '取消');
CREATE TYPE medical.record_status AS ENUM ('draft', 'signed', 'amended', 'archived');

-- Performance optimizations
-- Increase work_mem for complex queries
SET work_mem = '256MB';

-- Enable parallel query execution
SET max_parallel_workers_per_gather = 4;
SET parallel_tuple_cost = 0.1;
SET parallel_setup_cost = 1000;

-- Optimize for OLTP workload
SET random_page_cost = 1.1;
SET effective_cache_size = '2GB';
SET shared_buffers = '512MB';

-- Enable logging for performance monitoring
SET log_min_duration_statement = 1000; -- Log slow queries (>1 second)
SET log_checkpoints = on;
SET log_connections = on;
SET log_disconnections = on;

-- Create audit trigger function for medical records
CREATE OR REPLACE FUNCTION audit.audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit.audit_log (
            table_name, 
            operation, 
            record_id, 
            new_data, 
            changed_by, 
            changed_at
        ) VALUES (
            TG_TABLE_NAME, 
            TG_OP, 
            NEW.id, 
            row_to_json(NEW), 
            current_user, 
            NOW()
        );
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit.audit_log (
            table_name, 
            operation, 
            record_id, 
            old_data, 
            new_data, 
            changed_by, 
            changed_at
        ) VALUES (
            TG_TABLE_NAME, 
            TG_OP, 
            NEW.id, 
            row_to_json(OLD), 
            row_to_json(NEW), 
            current_user, 
            NOW()
        );
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit.audit_log (
            table_name, 
            operation, 
            record_id, 
            old_data, 
            changed_by, 
            changed_at
        ) VALUES (
            TG_TABLE_NAME, 
            TG_OP, 
            OLD.id, 
            row_to_json(OLD), 
            current_user, 
            NOW()
        );
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create audit log table
CREATE TABLE IF NOT EXISTS audit.audit_log (
    id SERIAL PRIMARY KEY,
    table_name TEXT NOT NULL,
    operation TEXT NOT NULL,
    record_id TEXT NOT NULL,
    old_data JSONB,
    new_data JSONB,
    changed_by TEXT NOT NULL,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for audit log
CREATE INDEX IF NOT EXISTS idx_audit_log_table_name ON audit.audit_log (table_name);
CREATE INDEX IF NOT EXISTS idx_audit_log_record_id ON audit.audit_log (record_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_changed_at ON audit.audit_log (changed_at);
CREATE INDEX IF NOT EXISTS idx_audit_log_changed_by ON audit.audit_log (changed_by);

-- Create function for full-text search on patient data
CREATE OR REPLACE FUNCTION medical.search_patients(search_term TEXT)
RETURNS TABLE (
    id UUID,
    patient_number TEXT,
    full_name TEXT,
    full_name_kana TEXT,
    birth_date DATE,
    gender medical.gender_type,
    phone_number TEXT,
    rank REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.patient_number,
        p.family_name || ' ' || p.given_name as full_name,
        p.family_name_kana || ' ' || p.given_name_kana as full_name_kana,
        p.birth_date,
        p.gender,
        p.phone_number,
        (
            similarity(p.family_name || ' ' || p.given_name, search_term) +
            similarity(p.family_name_kana || ' ' || p.given_name_kana, search_term) +
            similarity(p.patient_number, search_term)
        ) / 3.0 as rank
    FROM patients p
    WHERE 
        p.is_active = true
        AND (
            (p.family_name || ' ' || p.given_name) % search_term
            OR (p.family_name_kana || ' ' || p.given_name_kana) % search_term
            OR p.patient_number % search_term
            OR p.phone_number % search_term
        )
    ORDER BY rank DESC, p.created_at DESC
    LIMIT 50;
END;
$$ LANGUAGE plpgsql;

-- Create analytics views for medical insights
CREATE OR REPLACE VIEW analytics.patient_summary AS
SELECT 
    COUNT(*) as total_patients,
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as new_patients_30d,
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as new_patients_7d,
    ROUND(AVG(EXTRACT(YEAR FROM AGE(birth_date)))) as average_age,
    COUNT(*) FILTER (WHERE gender = 'male') as male_patients,
    COUNT(*) FILTER (WHERE gender = 'female') as female_patients
FROM patients 
WHERE is_active = true;

-- Create materialized view for prescription analytics
CREATE MATERIALIZED VIEW IF NOT EXISTS analytics.prescription_insights AS
SELECT 
    DATE_TRUNC('month', prescribed_date) as month,
    COUNT(*) as total_prescriptions,
    COUNT(*) FILTER (WHERE status = '有効') as active_prescriptions,
    COUNT(*) FILTER (WHERE status = '完了') as completed_prescriptions,
    AVG(
        SELECT COUNT(*) 
        FROM prescription_items pi 
        WHERE pi.prescription_id = p.id
    ) as avg_medications_per_prescription
FROM prescriptions p
GROUP BY DATE_TRUNC('month', prescribed_date)
ORDER BY month DESC;

-- Create index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_prescription_insights_month 
ON analytics.prescription_insights (month);

-- Function to refresh analytics
CREATE OR REPLACE FUNCTION analytics.refresh_insights()
RETURNS VOID AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY analytics.prescription_insights;
END;
$$ LANGUAGE plpgsql;

-- Create user roles for medical staff
DO $$
BEGIN
    -- Create roles if they don't exist
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'medical_admin') THEN
        CREATE ROLE medical_admin;
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'medical_doctor') THEN
        CREATE ROLE medical_doctor;
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'medical_nurse') THEN
        CREATE ROLE medical_nurse;
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'medical_clerk') THEN
        CREATE ROLE medical_clerk;
    END IF;
END
$$;

-- Grant permissions
-- Medical Admin: Full access
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO medical_admin;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA medical TO medical_admin;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA audit TO medical_admin;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA analytics TO medical_admin;

-- Medical Doctor: Full patient and medical records access
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO medical_doctor;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA medical TO medical_doctor;
GRANT SELECT ON ALL TABLES IN SCHEMA analytics TO medical_doctor;

-- Medical Nurse: Patient care access
GRANT SELECT, INSERT, UPDATE ON patients TO medical_nurse;
GRANT SELECT ON prescriptions, prescription_items, medications TO medical_nurse;
GRANT SELECT, INSERT, UPDATE ON lab_orders, lab_order_items TO medical_nurse;

-- Medical Clerk: Administrative access
GRANT SELECT, INSERT, UPDATE ON patients TO medical_clerk;
GRANT SELECT ON prescriptions, lab_orders TO medical_clerk;

-- Create backup and maintenance functions
CREATE OR REPLACE FUNCTION medical.backup_patient_data(patient_uuid UUID)
RETURNS JSONB AS $$
DECLARE
    patient_data JSONB;
BEGIN
    SELECT jsonb_build_object(
        'patient', row_to_json(p),
        'prescriptions', (
            SELECT jsonb_agg(row_to_json(pr))
            FROM prescriptions pr
            WHERE pr.patient_id = patient_uuid
        ),
        'lab_orders', (
            SELECT jsonb_agg(row_to_json(lo))
            FROM lab_orders lo
            WHERE lo.patient_id = patient_uuid
        )
    ) INTO patient_data
    FROM patients p
    WHERE p.id = patient_uuid;
    
    RETURN patient_data;
END;
$$ LANGUAGE plpgsql;

-- Function to anonymize patient data for research
CREATE OR REPLACE FUNCTION medical.anonymize_patient_data()
RETURNS VOID AS $$
BEGIN
    -- This would be used for creating research datasets
    -- Implementation would depend on specific anonymization requirements
    RAISE NOTICE 'Patient data anonymization function placeholder';
END;
$$ LANGUAGE plpgsql;

-- Create scheduled job function for maintenance
CREATE OR REPLACE FUNCTION medical.daily_maintenance()
RETURNS VOID AS $$
BEGIN
    -- Refresh analytics
    PERFORM analytics.refresh_insights();
    
    -- Clean up old audit logs (keep 1 year)
    DELETE FROM audit.audit_log 
    WHERE changed_at < NOW() - INTERVAL '1 year';
    
    -- Update prescription statuses
    UPDATE prescriptions 
    SET status = '期限切れ
    WHERE status = '有効' 
    AND valid_until < CURRENT_DATE;
    
    -- Log maintenance completion
    INSERT INTO audit.audit_log (
        table_name, 
        operation, 
        record_id, 
        new_data, 
        changed_by, 
        changed_at
    ) VALUES (
        'system', 
        'MAINTENANCE', 
        'daily', 
        '{"message": "Daily maintenance completed"}', 
        'system', 
        NOW()
    );
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions on functions
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA medical TO medical_admin, medical_doctor;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA analytics TO medical_admin, medical_doctor, medical_nurse;

COMMIT;