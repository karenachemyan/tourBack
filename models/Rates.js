import { DataTypes, Model } from "sequelize";
import sequelize from "../services/sequelize.js";
import Toures from './Toures.js'
import Users from "./Users.js";

class Rates extends Model { }

Rates.init({
    id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    rate: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: 0
    }
},

    {
        sequelize,
        tableName: 'rates',
        modelName: 'rates'
    }
)

Rates.belongsTo(Toures,
    {
        foreignKey: "tourId",
        onDelete: "CASCADE",
        onUpdate: 'CASCADE',
    })

Rates.belongsTo(Users,
    {
        foreignKey: "userId",
        onDelete: "CASCADE",
        onUpdate: 'CASCADE',
    })

Toures.hasMany(Rates, { foreignKey: "tourId" });
Users.hasMany(Rates, { foreignKey: "userId" });

export default Rates;