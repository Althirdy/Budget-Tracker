<?php

use yii\db\Migration;

/**
 * Handles the creation of table `{{%user_refresh_tokens}}`.
 */
class m260713_051351_create_users_refrsh_tokens_table extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
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

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->dropForeignKey('fk-user_refresh_tokens-user_id', '{{%user_refresh_tokens}}');
        $this->dropTable('{{%user_refresh_tokens}}');
    }
}
