import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Initial RAG schema.
 *
 * Creates the pgvector extension, the documents / document_chunks / conversations /
 * messages tables, and an HNSW cosine index over chunk embeddings.
 *
 * NOTE: the embedding vector dimension is fixed at 768 to match EMBEDDING_DIMENSIONS,
 * which the embedding service requests from `gemini-embedding-001` via
 * outputDimensionality. If you change the embedding model/dimension, update the
 * `vector(768)` column type accordingly.
 */
export class InitRagSchema1717600000000 implements MigrationInterface {
  public name = 'InitRagSchema1717600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "vector";`);

    await queryRunner.query(`
      CREATE TABLE "documents" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "title" varchar(512) NOT NULL,
        "source" varchar(1024),
        "status" varchar(32) NOT NULL DEFAULT 'pending',
        "content" text NOT NULL,
        "metadata" jsonb,
        "chunk_count" integer NOT NULL DEFAULT 0,
        "error" text,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_documents" PRIMARY KEY ("id")
      );
    `);
    await queryRunner.query(`CREATE INDEX "IDX_documents_status" ON "documents" ("status");`);
    await queryRunner.query(`CREATE INDEX "IDX_documents_created_at" ON "documents" ("created_at");`);

    await queryRunner.query(`
      CREATE TABLE "document_chunks" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "document_id" uuid NOT NULL,
        "chunk_index" integer NOT NULL,
        "content" text NOT NULL,
        "token_count" integer NOT NULL DEFAULT 0,
        "metadata" jsonb,
        "embedding" vector(768),
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_document_chunks" PRIMARY KEY ("id"),
        CONSTRAINT "FK_document_chunks_document" FOREIGN KEY ("document_id")
          REFERENCES "documents" ("id") ON DELETE CASCADE
      );
    `);
    await queryRunner.query(`CREATE INDEX "IDX_document_chunks_document_id" ON "document_chunks" ("document_id");`);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_document_chunks_doc_index" ON "document_chunks" ("document_id", "chunk_index");`,
    );
    // Approximate-nearest-neighbour index for cosine distance (<=>).
    await queryRunner.query(`
      CREATE INDEX "IDX_document_chunks_embedding_hnsw"
      ON "document_chunks"
      USING hnsw ("embedding" vector_cosine_ops);
    `);

    await queryRunner.query(`
      CREATE TABLE "conversations" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "title" varchar(512),
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_conversations" PRIMARY KEY ("id")
      );
    `);

    await queryRunner.query(`
      CREATE TABLE "messages" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "conversation_id" uuid NOT NULL,
        "role" varchar(16) NOT NULL,
        "content" text NOT NULL,
        "sources" jsonb,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_messages" PRIMARY KEY ("id"),
        CONSTRAINT "FK_messages_conversation" FOREIGN KEY ("conversation_id")
          REFERENCES "conversations" ("id") ON DELETE CASCADE
      );
    `);
    await queryRunner.query(`CREATE INDEX "IDX_messages_conversation_id" ON "messages" ("conversation_id");`);
    await queryRunner.query(`CREATE INDEX "IDX_messages_created_at" ON "messages" ("created_at");`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "messages";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "conversations";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "document_chunks";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "documents";`);
  }
}
