CREATE TABLE dtl.crashes_archive (
  id TEXT NOT NULL PRIMARY KEY,
  ts TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  contents JSONB NOT NULL,
  github_repo TEXT,
  github_issue_number TEXT
);

CREATE TABLE dtl.fti_archive (
  id          BIGSERIAL NOT NULL PRIMARY KEY,
  object_type TEXT      NOT NULL REFERENCES dtl.object_types(object_type),
  object_id   TEXT      NOT NULL,
  searchable  TSVECTOR  NOT NULL,
  UNIQUE(object_type, object_id)
)
