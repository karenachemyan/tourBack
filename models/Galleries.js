import { DataTypes, Model } from "sequelize";
import sequelize from "../services/sequelize.js";
import Toures from './Toures.js'

class Galleries extends Model { }

Galleries.init({
    id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    src: {
        type: DataTypes.STRING(255),
        allowNull: false
    }
},

    {
        sequelize,
        tableName: 'galleries',
        modelName: 'galleries'
    }
)

Galleries.belongsTo(Toures,
    {
        foreignKey: "tourId",
        onDelete: "CASCADE",
        onUpdate: 'CASCADE',
    })

Toures.hasMany(Galleries,
    {
        foreignKey: 'tourId',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    });

export default Galleries;