import { DataTypes, Model } from "sequelize";
import sequelize from "../services/sequelize.js";
import Toures from "./Toures";

class TourSteps extends Model { }

TourSteps.init({

    id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT('long'),
        allowNull: false
    }

},
    {
        sequelize,
        tableName: 'toursteps',
        modelName: 'toursteps'
    })

TourSteps.belongsTo(Toures,
    {
        foreignKey: "tourId",
        onDelete: "CASCADE",
        onUpdate: 'CASCADE',
    });

Toures.hasMany(TourSteps, { foreignKey: "tourId" });

export default TourSteps;