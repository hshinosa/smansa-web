<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Disable automatic transaction wrapping for this migration
     * This allows pgvector extension creation to fail gracefully without aborting the entire migration
     */
    public $withinTransaction = false;

    /**
     * Create AI and RAG (Retrieval-Augmented Generation) tables
     * Using PostgreSQL pgvector for embedding storage instead of Qdrant
     */
    public function up(): void
    {
        // AI Settings
        Schema::create('ai_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->string('type')->default('string'); // string, boolean, integer, json
            $table->string('embedding_provider')->default('openai');
            $table->timestamps();
        });

        // RAG Documents (Knowledge Base)
        Schema::create('rag_documents', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('content')->nullable();
            $table->text('excerpt')->nullable();
            $table->string('file_path')->nullable();
            $table->string('file_type')->default('text'); // pdf, text, url
            $table->unsignedBigInteger('file_size')->nullable();
            $table->string('source')->nullable();
            $table->string('category')->nullable();
            $table->json('metadata')->nullable();
            $table->boolean('is_active')->default(true);
            $table->boolean('is_processed')->default(false);
            // vector_id field removed - not needed with pgvector
            $table->unsignedBigInteger('uploaded_by')->nullable();
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('is_active');
            $table->index('is_processed');
            $table->index('category');
        });

        // RAG Document Chunks (for vector embeddings with pgvector)
        Schema::create('rag_document_chunks', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('document_id');
            $table->text('content');
            $table->integer('chunk_index');
            $table->integer('token_count')->nullable();
            // embedding column will be added via raw SQL after table creation
            $table->timestamps();
            
            $table->foreign('document_id')->references('id')->on('rag_documents')->onDelete('cascade');
            $table->index('document_id');
        });

        // Add embedding column for non-pgsql drivers (like sqlite in tests)
        if (DB::connection()->getDriverName() !== 'pgsql') {
            Schema::table('rag_document_chunks', function (Blueprint $table) {
                $table->text('embedding')->nullable();
            });
        }

        // Add pgvector support for PostgreSQL (if available)
        if (DB::connection()->getDriverName() === 'pgsql') {
            $vectorEnabled = false;

            try {
                // Try to enable pgvector extension in a separate transaction
                DB::unprepared('CREATE EXTENSION IF NOT EXISTS vector');
                $vectorEnabled = true;
                echo "✓ pgvector extension enabled\n";
            } catch (\Exception $e) {
                // Extension creation failed (likely needs superuser) - use fallback
                echo "⚠ Could not enable pgvector extension: " . $e->getMessage() . "\n";
                echo "  RAG will work with limited functionality using TEXT storage\n";
            }

            if ($vectorEnabled) {
                try {
                    // Add vector column (768 dimensions for Ollama nomic-embed-text:v1.5)
                    DB::statement('ALTER TABLE rag_document_chunks ADD COLUMN embedding vector(768)');

                    // Create HNSW index for fast approximate nearest neighbor search
                    DB::statement('CREATE INDEX rag_document_chunks_embedding_idx ON rag_document_chunks USING hnsw (embedding vector_cosine_ops)');

                    echo "✓ pgvector configured with HNSW index\n";
                } catch (\Exception $e) {
                    echo "⚠ Could not configure pgvector: " . $e->getMessage() . "\n";
                    // Fall back to TEXT column
                    DB::statement('ALTER TABLE rag_document_chunks ADD COLUMN embedding TEXT');
                }
            } else {
                // Add regular text column as fallback (will store JSON string)
                DB::statement('ALTER TABLE rag_document_chunks ADD COLUMN embedding TEXT');
                echo "✓ Using TEXT column for embeddings (fallback mode)\n";
            }
        }

        // Chat Histories
        Schema::create('chat_histories', function (Blueprint $table) {
            $table->id();
            $table->string('session_id')->index();
            $table->string('ip_address')->nullable();
            $table->string('user_agent')->nullable();
            $table->string('sender'); // 'user', 'bot'
            $table->text('message');
            $table->json('metadata')->nullable();
            $table->boolean('is_rag_enhanced')->default(false);
            $table->json('retrieved_documents')->nullable();
            $table->timestamps();

            // Indexes
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop tables in reverse order
        Schema::dropIfExists('chat_histories');
        
        // Drop pgvector extension if it exists
        if (DB::connection()->getDriverName() === 'pgsql') {
            DB::statement('DROP EXTENSION IF EXISTS vector CASCADE');
        }
        
        Schema::dropIfExists('rag_document_chunks');
        Schema::dropIfExists('rag_documents');
        Schema::dropIfExists('ai_settings');
    }
};
