CREATE INDEX fti_object_id_idx ON dtl.fti(object_id);
CREATE INDEX crashes_crash_id_idx ON dtl.crashes((contents->>'crash_id'));