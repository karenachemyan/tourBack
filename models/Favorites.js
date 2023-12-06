import { DataTypes, Model } from "sequelize";
import sequelize from "../services/sequelize.js";
import Toures from "./Toures.js";
import Users from "./Users.js";

class Favorites extends Model { }

Favorites.init(
    {
        id: {
            type: DataTypes.BIGINT.UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
    },

    {
        sequelize,
        tableName: 'favorites',
        modelName: 'favorites',
        indexes: [
            {
                unique: true,
                fields: ['tourId', 'userId']
            }
        ]
    }
)

Favorites.belongsTo(Toures,
    {
        foreignKey: "tourId",
        onDelete: "CASCADE",
        onUpdate: 'CASCADE',
    })

Favorites.belongsTo(Users,
    {
        foreignKey: "userId",
        onDelete: "CASCADE",
        onUpdate: 'CASCADE',
    })

Toures.hasMany(Favorites, { foreignKey: "tourId" });
Users.hasMany(Favorites, { foreignKey: "userId" });

export default Favorites
