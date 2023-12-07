class OrdersController{

    static async order(req,res,next){
        try{

            const {tourDate, totalPrice, participants} = req.body;
            const {tourId} = req.params;
            const userId = req.userId;

        }
        catch(e){
            next(e)
        }

    }

    static async checkout(req,res,next){
        try{

        }
        catch(e){
            next(e);
        }

    }

}

export default OrdersController