import { DataTypes, Model } from "sequelize";
import sequelize from "../services/sequelize.js";
import Toures from './Toures.js'

class TourSchedules extends Model { }

TourSchedules.init({
    id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false
    }
},

    {
        sequelize,
        tableName: 'tourschedules',
        modelName: 'tourschedules'
    }
)

TourSchedules.belongsTo(Toures,
    {
        foreignKey: "tourId",
        onDelete: "CASCADE",
        onUpdate: 'CASCADE',
    })
TourSchedules.hasMany(Toures, { foreignKey: "tourId" });

export default TourSchedules;