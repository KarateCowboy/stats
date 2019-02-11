exports.up = async (knex) => {
  await knex.raw(`
CREATE TABLE dtl.platforms (
  platform    TEXT NOT NULL PRIMARY KEY,
  description TEXT NOT NULL,
  label       TEXT NOT NULL
);

INSERT INTO dtl.platforms (platform, description, label) VALUES
('winx64', 'Muon Windows 64', 'Muon Win64'),
('winia32', 'Muon Windows 32', 'Muon Win32'),
('osx', 'Muon OSX', 'Muon OSX'),
('linux', 'Muon Linux', 'Muon Linux'),
('winx64-bc', 'Brave Core Windows 64', 'Core Win64'),
('winia32-bc', 'Brave Core  Windows 32', 'Core Win32'),
('osx-bc', 'Brave Core OSX', 'Core OSX'),
('linux-bc', 'Brave Core Linux', 'Core Linux'),
('android', 'Link Bubble', 'Link Bubble'),
('androidbrowser', 'Android', 'Android'),
('ios', 'iOS', 'iOS'),
('unknown', 'Unknown', 'Unknown')
;

INSERT INTO dtl.channels (channel, description, label) VALUES ('unknown', 'Unknown', 'Unknown');

CREATE TABLE dw.fc_agg_usage_daily (
  ymd          DATE    NOT NULL,
  platform     TEXT    NOT NULL REFERENCES dtl.platforms(platform),
  channel      TEXT    NOT NULL REFERENCES dtl.channels(channel),
  version      TEXT    NOT NULL,
  ref          TEXT    NOT NULL DEFAULT 'none',
  woi          DATE    NOT NULL,
  doi          DATE    NOT NULL,
  country_code TEXT    NOT NULL,
  first_time   BOOLEAN NOT NULL,
  total        BIGINT  NOT NULL,
  PRIMARY KEY (ymd, platform, channel, version, ref, woi, doi, country_code, first_time)
);

CREATE TABLE dw.fc_agg_usage_weekly (
  ymd          DATE    NOT NULL,
  platform     TEXT    NOT NULL REFERENCES dtl.platforms(platform),
  channel      TEXT    NOT NULL REFERENCES dtl.channels(channel),
  version      TEXT    NOT NULL,
  ref          TEXT    NOT NULL DEFAULT 'none',
  woi          DATE    NOT NULL,
  doi          DATE    NOT NULL,
  country_code TEXT    NOT NULL,
  first_time   BOOLEAN NOT NULL,
  total        BIGINT  NOT NULL,
  PRIMARY KEY (ymd, platform, channel, version, ref, woi, doi, country_code, first_time)
);

CREATE TABLE dw.fc_agg_usage_monthly (
  ymd          DATE    NOT NULL,
  platform     TEXT    NOT NULL REFERENCES dtl.platforms(platform),
  channel      TEXT    NOT NULL REFERENCES dtl.channels(channel),
  version      TEXT    NOT NULL,
  ref          TEXT    NOT NULL DEFAULT 'none',
  woi          DATE    NOT NULL,
  doi          DATE    NOT NULL,
  country_code TEXT    NOT NULL,
  first_time   BOOLEAN NOT NULL,
  total        BIGINT  NOT NULL,
  PRIMARY KEY (ymd, platform, channel, version, ref, woi, doi, country_code, first_time)
);

    `)
}

exports.down = async (knex) => {
  await knex.raw(`
DELETE FROM dtl.channels WHERE channel='unknown';
DROP TABLE dw.fc_agg_usage_monthly;
DROP TABLE dw.fc_agg_usage_weekly;
DROP TABLE dw.fc_agg_usage_daily;
DROP TABLE dtl.platforms;
    `)
}
