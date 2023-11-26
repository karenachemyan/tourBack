import { DataTypes, Model } from "sequelize";
import sequelize from "../services/sequelize.js";

class Destinations extends Model {

    static async sync(options) {
        await super.sync(options);
        await Destinations.findOrCreate({
            where: {
                id: 1
            },
            defaults: {
                id: 1,
                title: 'Shirak',
            }
        })

        await Destinations.findOrCreate({
            where: {
                id: 2
            },
            defaults: {
                id: 2,
                title: 'Lori',
            }
        })
        await Destinations.findOrCreate({
            where: {
                id: 3
            },
            defaults: {
                id: 3,
                title: 'Tavush',
            }
        })

        await Destinations.findOrCreate({
            where: {
                id: 4
            },
            defaults: {
                id: 4,
                title: 'Gegharquniq',
            }
        })

        await Destinations.findOrCreate({
            where: {
                id: 5
            },
            defaults: {
                id: 5,
                title: 'Kotayq',
            }
        })
        await Destinations.findOrCreate({
            where: {
                id: 6
            },
            defaults: {
                id: 6,
                title: 'Armavir',
            }
        })
        await Destinations.findOrCreate({
            where: {
                id: 7
            },
            defaults: {
                id: 7,
                title: 'Ararat',
            }
        })
        await Destinations.findOrCreate({
            where: {
                id: 8
            },
            defaults: {
                id: 8,
                title: 'Vayots Dzor',
            }
        })
        await Destinations.findOrCreate({
            where: {
                id: 9
            },
            defaults: {
                id: 9,
                title: 'Syuniq',
            }
        })
        await Destinations.findOrCreate({
            where: {
                id: 10
            },
            defaults: {
                id: 10,
                title: 'Aragatsotn',
            }
        })

    }

}

Destinations.init({
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

},
    {
        sequelize,
        tableName: 'destinations',
        modelName: 'destinations'
    })

export default Destinations;