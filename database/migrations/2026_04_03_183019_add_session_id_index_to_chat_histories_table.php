<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Check if index exists (database-agnostic approach)
        $connection = Schema::getConnection();
        $indexExists = false;

        if ($connection->getDriverName() === 'pgsql') {
            $exists = DB::select("
                SELECT 1 FROM pg_indexes 
                WHERE tablename = 'chat_histories' 
                AND indexname = 'chat_histories_session_id_index'
            ");
            $indexExists = ! empty($exists);
        } elseif ($connection->getDriverName() === 'sqlite') {
            // SQLite: Check via pragma
            $indexes = DB::select("PRAGMA index_list('chat_histories')");
            foreach ($indexes as $index) {
                if ($index->name === 'chat_histories_session_id_index') {
                    $indexExists = true;
                    break;
                }
            }
        } else {
            // MySQL: Check information_schema
            $exists = DB::select("
                SELECT 1 FROM information_schema.statistics 
                WHERE table_schema = DATABASE() 
                AND table_name = 'chat_histories' 
                AND index_name = 'chat_histories_session_id_index'
            ");
            $indexExists = ! empty($exists);
        }

        if (! $indexExists) {
            Schema::table('chat_histories', function (Blueprint $table) {
                $table->index('session_id', 'chat_histories_session_id_index');
            });
        }
    }

    public function down(): void
    {
        Schema::table('chat_histories', function (Blueprint $table) {
            $table->dropIndex(['session_id']);
        });
    }
};
