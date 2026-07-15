<?php

declare(strict_types=1);

namespace app\modules\auth\models;

use yii\db\ActiveRecord;

/**
 * @property int $id
 * @property int $user_id
 * @property string $token_hash
 * @property string $expires_at
 * @property string|null $revoked_at
 * @property string|null $family_id
 * @property int|null $replaced_by_id
 * @property string $created_at
 * @property string $updated_at
 */
class UserRefreshToken extends ActiveRecord
{
    public static function tableName(): string
    {
        return '{{%user_refresh_tokens}}';
    }

    public static function hashToken(string $token): string
    {
        return hash('sha256', $token);
    }

    public static function findValidToken(string $token): self|null
    {
        return self::find()
            ->where(['token_hash' => self::hashToken($token), 'revoked_at' => null])
            ->andWhere(['>', 'expires_at', gmdate('Y-m-d H:i:s')])
            ->one();
    }

    public static function findToken(string $token): self|null
    {
        return self::findOne(['token_hash' => self::hashToken($token)]);
    }

    public function revoke(): bool
    {
        $now = gmdate('Y-m-d H:i:s');
        $this->revoked_at = $now;
        $this->updated_at = $now;

        return $this->save(false, ['revoked_at', 'updated_at']);
    }

    public function revokeOnce(): bool
    {
        $now = gmdate('Y-m-d H:i:s');

        return self::updateAll(
            ['revoked_at' => $now, 'updated_at' => $now],
            ['id' => $this->id, 'revoked_at' => null]
        ) === 1;
    }

    public static function revokeFamily(string|null $familyId): void
    {
        if ($familyId === null || $familyId === '') {
            return;
        }

        $now = gmdate('Y-m-d H:i:s');
        self::updateAll(
            ['revoked_at' => $now, 'updated_at' => $now],
            ['family_id' => $familyId, 'revoked_at' => null]
        );
    }
}
