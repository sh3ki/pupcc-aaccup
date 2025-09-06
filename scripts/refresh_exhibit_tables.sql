-- Drop existing exhibit tables
DROP TABLE IF EXISTS `exhibit_ched_memorandum_order`;
DROP TABLE IF EXISTS `exhibit_copc`;
DROP TABLE IF EXISTS `exhibit_bor`;
DROP TABLE IF EXISTS `exhibit_psv`;
DROP TABLE IF EXISTS `exhibit_obe_syllabi`;
DROP TABLE IF EXISTS `exhibit_instructional_materials`;

-- Remove migration records
DELETE FROM `migrations` WHERE `migration` = '2025_08_16_225212_create_exhibit_ched_memorandum_order_table';
DELETE FROM `migrations` WHERE `migration` = '2025_09_03_091629_create_exhibit_copc_table';
DELETE FROM `migrations` WHERE `migration` = '2025_09_03_091750_create_exhibit_bor_table';
DELETE FROM `migrations` WHERE `migration` = '2025_09_03_091821_create_exhibit_psv_table';
DELETE FROM `migrations` WHERE `migration` = '2025_08_16_225216_create_exhibit_obe_syllabi_table';
DELETE FROM `migrations` WHERE `migration` = '2025_08_16_225214_create_exhibit_instructional_materials_table';

-- Note: After running this SQL, you need to run:
-- php artisan migrate --path=database/migrations/2025_08_16_225212_create_exhibit_ched_memorandum_order_table.php
-- php artisan migrate --path=database/migrations/2025_09_03_091629_create_exhibit_copc_table.php
-- php artisan migrate --path=database/migrations/2025_09_03_091750_create_exhibit_bor_table.php
-- php artisan migrate --path=database/migrations/2025_09_03_091821_create_exhibit_psv_table.php
-- php artisan migrate --path=database/migrations/2025_08_16_225216_create_exhibit_obe_syllabi_table.php
-- php artisan migrate --path=database/migrations/2025_08_16_225214_create_exhibit_instructional_materials_table.php
