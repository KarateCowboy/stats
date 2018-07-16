BEGIN;
ALTER TABLE dw.fc_usage DROP CONSTRAINT valid_platforms;
ALTER TABLE dw.fc_usage ADD CONSTRAINT valid_platforms CHECK ( platform IN ( 'osx', 'winx64', 'winia32', 'android', 'ios', 'unknown', 'linux','androidbrowser') );
COMMIT;
