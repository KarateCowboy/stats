CREATE OR REPLACE FUNCTION week_diff(d1 date, d2 date) RETURNS bigint AS $$
    BEGIN
    RETURN floor((d1 - d2) / 7) :: bigint;
    END;
    $$
    LANGUAGE plpgsql;

