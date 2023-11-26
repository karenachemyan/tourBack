import { Users, Categories, Destinations,Toures, Rates, Galleries,TourSchedules, Orders} from "./models/index.js";

async function main(){
    await Users.sync({alter:true, logging:true});
    await Categories.sync({alter:true, logging:true});
    await Destinations.sync({alter:true, logging:true});
    await Toures.sync({alter:true, logging:true});
    await Rates.sync({alter:true, logging:true});
    await Galleries.sync({alter:true, logging:true});
    await TourSchedules.sync({alter:true, logging:true});
    await Orders.sync({alter:true, logging:true});
    
    process.exit(0);
}
main();