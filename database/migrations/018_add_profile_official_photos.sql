ALTER TABLE village_profile_officials
  ADD COLUMN photo_url VARCHAR(500) NULL AFTER area,
  ADD COLUMN photo_alt VARCHAR(220) NULL AFTER photo_url;
