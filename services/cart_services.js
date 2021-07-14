const { CartItem } = require('../models');
const { getCartItems, getCartItemByUserAndPoster, addCartItem } = require('../dal/cart_items')

class CartServices {
    constructor(user_id) {
        this.user_id = user_id;
    }

    async addToCart(posterId) {
        // check if item already exist
        let cartItem = await getCartItemByUserAndPoster (this.user_id, posterId)

        // create item does not exist in cart, add to db
        if (!cartItem) {
            cartItem = await addCartItem(this.user_id, posterId, 1);
        // if exist in cart, increase quantity
        } else {
            cartItem.set('quantity', cartItem.get('quantity') + 1)
            await cartItem.save();
            return cartItem;
        }
    }

    async getCart(){
        let cartItems = await getCartItems(this.user_id)
        return cartItems
    }

    async remove(posterId) {
        let cartItem = await getCartItemByUserAndPoster(this.user_id, posterId);
        if (cartItem) {
            await cartItem.destroy();
            return true;
        }
        return false;
    }

    async setQuantity (posterId, newQuantity) {
        // check if item already exist
        let cartItem = await getCartItemByUserAndPoster(this.user_id, posterId)
        if (cartItem) {
            cartItem.set('quantity', newQuantity);
            await cartItem.save();
            return cartItem;
        }
        return null;
    }


}

module.exports = CartServices;