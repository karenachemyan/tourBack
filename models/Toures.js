import { DataTypes, Model } from "sequelize";
import sequelize from "../services/sequelize.js";
import Categories from "./Categories.js";
import Destinations from "./Destinations.js";

class Toures extends Model {

}

Toures.init({
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
        allowNull: false,
    },
    price: {
        type: DataTypes.FLOAT(10, 2),
        allowNull: false,
    },
    duration: {
        type: DataTypes.INTEGER(7),
        allowNull: false,
    },
    featuredImage: {
        type: DataTypes.STRING(255),
        allowNull: false,
    }
},
    {
        sequelize,
        tableName: 'toures',
        modelName: 'toures'
    })

Toures.belongsTo(Categories,
    {
        foreignKey: "categoryId",
        onDelete: "CASCADE",
        onUpdate: 'CASCADE',
    });
Toures.belongsTo(Destinations,
    {
        foreignKey: "destinationId",
        onDelete: "CASCADE",
        onUpdate: 'CASCADE',
    });
    

Categories.hasMany(Toures, { foreignKey: "categoryId" });
Destinations.hasMany(Toures, { foreignKey: 'destinationId' })

export default Toures;