<?php

use yii\db\Migration;

class m260713_052000_ensure_auth_schema extends Migration
{
    public function safeUp(): void
    {
        $usersTable = $this->db->schema->getTableSchema('{{%users}}', true);
        if ($usersTable !== null && $usersTable->getColumn('role') === null) {
            $this->addColumn('{{%users}}', 'role', $this->smallInteger()->notNull()->defaultValue(2)->after('default_currency'));
        }

        if ($this->db->schema->getTableSchema('{{%users_refrsh_tokens}}', true) !== null) {
            $this->dropTable('{{%users_refrsh_tokens}}');
        }

        if ($this->db->schema->getTableSchema('{{%user_refresh_tokens}}', true) === null) {
            $this->createTable('{{%user_refresh_tokens}}', [
                'id' => $this->primaryKey(),
                'user_id' => $this->integer()->notNull(),
                'token_hash' => $this->string(128)->notNull()->unique(),
                'expires_at' => $this->timestamp()->notNull(),
                'revoked_at' => $this->timestamp()->null(),
                'created_at' => $this->timestamp()->notNull(),
                'updated_at' => $this->timestamp()->notNull(),
            ]);

            $this->createIndex(
                'idx-user_refresh_tokens-user_id',
                '{{%user_refresh_tokens}}',
                'user_id'
            );

            $this->addForeignKey(
                'fk-user_refresh_tokens-user_id',
                '{{%user_refresh_tokens}}',
                'user_id',
                '{{%users}}',
                'id',
                'CASCADE'
            );
        }

    }

    public function safeDown(): void
    {
        if ($this->db->schema->getTableSchema('{{%user_refresh_tokens}}', true) !== null) {
            $this->dropForeignKey('fk-user_refresh_tokens-user_id', '{{%user_refresh_tokens}}');
            $this->dropTable('{{%user_refresh_tokens}}');
        }

        $usersTable = $this->db->schema->getTableSchema('{{%users}}', true);
        if ($usersTable !== null && $usersTable->getColumn('role') !== null) {
            $this->dropColumn('{{%users}}', 'role');
        }
    }
}
