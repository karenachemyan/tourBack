import { DataTypes, Model } from "sequelize";
import sequelize from "../services/sequelize.js";
import Users from "./Users";

class UserSettings extends Model { }

UserSettings.init({
    id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    recoveryCode: {
        type: DataTypes.INTEGER(6),
        allowNull: false
    }
},
    {
        sequelize,
        tableName: 'usersettings',
        modelName: 'usersettings'
    })

UserSettings.belongsTo(Users,
    {
        foreignKey: "userId",
        onDelete: "CASCADE",
        onUpdate: 'CASCADE',
    });
Users.hasMany(UserSettings, { foreignKey: "userId" });

export default UserSettings;