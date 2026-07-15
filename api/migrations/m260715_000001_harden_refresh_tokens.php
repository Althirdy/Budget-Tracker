<?php

use yii\db\Migration;

class m260715_000001_harden_refresh_tokens extends Migration
{
    public function safeUp(): void
    {
        $this->addColumn('{{%user_refresh_tokens}}', 'family_id', $this->string(64)->null()->after('token_hash'));
        $this->addColumn('{{%user_refresh_tokens}}', 'replaced_by_id', $this->integer()->null()->after('family_id'));
        $this->createIndex('idx-refresh-token-family', '{{%user_refresh_tokens}}', 'family_id');
        $this->addForeignKey(
            'fk-refresh-token-replacement',
            '{{%user_refresh_tokens}}',
            'replaced_by_id',
            '{{%user_refresh_tokens}}',
            'id',
            'SET NULL'
        );
    }

    public function safeDown(): void
    {
        $this->dropForeignKey('fk-refresh-token-replacement', '{{%user_refresh_tokens}}');
        $this->dropIndex('idx-refresh-token-family', '{{%user_refresh_tokens}}');
        $this->dropColumn('{{%user_refresh_tokens}}', 'replaced_by_id');
        $this->dropColumn('{{%user_refresh_tokens}}', 'family_id');
    }
}
