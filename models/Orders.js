import { DataTypes, Model } from "sequelize";
import sequelize from "../services/sequelize.js";
import Users from './Users.js';
import TourSchedules from './TourSchedules.js'

class Orders extends Model {

}

Orders.init({
    id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    totalAmount: {
        type: DataTypes.FLOAT(10, 2),
        allowNull: false,
    }

},
    {
        sequelize,
        tableName: 'orders',
        modelName: 'orders'
    });

Orders.belongsTo(Users,
    {
        foreignKey: "userId",
        onDelete: "CASCADE",
        onUpdate: 'CASCADE',
    });

Orders.belongsTo(TourSchedules,
    {
        foreignKey: "tourScheduleId",
        onDelete: "CASCADE",
        onUpdate: 'CASCADE',
    });

Users.hasMany(Orders, { foreignKey: "userId" });
TourSchedules.hasMany(Orders, { foreignKey: "tourScheduleId" });

export default Orders