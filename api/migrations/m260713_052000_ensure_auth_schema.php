<?php

use yii\db\Expression;
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

        if ($usersTable !== null) {
            $existingAdmin = (new \yii\db\Query())
                ->from('{{%users}}')
                ->where(['or', ['email' => 'admin@example.test'], ['username' => 'admin']])
                ->exists($this->db);

            if (!$existingAdmin) {
                $now = new Expression('CURRENT_TIMESTAMP');
                $this->insert('{{%users}}', [
                    'email' => 'admin@example.test',
                    'username' => 'admin',
                    'password_hash' => Yii::$app->security->generatePasswordHash('admin123'),
                    'first_name' => 'Admin',
                    'last_name' => 'User',
                    'default_currency' => 'PHP',
                    'role' => 1,
                    'is_active' => true,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }
        }
    }

    public function safeDown(): void
    {
        $this->delete('{{%users}}', ['email' => 'admin@example.test']);

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
