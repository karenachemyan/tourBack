import { DataTypes, Model } from "sequelize";
import sequelize from "../services/sequelize.js";
import Toures from './Toures.js'

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
        allowNull: false
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
Rates.hasMany(Toures, { foreignKey: "tourId" });

export default Rates;