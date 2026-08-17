const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Korisnik', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    ime: { type: DataTypes.STRING, allowNull: false },
    prezime: { type: DataTypes.STRING, allowNull: false },
    username: { type: DataTypes.STRING, unique: true, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
    admin: { type: DataTypes.BOOLEAN, defaultValue: false },
    email: { type: DataTypes.STRING(255), unique: true, allowNull: true },
    emailVerifiedAt: { type: DataTypes.DATE, allowNull: true },
    emailVerificationTokenHash: { type: DataTypes.STRING(64), allowNull: true },
    emailVerificationExpiresAt: { type: DataTypes.DATE, allowNull: true },
    passwordResetTokenHash: { type: DataTypes.STRING(64), allowNull: true },
    passwordResetExpiresAt: { type: DataTypes.DATE, allowNull: true },
    systemRole: { type: DataTypes.ENUM('USER', 'ANALYST', 'MODERATOR', 'SUPER_ADMIN'), defaultValue: 'USER' },
    suspendedAt: { type: DataTypes.DATE, allowNull: true },
    suspendedUntil: { type: DataTypes.DATE, allowNull: true },
    suspensionReason: { type: DataTypes.STRING(500), allowNull: true },
    deletedAt: { type: DataTypes.DATE, allowNull: true },
  }, {
    freezeTableName: true,
    tableName: 'korisnik',
  });
};
