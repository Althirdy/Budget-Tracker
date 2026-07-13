<?php

declare(strict_types=1);

namespace app\models;

use yii\db\ActiveRecord;
use yii\web\IdentityInterface;

/**
 * @property int $id
 * @property string $email
 * @property string $username
 * @property string $password_hash
 * @property string $first_name
 * @property string $last_name
 * @property string $default_currency
 * @property int $role
 * @property bool $is_active
 * @property string|null $email_verified_at
 * @property string|null $last_login_at
 * @property string $created_at
 * @property string $updated_at
 */
class User extends ActiveRecord implements IdentityInterface
{
    public const ROLE_ADMIN = 1;
    public const ROLE_USER = 2;

    public static function tableName(): string
    {
        return '{{%users}}';
    }

    public static function findIdentity($id): static|null
    {
        return static::find()
            ->where(['id' => $id, 'is_active' => true])
            ->one();
    }

    public static function findIdentityByAccessToken($token, $type = null): static|null
    {
        return null;
    }

    public static function findByUsername(string $username): static|null
    {
        return static::find()
            ->where(['username' => $username, 'is_active' => true])
            ->one();
    }

    public static function findByLogin(string $login): static|null
    {
        return static::find()
            ->where(['is_active' => true])
            ->andWhere(['or', ['username' => $login], ['email' => $login]])
            ->one();
    }

    public function getId(): int
    {
        return (int) $this->id;
    }

    public function getAuthKey(): string|null
    {
        return null;
    }

    public function validateAuthKey($authKey): bool
    {
        return false;
    }

    public function getPasswordHash(): string
    {
        return $this->password_hash;
    }

    public function isAdmin(): bool
    {
        return (int) $this->role === self::ROLE_ADMIN;
    }

    public function isUser(): bool
    {
        return (int) $this->role === self::ROLE_USER;
    }

    public function getRoleName(): string
    {
        return match ((int) $this->role) {
            self::ROLE_ADMIN => 'admin',
            self::ROLE_USER => 'user',
            default => 'unknown',
        };
    }
}
