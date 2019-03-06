exports.up = async (knex) => {
  await knex.raw(`
    CREATE TABLE dtl.regions (
      id    TEXT NOT NULL PRIMARY KEY,
      label TEXT NOT NULL,
      ord   INTEGER NOT NULL DEFAULT 0,
      UNIQUE(label)
    );

    CREATE TABLE dtl.countries (
      id        TEXT NOT NULL,
      region_id TEXT NOT NULL REFERENCES dtl.regions(id),
      label     TEXT NOT NULL,
      PRIMARY KEY(id),
      UNIQUE(label)
    );

insert into dtl.regions (id, label, ord) values ('Southern Asia', 'Southern Asia', 11);
insert into dtl.countries (id, region_id, label) values ('AF', 'Southern Asia', 'Afghanistan');
insert into dtl.countries (id, region_id, label) values ('BD', 'Southern Asia', 'Bangladesh');
insert into dtl.countries (id, region_id, label) values ('BT', 'Southern Asia', 'Bhutan');
insert into dtl.countries (id, region_id, label) values ('IN', 'Southern Asia', 'India');
insert into dtl.countries (id, region_id, label) values ('IR', 'Southern Asia', 'Iran (Islamic Republic of)');
insert into dtl.countries (id, region_id, label) values ('MV', 'Southern Asia', 'Maldives');
insert into dtl.countries (id, region_id, label) values ('NP', 'Southern Asia', 'Nepal');
insert into dtl.countries (id, region_id, label) values ('PK', 'Southern Asia', 'Pakistan');
insert into dtl.countries (id, region_id, label) values ('LK', 'Southern Asia', 'Sri Lanka');
insert into dtl.regions (id, label, ord) values ('Northern Europe', 'Northern Europe', 4);
insert into dtl.countries (id, region_id, label) values ('AX', 'Northern Europe', 'Åland Islands');
insert into dtl.countries (id, region_id, label) values ('DK', 'Northern Europe', 'Denmark');
insert into dtl.countries (id, region_id, label) values ('EE', 'Northern Europe', 'Estonia');
insert into dtl.countries (id, region_id, label) values ('FO', 'Northern Europe', 'Faroe Islands');
insert into dtl.countries (id, region_id, label) values ('FI', 'Northern Europe', 'Finland');
insert into dtl.countries (id, region_id, label) values ('GG', 'Northern Europe', 'Guernsey');
insert into dtl.countries (id, region_id, label) values ('IS', 'Northern Europe', 'Iceland');
insert into dtl.countries (id, region_id, label) values ('IE', 'Northern Europe', 'Ireland');
insert into dtl.countries (id, region_id, label) values ('IM', 'Northern Europe', 'Isle of Man');
insert into dtl.countries (id, region_id, label) values ('JE', 'Northern Europe', 'Jersey');
insert into dtl.countries (id, region_id, label) values ('LV', 'Northern Europe', 'Latvia');
insert into dtl.countries (id, region_id, label) values ('LT', 'Northern Europe', 'Lithuania');
insert into dtl.countries (id, region_id, label) values ('NO', 'Northern Europe', 'Norway');
insert into dtl.countries (id, region_id, label) values ('SJ', 'Northern Europe', 'Svalbard and Jan Mayen');
insert into dtl.countries (id, region_id, label) values ('SE', 'Northern Europe', 'Sweden');
insert into dtl.countries (id, region_id, label) values ('GB', 'Northern Europe', 'United Kingdom');
insert into dtl.regions (id, label, ord) values ('Southern Europe', 'Southern Europe', 5);
insert into dtl.countries (id, region_id, label) values ('AL', 'Southern Europe', 'Albania');
insert into dtl.countries (id, region_id, label) values ('AD', 'Southern Europe', 'Andorra');
insert into dtl.countries (id, region_id, label) values ('BA', 'Southern Europe', 'Bosnia and Herzegovina');
insert into dtl.countries (id, region_id, label) values ('HR', 'Southern Europe', 'Croatia');
insert into dtl.countries (id, region_id, label) values ('GI', 'Southern Europe', 'Gibraltar');
insert into dtl.countries (id, region_id, label) values ('GR', 'Southern Europe', 'Greece');
insert into dtl.countries (id, region_id, label) values ('VA', 'Southern Europe', 'Holy See');
insert into dtl.countries (id, region_id, label) values ('IT', 'Southern Europe', 'Italy');
insert into dtl.countries (id, region_id, label) values ('MK', 'Southern Europe', 'Macedonia');
insert into dtl.countries (id, region_id, label) values ('MT', 'Southern Europe', 'Malta');
insert into dtl.countries (id, region_id, label) values ('ME', 'Southern Europe', 'Montenegro');
insert into dtl.countries (id, region_id, label) values ('PT', 'Southern Europe', 'Portugal');
insert into dtl.countries (id, region_id, label) values ('SM', 'Southern Europe', 'San Marino');
insert into dtl.countries (id, region_id, label) values ('RS', 'Southern Europe', 'Serbia');
insert into dtl.countries (id, region_id, label) values ('SI', 'Southern Europe', 'Slovenia');
insert into dtl.countries (id, region_id, label) values ('ES', 'Southern Europe', 'Spain');
insert into dtl.regions (id, label, ord) values ('Northern Africa', 'Northern Africa', 7);
insert into dtl.countries (id, region_id, label) values ('DZ', 'Northern Africa', 'Algeria');
insert into dtl.countries (id, region_id, label) values ('EG', 'Northern Africa', 'Egypt');
insert into dtl.countries (id, region_id, label) values ('LY', 'Northern Africa', 'Libya');
insert into dtl.countries (id, region_id, label) values ('MA', 'Northern Africa', 'Morocco');
insert into dtl.countries (id, region_id, label) values ('SD', 'Northern Africa', 'Sudan');
insert into dtl.countries (id, region_id, label) values ('TN', 'Northern Africa', 'Tunisia');
insert into dtl.countries (id, region_id, label) values ('EH', 'Northern Africa', 'Western Sahara');
insert into dtl.regions (id, label, ord) values ('Polynesia', 'Polynesia', 17);
insert into dtl.countries (id, region_id, label) values ('AS', 'Polynesia', 'American Samoa');
insert into dtl.countries (id, region_id, label) values ('CK', 'Polynesia', 'Cook Islands');
insert into dtl.countries (id, region_id, label) values ('PF', 'Polynesia', 'French Polynesia');
insert into dtl.countries (id, region_id, label) values ('NU', 'Polynesia', 'Niue');
insert into dtl.countries (id, region_id, label) values ('PN', 'Polynesia', 'Pitcairn');
insert into dtl.countries (id, region_id, label) values ('WS', 'Polynesia', 'Samoa');
insert into dtl.countries (id, region_id, label) values ('TK', 'Polynesia', 'Tokelau');
insert into dtl.countries (id, region_id, label) values ('TO', 'Polynesia', 'Tonga');
insert into dtl.countries (id, region_id, label) values ('TV', 'Polynesia', 'Tuvalu');
insert into dtl.countries (id, region_id, label) values ('WF', 'Polynesia', 'Wallis and Futuna');
insert into dtl.regions (id, label, ord) values ('Sub-Saharan Africa', 'Sub-Saharan Africa', 8);
insert into dtl.countries (id, region_id, label) values ('AO', 'Sub-Saharan Africa', 'Angola');
insert into dtl.countries (id, region_id, label) values ('BJ', 'Sub-Saharan Africa', 'Benin');
insert into dtl.countries (id, region_id, label) values ('BW', 'Sub-Saharan Africa', 'Botswana');
insert into dtl.countries (id, region_id, label) values ('IO', 'Sub-Saharan Africa', 'British Indian Ocean Territory');
insert into dtl.countries (id, region_id, label) values ('BF', 'Sub-Saharan Africa', 'Burkina Faso');
insert into dtl.countries (id, region_id, label) values ('BI', 'Sub-Saharan Africa', 'Burundi');
insert into dtl.countries (id, region_id, label) values ('CV', 'Sub-Saharan Africa', 'Cabo Verde');
insert into dtl.countries (id, region_id, label) values ('CM', 'Sub-Saharan Africa', 'Cameroon');
insert into dtl.countries (id, region_id, label) values ('CF', 'Sub-Saharan Africa', 'Central African Republic');
insert into dtl.countries (id, region_id, label) values ('TD', 'Sub-Saharan Africa', 'Chad');
insert into dtl.countries (id, region_id, label) values ('KM', 'Sub-Saharan Africa', 'Comoros');
insert into dtl.countries (id, region_id, label) values ('CG', 'Sub-Saharan Africa', 'Congo');
insert into dtl.countries (id, region_id, label) values ('CD', 'Sub-Saharan Africa', 'Congo (Democratic Republic of the)');
insert into dtl.countries (id, region_id, label) values ('CI', 'Sub-Saharan Africa', 'Côte dIvoire');
insert into dtl.countries (id, region_id, label) values ('DJ', 'Sub-Saharan Africa', 'Djibouti');
insert into dtl.countries (id, region_id, label) values ('GQ', 'Sub-Saharan Africa', 'Equatorial Guinea');
insert into dtl.countries (id, region_id, label) values ('ER', 'Sub-Saharan Africa', 'Eritrea');
insert into dtl.countries (id, region_id, label) values ('SZ', 'Sub-Saharan Africa', 'Eswatini');
insert into dtl.countries (id, region_id, label) values ('ET', 'Sub-Saharan Africa', 'Ethiopia');
insert into dtl.countries (id, region_id, label) values ('TF', 'Sub-Saharan Africa', 'French Southern Territories');
insert into dtl.countries (id, region_id, label) values ('GA', 'Sub-Saharan Africa', 'Gabon');
insert into dtl.countries (id, region_id, label) values ('GM', 'Sub-Saharan Africa', 'Gambia');
insert into dtl.countries (id, region_id, label) values ('GH', 'Sub-Saharan Africa', 'Ghana');
insert into dtl.countries (id, region_id, label) values ('GN', 'Sub-Saharan Africa', 'Guinea');
insert into dtl.countries (id, region_id, label) values ('GW', 'Sub-Saharan Africa', 'Guinea-Bissau');
insert into dtl.countries (id, region_id, label) values ('KE', 'Sub-Saharan Africa', 'Kenya');
insert into dtl.countries (id, region_id, label) values ('LS', 'Sub-Saharan Africa', 'Lesotho');
insert into dtl.countries (id, region_id, label) values ('LR', 'Sub-Saharan Africa', 'Liberia');
insert into dtl.countries (id, region_id, label) values ('MG', 'Sub-Saharan Africa', 'Madagascar');
insert into dtl.countries (id, region_id, label) values ('MW', 'Sub-Saharan Africa', 'Malawi');
insert into dtl.countries (id, region_id, label) values ('ML', 'Sub-Saharan Africa', 'Mali');
insert into dtl.countries (id, region_id, label) values ('MR', 'Sub-Saharan Africa', 'Mauritania');
insert into dtl.countries (id, region_id, label) values ('MU', 'Sub-Saharan Africa', 'Mauritius');
insert into dtl.countries (id, region_id, label) values ('YT', 'Sub-Saharan Africa', 'Mayotte');
insert into dtl.countries (id, region_id, label) values ('MZ', 'Sub-Saharan Africa', 'Mozambique');
insert into dtl.countries (id, region_id, label) values ('NA', 'Sub-Saharan Africa', 'Namibia');
insert into dtl.countries (id, region_id, label) values ('NE', 'Sub-Saharan Africa', 'Niger');
insert into dtl.countries (id, region_id, label) values ('NG', 'Sub-Saharan Africa', 'Nigeria');
insert into dtl.countries (id, region_id, label) values ('RE', 'Sub-Saharan Africa', 'Réunion');
insert into dtl.countries (id, region_id, label) values ('RW', 'Sub-Saharan Africa', 'Rwanda');
insert into dtl.countries (id, region_id, label) values ('SH', 'Sub-Saharan Africa', 'Saint Helena, Ascension and Tristan da Cunha');
insert into dtl.countries (id, region_id, label) values ('ST', 'Sub-Saharan Africa', 'Sao Tome and Principe');
insert into dtl.countries (id, region_id, label) values ('SN', 'Sub-Saharan Africa', 'Senegal');
insert into dtl.countries (id, region_id, label) values ('SC', 'Sub-Saharan Africa', 'Seychelles');
insert into dtl.countries (id, region_id, label) values ('SL', 'Sub-Saharan Africa', 'Sierra Leone');
insert into dtl.countries (id, region_id, label) values ('SO', 'Sub-Saharan Africa', 'Somalia');
insert into dtl.countries (id, region_id, label) values ('ZA', 'Sub-Saharan Africa', 'South Africa');
insert into dtl.countries (id, region_id, label) values ('SS', 'Sub-Saharan Africa', 'South Sudan');
insert into dtl.countries (id, region_id, label) values ('TZ', 'Sub-Saharan Africa', 'Tanzania, United Republic of');
insert into dtl.countries (id, region_id, label) values ('TG', 'Sub-Saharan Africa', 'Togo');
insert into dtl.countries (id, region_id, label) values ('UG', 'Sub-Saharan Africa', 'Uganda');
insert into dtl.countries (id, region_id, label) values ('ZM', 'Sub-Saharan Africa', 'Zambia');
insert into dtl.countries (id, region_id, label) values ('ZW', 'Sub-Saharan Africa', 'Zimbabwe');
insert into dtl.regions (id, label, ord) values ('Latin America and the Caribbean', 'Latin America and the Caribbean', 2);
insert into dtl.countries (id, region_id, label) values ('AI', 'Latin America and the Caribbean', 'Anguilla');
insert into dtl.countries (id, region_id, label) values ('AG', 'Latin America and the Caribbean', 'Antigua and Barbuda');
insert into dtl.countries (id, region_id, label) values ('AR', 'Latin America and the Caribbean', 'Argentina');
insert into dtl.countries (id, region_id, label) values ('AW', 'Latin America and the Caribbean', 'Aruba');
insert into dtl.countries (id, region_id, label) values ('BS', 'Latin America and the Caribbean', 'Bahamas');
insert into dtl.countries (id, region_id, label) values ('BB', 'Latin America and the Caribbean', 'Barbados');
insert into dtl.countries (id, region_id, label) values ('BZ', 'Latin America and the Caribbean', 'Belize');
insert into dtl.countries (id, region_id, label) values ('BO', 'Latin America and the Caribbean', 'Bolivia (Plurinational State of)');
insert into dtl.countries (id, region_id, label) values ('BQ', 'Latin America and the Caribbean', 'Bonaire, Sint Eustatius and Saba');
insert into dtl.countries (id, region_id, label) values ('BV', 'Latin America and the Caribbean', 'Bouvet Island');
insert into dtl.countries (id, region_id, label) values ('BR', 'Latin America and the Caribbean', 'Brazil');
insert into dtl.countries (id, region_id, label) values ('KY', 'Latin America and the Caribbean', 'Cayman Islands');
insert into dtl.countries (id, region_id, label) values ('CL', 'Latin America and the Caribbean', 'Chile');
insert into dtl.countries (id, region_id, label) values ('CO', 'Latin America and the Caribbean', 'Colombia');
insert into dtl.countries (id, region_id, label) values ('CR', 'Latin America and the Caribbean', 'Costa Rica');
insert into dtl.countries (id, region_id, label) values ('CU', 'Latin America and the Caribbean', 'Cuba');
insert into dtl.countries (id, region_id, label) values ('CW', 'Latin America and the Caribbean', 'Curaçao');
insert into dtl.countries (id, region_id, label) values ('DM', 'Latin America and the Caribbean', 'Dominica');
insert into dtl.countries (id, region_id, label) values ('DO', 'Latin America and the Caribbean', 'Dominican Republic');
insert into dtl.countries (id, region_id, label) values ('EC', 'Latin America and the Caribbean', 'Ecuador');
insert into dtl.countries (id, region_id, label) values ('SV', 'Latin America and the Caribbean', 'El Salvador');
insert into dtl.countries (id, region_id, label) values ('FK', 'Latin America and the Caribbean', 'Falkland Islands (Malvinas)');
insert into dtl.countries (id, region_id, label) values ('GF', 'Latin America and the Caribbean', 'French Guiana');
insert into dtl.countries (id, region_id, label) values ('GD', 'Latin America and the Caribbean', 'Grenada');
insert into dtl.countries (id, region_id, label) values ('GP', 'Latin America and the Caribbean', 'Guadeloupe');
insert into dtl.countries (id, region_id, label) values ('GT', 'Latin America and the Caribbean', 'Guatemala');
insert into dtl.countries (id, region_id, label) values ('GY', 'Latin America and the Caribbean', 'Guyana');
insert into dtl.countries (id, region_id, label) values ('HT', 'Latin America and the Caribbean', 'Haiti');
insert into dtl.countries (id, region_id, label) values ('HN', 'Latin America and the Caribbean', 'Honduras');
insert into dtl.countries (id, region_id, label) values ('JM', 'Latin America and the Caribbean', 'Jamaica');
insert into dtl.countries (id, region_id, label) values ('MQ', 'Latin America and the Caribbean', 'Martinique');
insert into dtl.countries (id, region_id, label) values ('MX', 'Latin America and the Caribbean', 'Mexico');
insert into dtl.countries (id, region_id, label) values ('MS', 'Latin America and the Caribbean', 'Montserrat');
insert into dtl.countries (id, region_id, label) values ('NI', 'Latin America and the Caribbean', 'Nicaragua');
insert into dtl.countries (id, region_id, label) values ('PA', 'Latin America and the Caribbean', 'Panama');
insert into dtl.countries (id, region_id, label) values ('PY', 'Latin America and the Caribbean', 'Paraguay');
insert into dtl.countries (id, region_id, label) values ('PE', 'Latin America and the Caribbean', 'Peru');
insert into dtl.countries (id, region_id, label) values ('PR', 'Latin America and the Caribbean', 'Puerto Rico');
insert into dtl.countries (id, region_id, label) values ('BL', 'Latin America and the Caribbean', 'Saint Barthélemy');
insert into dtl.countries (id, region_id, label) values ('KN', 'Latin America and the Caribbean', 'Saint Kitts and Nevis');
insert into dtl.countries (id, region_id, label) values ('LC', 'Latin America and the Caribbean', 'Saint Lucia');
insert into dtl.countries (id, region_id, label) values ('MF', 'Latin America and the Caribbean', 'Saint Martin (French part)');
insert into dtl.countries (id, region_id, label) values ('VC', 'Latin America and the Caribbean', 'Saint Vincent and the Grenadines');
insert into dtl.countries (id, region_id, label) values ('SX', 'Latin America and the Caribbean', 'Sint Maarten (Dutch part)');
insert into dtl.countries (id, region_id, label) values ('GS', 'Latin America and the Caribbean', 'South Georgia and the South Sandwich Islands');
insert into dtl.countries (id, region_id, label) values ('SR', 'Latin America and the Caribbean', 'Suriname');
insert into dtl.countries (id, region_id, label) values ('TT', 'Latin America and the Caribbean', 'Trinidad and Tobago');
insert into dtl.countries (id, region_id, label) values ('TC', 'Latin America and the Caribbean', 'Turks and Caicos Islands');
insert into dtl.countries (id, region_id, label) values ('UY', 'Latin America and the Caribbean', 'Uruguay');
insert into dtl.countries (id, region_id, label) values ('VE', 'Latin America and the Caribbean', 'Venezuela (Bolivarian Republic of)');
insert into dtl.countries (id, region_id, label) values ('VG', 'Latin America and the Caribbean', 'Virgin Islands (British)');
insert into dtl.countries (id, region_id, label) values ('VI', 'Latin America and the Caribbean', 'Virgin Islands (U.S.)');
insert into dtl.regions (id, label, ord) values ('Western Asia', 'Western Asia', 9);
insert into dtl.countries (id, region_id, label) values ('AM', 'Western Asia', 'Armenia');
insert into dtl.countries (id, region_id, label) values ('AZ', 'Western Asia', 'Azerbaijan');
insert into dtl.countries (id, region_id, label) values ('BH', 'Western Asia', 'Bahrain');
insert into dtl.countries (id, region_id, label) values ('CY', 'Western Asia', 'Cyprus');
insert into dtl.countries (id, region_id, label) values ('GE', 'Western Asia', 'Georgia');
insert into dtl.countries (id, region_id, label) values ('IQ', 'Western Asia', 'Iraq');
insert into dtl.countries (id, region_id, label) values ('IL', 'Western Asia', 'Israel');
insert into dtl.countries (id, region_id, label) values ('JO', 'Western Asia', 'Jordan');
insert into dtl.countries (id, region_id, label) values ('KW', 'Western Asia', 'Kuwait');
insert into dtl.countries (id, region_id, label) values ('LB', 'Western Asia', 'Lebanon');
insert into dtl.countries (id, region_id, label) values ('OM', 'Western Asia', 'Oman');
insert into dtl.countries (id, region_id, label) values ('PS', 'Western Asia', 'Palestine, State of');
insert into dtl.countries (id, region_id, label) values ('QA', 'Western Asia', 'Qatar');
insert into dtl.countries (id, region_id, label) values ('SA', 'Western Asia', 'Saudi Arabia');
insert into dtl.countries (id, region_id, label) values ('SY', 'Western Asia', 'Syrian Arab Republic');
insert into dtl.countries (id, region_id, label) values ('TR', 'Western Asia', 'Turkey');
insert into dtl.countries (id, region_id, label) values ('AE', 'Western Asia', 'United Arab Emirates');
insert into dtl.countries (id, region_id, label) values ('YE', 'Western Asia', 'Yemen');
insert into dtl.regions (id, label, ord) values ('Australia and New Zealand', 'Australia and New Zealand', 14);
insert into dtl.countries (id, region_id, label) values ('AU', 'Australia and New Zealand', 'Australia');
insert into dtl.countries (id, region_id, label) values ('CX', 'Australia and New Zealand', 'Christmas Island');
insert into dtl.countries (id, region_id, label) values ('CC', 'Australia and New Zealand', 'Cocos (Keeling) Islands');
insert into dtl.countries (id, region_id, label) values ('HM', 'Australia and New Zealand', 'Heard Island and McDonald Islands');
insert into dtl.countries (id, region_id, label) values ('NZ', 'Australia and New Zealand', 'New Zealand');
insert into dtl.countries (id, region_id, label) values ('NF', 'Australia and New Zealand', 'Norfolk Island');
insert into dtl.regions (id, label, ord) values ('Western Europe', 'Western Europe', 3);
insert into dtl.countries (id, region_id, label) values ('AT', 'Western Europe', 'Austria');
insert into dtl.countries (id, region_id, label) values ('BE', 'Western Europe', 'Belgium');
insert into dtl.countries (id, region_id, label) values ('FR', 'Western Europe', 'France');
insert into dtl.countries (id, region_id, label) values ('DE', 'Western Europe', 'Germany');
insert into dtl.countries (id, region_id, label) values ('LI', 'Western Europe', 'Liechtenstein');
insert into dtl.countries (id, region_id, label) values ('LU', 'Western Europe', 'Luxembourg');
insert into dtl.countries (id, region_id, label) values ('MC', 'Western Europe', 'Monaco');
insert into dtl.countries (id, region_id, label) values ('NL', 'Western Europe', 'Netherlands');
insert into dtl.countries (id, region_id, label) values ('CH', 'Western Europe', 'Switzerland');
insert into dtl.regions (id, label, ord) values ('Eastern Europe', 'Eastern Europe', 6);
insert into dtl.countries (id, region_id, label) values ('BY', 'Eastern Europe', 'Belarus');
insert into dtl.countries (id, region_id, label) values ('BG', 'Eastern Europe', 'Bulgaria');
insert into dtl.countries (id, region_id, label) values ('CZ', 'Eastern Europe', 'Czechia');
insert into dtl.countries (id, region_id, label) values ('HU', 'Eastern Europe', 'Hungary');
insert into dtl.countries (id, region_id, label) values ('MD', 'Eastern Europe', 'Moldova (Republic of)');
insert into dtl.countries (id, region_id, label) values ('PL', 'Eastern Europe', 'Poland');
insert into dtl.countries (id, region_id, label) values ('RO', 'Eastern Europe', 'Romania');
insert into dtl.countries (id, region_id, label) values ('RU', 'Eastern Europe', 'Russian Federation');
insert into dtl.countries (id, region_id, label) values ('SK', 'Eastern Europe', 'Slovakia');
insert into dtl.countries (id, region_id, label) values ('UA', 'Eastern Europe', 'Ukraine');
insert into dtl.regions (id, label, ord) values ('Northern America', 'Northern America', 1);
insert into dtl.countries (id, region_id, label) values ('BM', 'Northern America', 'Bermuda');
insert into dtl.countries (id, region_id, label) values ('CA', 'Northern America', 'Canada');
insert into dtl.countries (id, region_id, label) values ('GL', 'Northern America', 'Greenland');
insert into dtl.countries (id, region_id, label) values ('PM', 'Northern America', 'Saint Pierre and Miquelon');
insert into dtl.countries (id, region_id, label) values ('US', 'Northern America', 'United States of America');
insert into dtl.regions (id, label, ord) values ('South-eastern Asia', 'South-eastern Asia', 13);
insert into dtl.countries (id, region_id, label) values ('BN', 'South-eastern Asia', 'Brunei Darussalam');
insert into dtl.countries (id, region_id, label) values ('KH', 'South-eastern Asia', 'Cambodia');
insert into dtl.countries (id, region_id, label) values ('ID', 'South-eastern Asia', 'Indonesia');
insert into dtl.countries (id, region_id, label) values ('LA', 'South-eastern Asia', 'Lao Peoples Democratic Republic');
insert into dtl.countries (id, region_id, label) values ('MY', 'South-eastern Asia', 'Malaysia');
insert into dtl.countries (id, region_id, label) values ('MM', 'South-eastern Asia', 'Myanmar');
insert into dtl.countries (id, region_id, label) values ('PH', 'South-eastern Asia', 'Philippines');
insert into dtl.countries (id, region_id, label) values ('SG', 'South-eastern Asia', 'Singapore');
insert into dtl.countries (id, region_id, label) values ('TH', 'South-eastern Asia', 'Thailand');
insert into dtl.countries (id, region_id, label) values ('TL', 'South-eastern Asia', 'Timor-Leste');
insert into dtl.countries (id, region_id, label) values ('VN', 'South-eastern Asia', 'Viet Nam');
insert into dtl.regions (id, label, ord) values ('Eastern Asia', 'Eastern Asia', 12);
insert into dtl.countries (id, region_id, label) values ('CN', 'Eastern Asia', 'China');
insert into dtl.countries (id, region_id, label) values ('HK', 'Eastern Asia', 'Hong Kong');
insert into dtl.countries (id, region_id, label) values ('JP', 'Eastern Asia', 'Japan');
insert into dtl.countries (id, region_id, label) values ('KP', 'Eastern Asia', 'Korea (Democratic Peoples Republic of)');
insert into dtl.countries (id, region_id, label) values ('KR', 'Eastern Asia', 'Korea (Republic of)');
insert into dtl.countries (id, region_id, label) values ('MO', 'Eastern Asia', 'Macao');
insert into dtl.countries (id, region_id, label) values ('MN', 'Eastern Asia', 'Mongolia');
insert into dtl.countries (id, region_id, label) values ('TW', 'Eastern Asia', 'Taiwan, Province of China');
insert into dtl.regions (id, label, ord) values ('Melanesia', 'Melanesia', 15);
insert into dtl.countries (id, region_id, label) values ('FJ', 'Melanesia', 'Fiji');
insert into dtl.countries (id, region_id, label) values ('NC', 'Melanesia', 'New Caledonia');
insert into dtl.countries (id, region_id, label) values ('PG', 'Melanesia', 'Papua New Guinea');
insert into dtl.countries (id, region_id, label) values ('SB', 'Melanesia', 'Solomon Islands');
insert into dtl.countries (id, region_id, label) values ('VU', 'Melanesia', 'Vanuatu');
insert into dtl.regions (id, label, ord) values ('Micronesia', 'Micronesia', 16);
insert into dtl.countries (id, region_id, label) values ('GU', 'Micronesia', 'Guam');
insert into dtl.countries (id, region_id, label) values ('KI', 'Micronesia', 'Kiribati');
insert into dtl.countries (id, region_id, label) values ('MH', 'Micronesia', 'Marshall Islands');
insert into dtl.countries (id, region_id, label) values ('FM', 'Micronesia', 'Micronesia (Federated States of)');
insert into dtl.countries (id, region_id, label) values ('NR', 'Micronesia', 'Nauru');
insert into dtl.countries (id, region_id, label) values ('MP', 'Micronesia', 'Northern Mariana Islands');
insert into dtl.countries (id, region_id, label) values ('PW', 'Micronesia', 'Palau');
insert into dtl.countries (id, region_id, label) values ('UM', 'Micronesia', 'United States Minor Outlying Islands');
insert into dtl.regions (id, label, ord) values ('Central Asia', 'Central Asia', 10);
insert into dtl.countries (id, region_id, label) values ('KZ', 'Central Asia', 'Kazakhstan');
insert into dtl.countries (id, region_id, label) values ('KG', 'Central Asia', 'Kyrgyzstan');
insert into dtl.countries (id, region_id, label) values ('TJ', 'Central Asia', 'Tajikistan');
insert into dtl.countries (id, region_id, label) values ('TM', 'Central Asia', 'Turkmenistan');
insert into dtl.countries (id, region_id, label) values ('UZ', 'Central Asia', 'Uzbekistan');
  `)
}

exports.down = async (knex) => {
  await knex.raw(`
    DROP TABLE dtl.regions;
    DROP TABLE dtl.countries;
  `)
}
