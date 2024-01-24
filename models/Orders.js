import { DataTypes, Model } from "sequelize";
import sequelize from "../services/sequelize.js";
import Users from './Users.js';
import TourSchedules from './TourSchedules.js'

class Orders extends Model {
    get participants() {
        return this.adult + this.children3to10 + this.children11up;
    }

    static init(modelAttributes, modelOptions) {
        super.init(modelAttributes, modelOptions);
        this.addHook('beforeSave', (order, options) => {
            order.participants = order.adult + order.children3to10 + order.children11up;
        });
        return this;
    }
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
    },
    adult: {
        type: DataTypes.INTEGER(3),
        defaultValue: 0
    },
    children3to10: {
        type: DataTypes.INTEGER(3),
        defaultValue: 0
    },
    children11up: {
        type: DataTypes.INTEGER(3),
        defaultValue: 0
    },
    participants: {
        type: DataTypes.INTEGER(3),
        defaultValue: 0
    },
    gid: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    status: {
        type:DataTypes.ENUM('pending','active'),
        defaultValue:'pending',
        allowNull:false,
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

Orders.sync({alter:true})

export default Orders