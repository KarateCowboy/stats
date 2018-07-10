BEGIN;
ALTER TABLE dw.fc_retention_woi DROP CONSTRAINT valid_platforms;
ALTER TABLE dw.fc_retention_woi ADD CONSTRAINT valid_platforms CHECK ( platform IN ( 'osx', 'winx64', 'winia32', 'android', 'ios', 'unknown', 'linux', 'androidbrowser','osx-bc','linux-bc','winx64-bc','winia32-bc' ) );
COMMIT;
BEGIN;
INSERT INTO dtl.channels (channel, description, label) VALUES('release','something something','Another release?');
COMMIT;
