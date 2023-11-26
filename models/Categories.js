import { DataTypes, Model } from "sequelize";
import sequelize from "../services/sequelize.js";

class Categories extends Model {

}

Categories.init({
    id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    title: {
        type:DataTypes.STRING(255),
        allowNull:false,
    },
    icon:{
        type:DataTypes.STRING(255),
        allowNull:false,
    }
},
    {
        sequelize,
        tableName: 'categories',
        modelName: 'categories'
    })

export default Categories;