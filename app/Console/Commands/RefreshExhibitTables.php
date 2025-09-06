<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class RefreshExhibitTables extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'exhibit:refresh-tables {--force : Force the operation without confirmation}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Drop and recreate specific exhibit tables (exhibit_ched_memorandum_order, exhibit_copc, exhibit_bor, exhibit_psv, exhibit_obe_syllabi, exhibit_instructional_materials)';

    /**
     * The tables to refresh
     */
    protected $tables = [
        'exhibit_ched_memorandum_order',
        'exhibit_copc',
        'exhibit_bor',
        'exhibit_psv',
        'exhibit_obe_syllabi',
        'exhibit_instructional_materials'
    ];

    /**
     * The corresponding migration files
     */
    protected $migrations = [
        '2025_08_16_225212_create_exhibit_ched_memorandum_order_table',
        '2025_09_03_091629_create_exhibit_copc_table',
        '2025_09_03_091750_create_exhibit_bor_table',
        '2025_09_03_091821_create_exhibit_psv_table',
        '2025_08_16_225216_create_exhibit_obe_syllabi_table',
        '2025_08_16_225214_create_exhibit_instructional_materials_table'
    ];

    /**
     * Execute the console command.
     */
    public function handle()
    {
        if (!$this->option('force')) {
            $this->warn('This will drop and recreate the following tables:');
            foreach ($this->tables as $table) {
                $this->line("  - {$table}");
            }
            
            if (!$this->confirm('Do you want to continue?')) {
                $this->info('Operation cancelled.');
                return;
            }
        }

        $this->info('Starting exhibit tables refresh...');

        // Drop existing tables
        $this->dropTables();

        // Remove migration records
        $this->removeMigrationRecords();

        // Run specific migrations
        $this->runMigrations();

        $this->info('Exhibit tables refreshed successfully!');
    }

    /**
     * Drop the existing tables
     */
    protected function dropTables()
    {
        $this->info('Dropping existing tables...');
        
        foreach ($this->tables as $table) {
            if (Schema::hasTable($table)) {
                Schema::dropIfExists($table);
                $this->line("  ✓ Dropped table: {$table}");
            } else {
                $this->line("  - Table {$table} does not exist");
            }
        }
    }

    /**
     * Remove migration records from migrations table
     */
    protected function removeMigrationRecords()
    {
        $this->info('Removing migration records...');
        
        foreach ($this->migrations as $migration) {
            $deleted = DB::table('migrations')->where('migration', $migration)->delete();
            if ($deleted > 0) {
                $this->line("  ✓ Removed migration record: {$migration}");
            } else {
                $this->line("  - Migration record {$migration} not found");
            }
        }
    }

    /**
     * Run the specific migrations
     */
    protected function runMigrations()
    {
        $this->info('Running migrations...');
        
        foreach ($this->migrations as $migration) {
            $this->call('migrate', [
                '--path' => 'database/migrations/' . $migration . '.php',
                '--force' => true
            ]);
        }
    }
}
